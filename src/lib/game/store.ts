import { useSyncExternalStore } from "react";
import * as E from "./engine";

const KEY = "rocket-crash-demo-v1";
const PERSIST = ["balance", "stars", "stake", "autoBet", "autoCash", "autoTarget", "history", "games", "claimed", "lastVisit", "seed"] as const;

const SERVER_STATE: E.GameState = E.initialState(0);
let state: E.GameState = SERVER_STATE;
const listeners = new Set<() => void>();
let toastListener: ((t: Toast) => void) | null = null;

export interface Toast { kind: "success" | "crash" | "info"; text: string }

function persist() {
  if (typeof window === "undefined") return;
  const out: Record<string, unknown> = {};
  for (const k of PERSIST) out[k] = state[k];
  try { localStorage.setItem(KEY, JSON.stringify(out)); } catch { /* ignore */ }
}

function set(next: E.GameState, save = true) {
  if (next === state) return;
  const prev = state;
  state = next;
  // notifications on settlement
  if (prev.bet?.status === "active" && next.bet?.status === "cashed") {
    toastListener?.({ kind: "success", text: `Вы забрали +${next.bet.payout} $ROCKET на ${next.bet.cashedAt?.toFixed(2)}x` });
  }
  if (prev.phase === "RUNNING" && next.phase === "CRASHED" && prev.bet?.status === "active") {
    toastListener?.({ kind: "crash", text: `Краш на ${next.crashPoint.toFixed(2)}x — ставка проиграна` });
  }
  const persistChanged = PERSIST.some((k) => prev[k] !== next[k]);
  if (save && persistChanged) persist();
  listeners.forEach((l) => l());
}

export function hydrate() {
  const now = performance.now();
  let saved: Partial<E.GameState> = {};
  try { saved = JSON.parse(localStorage.getItem(KEY) || "{}"); } catch { /* ignore */ }
  const base = E.initialState(Math.floor(Date.now()));
  state = { ...base, ...saved, phase: "WAITING", phaseStartedAt: now, bet: null, lastVisit: E.today(), bots: [] };
  // refund a bet lost to a page reload is not needed: bets are never persisted mid-round
  persist();
  listeners.forEach((l) => l());
}

export const game = {
  get: () => state,
  tick: (now: number) => set(E.tick(state, now)),
  placeBet: () => set(E.placeBet(state)),
  cashOut: () => set(E.cashOut(state)),
  setStake: (v: number) => set(E.setStake(state, v)),
  setAutoBet: (v: boolean) => set({ ...state, autoBet: v }),
  setAutoCash: (v: boolean) => set({ ...state, autoCash: v }),
  setAutoTarget: (v: number) => set({ ...state, autoTarget: E.clampTarget(v) }),
  claimTask: (id: string) => set(E.claimTask(state, id)),
  reset: () => {
    const fresh = E.initialState(Math.floor(Date.now()));
    set({ ...fresh, phaseStartedAt: performance.now(), lastVisit: E.today() });
  },
  onToast: (fn: ((t: Toast) => void) | null) => { toastListener = fn; },
};

const subscribe = (l: () => void) => { listeners.add(l); return () => listeners.delete(l); };

export function useGame<T>(sel: (s: E.GameState) => T): T {
  return useSyncExternalStore(subscribe, () => sel(state), () => sel(SERVER_STATE));
}