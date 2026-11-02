// Pure crash-game logic. No React, no DOM. Demo / virtual credits only.

export type Phase = "WAITING" | "COUNTDOWN" | "RUNNING" | "CRASHED" | "ROUND_RESET";
export type BetStatus = "pending" | "active" | "cashed" | "lost";

export interface Bet {
  roundId: number;
  amount: number;
  status: BetStatus;
  payout: number;
  cashedAt: number | null;
}

export interface BotBet {
  id: number;
  name: string;
  amount: number;
  target: number;
  delayMs: number;
  isPlaced: boolean;
  cashed: boolean;
  lost: boolean;
}

export interface GameRecord {
  roundId: number;
  amount: number;
  crashPoint: number;
  cashedAt: number | null;
  payout: number;
  win: boolean;
  ts: number;
}

export interface GameState {
  phase: Phase;
  phaseStartedAt: number;
  roundId: number;
  crashPoint: number;
  multiplier: number;
  countdown: number;
  bots: BotBet[];
  // persisted
  balance: number;
  stars: number;
  stake: number;
  autoBet: boolean;
  autoCash: boolean;
  autoTarget: number;
  bet: Bet | null;
  history: number[];
  games: GameRecord[];
  claimed: string[];
  lastVisit: string;
  seed: number;
}

export const TIMING = { WAITING: 1500, COUNTDOWN: 5000, CRASHED: 2200, ROUND_RESET: 1300 };
export const GROWTH = 0.12; // multiplier = e^(GROWTH * seconds)
export const MIN_STAKE = 10;
export const STAKE_STEP = 10;
export const START_BALANCE = 0;

export const multiplierAt = (elapsedMs: number) =>
  Math.floor(Math.exp((GROWTH * Math.max(0, elapsedMs)) / 1000) * 100) / 100;

export const timeToReach = (m: number) => (Math.log(m) / GROWTH) * 1000;

// Deterministic demo crash point from seed (mulberry32). Not provably fair.
export function nextCrash(seed: number): { crash: number; seed: number } {
  let t = (seed + 0x6d2b79f5) | 0;
  let r = Math.imul(t ^ (t >>> 15), 1 | t);
  r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
  const u = ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  const crash = Math.min(30, Math.max(1.01, Math.floor((0.97 / (1 - u)) * 100) / 100));
  return { crash, seed: t };
}

// 250 реалистичных ников
const BOT_NAMES = [
  // Английский сленг, мемы и "крутые" словечки (очень часто)
  "notyourboy", "crypto_king", "rich_boy", "sigma", "alpha_male", "lil_peep", "toxic_boy", "sad_boy", "bad_girl", "lil_bitch",
  "fuck_cancer", "no_way", "ez_win", "gg_wp", "pro_player", "im_rich",
  "money_maker", "cash_out", "bet_win", "lucky_man", "son_of_a_bitch",
  
  // Тик-ток / стримерский стиль (часто с "x", "z", "q")
  "xxtentacion", "lil_uzi", "travis_scott", "drake", "kanye", "zxc_ghoul",
  "shadow_fiend", "cyber_punk", "neon_night", "dark_side", "light_yagami", "l_death_note", "goku_ultra", "naruto_uzumaki", "sasuke_uchiha", "itachi",
  "sukuna", "yuji", "megumi", "eren_yeager", "levi_ackerman", "mikasa", "armin", "erwin",
  
  // Странные, глупые или бессмысленные словосочетания
  "fat_cat", "ugly_boy", "stupid_girl", "braindead", "retard", "moron", "idiot", "genius", "smart_ass", "dumb_ass",
  "flying_pig", "purple_monkey", "blue_whale", "pink_panther", "black_cat", "white_dog", "green_frog", "yellow_bird", "red_fox", "orange_cat",
  "spider_man", "batman", "superman", "iron_man",  "captain_america", "black_widow", "hawk_eye",
  
  // Слова с "AI" или "GPT" (тренд)
  "chat_gpt", "midjourney", "stable_diff", "neural_net", "deep_learn", "machine_learn", "data_sci", "big_data", "cloud_comp", "quantum",
  "ai_bot", "ai_god", "human_ai", "cyborg", "terminator", "matrix", "morpheus", "trinity", "agent_smith",
  
  // Русские слова на латинице (транслит) - классика ТГ
  "privet", "kak_dela", "horosho", "normalno", "krasavchik",
  "devushka", "muzhik",
  
  // Аниме/игровые ники (очень много школьников)
  "anime_girl", "manga_boy", "otaku", "weaboo", "senpai", "kawaii",
  "minecraft", "roblox", "fortnite", "cs_gooo", "dota_2", "league_of_legends", "valorant", "apex_legends", "genshin",
  "gamer_2000", "pro_gamer", "noob_master", "pvp_king", "pve_queen", "speedrun", "glitch", "exploit",
  
  // "Блатные" или "понтовые" ники
  "boss", "kriminal", "avtoritet", "pakhan", "sherst", "kavkaz",
  "bratva", "chechnya", "dagestan", "armenia", "georgia", "azerb", "tatar", "bashkir", "chuvash",
  
  
  // Транслит русских фраз
  "ya_tebya_lyublyu", "ty_moy_drug", "my_za_rossiyu", "krym_nash", "moskva_siti", "spb_gorod", "sochi_2014", "kazan_2013", "ekb_300", "novosibirsk",
  
  
  // Ироничные или "смешные" ники
  "tvoy_boss", "tvoy_huz", "tvoy_papa", "tvoya_mama", "tvoy_brat", "tvoya_sestra", "tvoy_drug", "tvoy_vrag", "tvoy_angel", "tvoy_demon"
];

// Вспомогательные функции оставляем, они хорошие
const randRange = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

function getHumanAmount(): number {
  const r = Math.random();

  if (r < 0.60) {
    if (Math.random() < 0.40) {
      const niceNumbers = [10, 20, 30, 50, 70, 100];
      return niceNumbers[Math.floor(Math.random() * niceNumbers.length)];
    }
    return randRange(10, 100);
  }

  if (r < 0.85) {
    if (Math.random() < 0.50) {
      const niceNumbers = [100, 150, 200, 250, 300, 400, 500];
      return niceNumbers[Math.floor(Math.random() * niceNumbers.length)];
    }
    return randRange(100, 500);
  }

  if (r < 0.97) {
    if (Math.random() < 0.30) {
      const niceNumbers = [500, 750, 1000];
      return niceNumbers[Math.floor(Math.random() * niceNumbers.length)];
    }
    return randRange(500, 1500);
  }

  if (Math.random() < 0.80) return 1500;
  return randRange(1500, 2500);
}

function getHumanDelay(): number {
  const r = Math.random();
  if (r < 0.20) return randRange(4000, 4800);
  if (r < 0.60) return randRange(2000, 4000);
  if (r < 0.85) return randRange(500, 2000);
  return randRange(0, 500);
}

function getBotCount(): number {
  const r = Math.random();
  if (r < 0.30) return 1;
  if (r < 0.70) return 2;
  if (r < 0.90) return 3;
  return 4;
}

// --- НОВАЯ ГЕНЕРАЦИЯ ---
export function generateBots(roundId: number): BotBet[] {
  // Вместо сида на основе roundId, мы используем Math.random.
  // roundId нам тут больше не нужен для рандома, но он есть в аргументах.
  
  const count = getBotCount();
  const usedNames = new Set<string>();
  const usedAmounts = new Set<number>(); // Доп. защита от двух одинаковых сумм в одном раунде

  return Array.from({ length: count }, (_, id) => {
    // Выбираем имя
    let name = BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)];
    let attempts = 0;
    while (usedNames.has(name) && attempts < 50) {
      name = BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)];
      attempts++;
    }
    usedNames.add(name);

    // Выбираем сумму (с защитой от дублей)
    let amount = getHumanAmount();
    attempts = 0;
    while (usedAmounts.has(amount) && attempts < 10) {
      amount = getHumanAmount();
      attempts++;
    }
    usedAmounts.add(amount);

    const delayMs = getHumanDelay();
    
    // Стратегия вывода
    let target = 1.2 + Math.random() * 1.8;
    if (amount > 1000) target = 1.1 + Math.random() * 0.4;
    else if (amount > 500) target = 1.2 + Math.random() * 0.6;
    else if (amount > 100) target = 1.3 + Math.random() * 0.8;

    return {
      id,
      name,
      amount,
      target: Math.round(target * 100) / 100,
      delayMs,
      isPlaced: false,
      cashed: false,
      lost: false,
    };
  });
}

export function initialState(now: number): GameState {
  return {
    phase: "WAITING",
    phaseStartedAt: now,
    roundId: 1,
    crashPoint: 2,
    multiplier: 1,
    countdown: 5,
    bots: [],
    balance: START_BALANCE,
    stars: 0,
    stake: 100,
    autoBet: false,
    autoCash: false,
    autoTarget: 2,
    bet: null,
    history: [],
    games: [],
    claimed: [],
    lastVisit: "",
    seed: (now % 100000) + 7,
  };
}

export const canBet = (s: GameState) =>
  (s.phase === "WAITING" || s.phase === "COUNTDOWN" || s.phase === "ROUND_RESET") &&
  !s.bet &&
  s.stake >= MIN_STAKE &&
  s.stake <= s.balance;

export function clampStake(stake: number, balance: number) {
  if (!Number.isFinite(stake)) return MIN_STAKE;
  const v = Math.floor(stake);
  return Math.max(MIN_STAKE, Math.min(v, Math.max(MIN_STAKE, balance)));
}

export function setStake(s: GameState, stake: number): GameState {
  return { ...s, stake: clampStake(stake, s.balance) };
}

export function clampTarget(t: number) {
  if (!Number.isFinite(t)) return 2;
  return Math.min(100, Math.max(1.01, Math.round(t * 100) / 100));
}

export function placeBet(s: GameState): GameState {
  if (!canBet(s)) return s;
  const target = s.phase === "ROUND_RESET" ? s.roundId + 1 : s.roundId;
  return {
    ...s,
    balance: s.balance - s.stake,
    bet: { roundId: target, amount: s.stake, status: "pending", payout: 0, cashedAt: null },
  };
}

function record(s: GameState, bet: Bet): GameState {
  const rec: GameRecord = {
    roundId: bet.roundId,
    amount: bet.amount,
    crashPoint: s.crashPoint,
    cashedAt: bet.cashedAt,
    payout: bet.payout,
    win: bet.status === "cashed",
    ts: Date.now(),
  };
  return { ...s, games: [rec, ...s.games].slice(0, 50) };
}

export function cashOut(s: GameState, at?: number): GameState {
  if (s.phase !== "RUNNING" || !s.bet || s.bet.status !== "active") return s;
  const m = Math.min(at ?? s.multiplier, s.crashPoint);
  const payout = Math.floor(s.bet.amount * m);
  const bet: Bet = { ...s.bet, status: "cashed", payout, cashedAt: m };
  return record({ ...s, bet, balance: s.balance + payout }, bet);
}

export function startRound(s: GameState, now: number): GameState {
  const bet = s.bet && s.bet.roundId === s.roundId && s.bet.status === "pending"
    ? { ...s.bet, status: "active" as const }
    : s.bet;
  return { ...s, phase: "RUNNING", phaseStartedAt: now, multiplier: 1, bet };
}

export function crash(s: GameState, now: number): GameState {
  let next: GameState = {
    ...s,
    phase: "CRASHED",
    phaseStartedAt: now,
    multiplier: s.crashPoint,
    history: [s.crashPoint, ...s.history].slice(0, 20),
  };
  if (next.bet && next.bet.status === "active") {
    const bet: Bet = { ...next.bet, status: "lost" };
    next = record({ ...next, bet }, bet);
  }
  return next;
}

export function beginCountdown(s: GameState, now: number): GameState {
  const { crash: cp, seed } = nextCrash(s.seed);
  const roundId = s.phase === "ROUND_RESET" ? s.roundId + 1 : s.roundId;
  
  const bet = s.bet && (s.bet.status === "cashed" || s.bet.status === "lost") ? null : s.bet;
  
  let next: GameState = {
    ...s,
    phase: "COUNTDOWN",
    phaseStartedAt: now,
    roundId,
    crashPoint: cp,
    seed,
    multiplier: 1,
    countdown: 5,
    bet,
    bots: generateBots(roundId),
  };
  
  if (next.autoBet && !next.bet) next = placeBet(next);
  return next;
}

export function tick(s: GameState, now: number): GameState {
  const el = now - s.phaseStartedAt;
  
  switch (s.phase) {
    case "WAITING":
      return el >= TIMING.WAITING ? beginCountdown(s, now) : s;
      
    case "COUNTDOWN": {
      if (el >= TIMING.COUNTDOWN) return startRound(s, now);
      
      let botsChanged = false;
      const updatedBots = s.bots.map(bot => {
        if (!bot.isPlaced && el >= bot.delayMs) {
          botsChanged = true;
          return { ...bot, isPlaced: true };
        }
        return bot;
      });

      const c = Math.ceil((TIMING.COUNTDOWN - el) / 1000);
      
      if (botsChanged || c !== s.countdown) {
        return { ...s, countdown: c, bots: updatedBots };
      }
      return s;
    }

    case "RUNNING": {
      const m = multiplierAt(el);
      
      let botsChanged = false;
      const updatedBots = s.bots.map(bot => {
        if (!bot.isPlaced) return bot;
        
        if (!bot.cashed && !bot.lost && m >= bot.target) {
          botsChanged = true;
          return { ...bot, cashed: true };
        }
        return bot;
      });

      if (s.autoCash && s.bet?.status === "active" && s.autoTarget <= s.crashPoint && m >= s.autoTarget) {
        return cashOut({ ...s, multiplier: s.autoTarget, bots: updatedBots }, s.autoTarget);
      }
      
      if (m >= s.crashPoint) {
        const finalBots = updatedBots.map(b => b.isPlaced && !b.cashed ? { ...b, lost: true } : b);
        return crash({ ...s, bots: finalBots }, now);
      }
      
      if (m !== s.multiplier || botsChanged) {
        return { ...s, multiplier: m, bots: updatedBots };
      }
      return s;
    }
    
    case "CRASHED":
      if (el >= TIMING.CRASHED) {
        const bet = s.bet && (s.bet.status === "cashed" || s.bet.status === "lost") ? null : s.bet;
        return { ...s, phase: "ROUND_RESET", phaseStartedAt: now, bet };
      }
      return s;
      
    case "ROUND_RESET":
      return el >= TIMING.ROUND_RESET ? beginCountdown(s, now) : s;
  }
}

// ---- Tasks ----
export interface TaskDef {
  id: string;
  title: string;
  reward: number;
  goal: number;
  icon: "rocket" | "wallet" | "calendar";
}
export const today = () => new Date().toISOString().slice(0, 10);
export const TASKS: TaskDef[] = [
  { id: "play3", title: "Сыграйте 3 раунда", reward: 150, goal: 3, icon: "rocket" },
  { id: "firstCash", title: "Совершите первый вывод", reward: 200, goal: 1, icon: "wallet" },
  { id: "daily", title: "Зайдите в игру сегодня", reward: 50, goal: 1, icon: "calendar" },
];
export const taskKey = (id: string) => (id === "daily" ? `daily-${today()}` : id);
export function taskProgress(s: GameState, id: string) {
  if (id === "play3") return s.games.length;
  if (id === "firstCash") return s.games.filter((g) => g.win).length;
  if (id === "daily") return s.lastVisit === today() ? 1 : 0;
  return 0;
}
export function claimTask(s: GameState, id: string): GameState {
  const t = TASKS.find((x) => x.id === id);
  const key = taskKey(id);
  if (!t || s.claimed.includes(key) || taskProgress(s, id) < t.goal) return s;
  return { ...s, claimed: [...s.claimed, key], balance: s.balance + t.reward };
}

export function stats(s: GameState) {
  const wins = s.games.filter((g) => g.win);
  return {
    total: s.games.length,
    wins: wins.length,
    losses: s.games.length - wins.length,
    best: wins.reduce((m, g) => Math.max(m, g.cashedAt ?? 0), 0),
  };
}