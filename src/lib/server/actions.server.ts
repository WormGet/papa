import { createServerFn } from "@tanstack/react-start";
import { readDB, writeDB, type PromoCode } from "./db.server";
import crypto from "crypto";

const BOT_TOKEN = process.env.BOT_TOKEN || "";

// Проверка подписи Telegram (ОБЯЗАТЕЛЬНО на продакшене)
function validateTelegram(initData: string): { id: number; username: string | null; first_name: string } | null {
  try {
    const params = new URLSearchParams(initData);
    const hash = params.get("hash");
    if (!hash) return null;

    params.delete("hash");
    const dataCheckString = Array.from(params.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join("\n");

    const secretKey = crypto.createHmac("sha256", "WebAppData").update(BOT_TOKEN).digest();
    const calculatedHash = crypto.createHmac("sha256", secretKey).update(dataCheckString).digest("hex");

    if (calculatedHash !== hash) return null; // Подделка!

    const userStr = params.get("user");
    if (!userStr) return null;
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

// 1. Вход / Синхронизация баланса
export const loginUser = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const { initData } = ctx.data as { initData: string };
  const tgUser = validateTelegram(initData);
  
  if (!tgUser) throw new Error("Подделка данных Telegram!");

  const db = readDB();
  const userIdStr = tgUser.id.toString();
  
  if (!db.users[userIdStr]) {
    db.users[userIdStr] = {
      id: tgUser.id,
      username: tgUser.username || null,
      firstName: tgUser.first_name || "Пилот",
      balance: 0,
      isAdmin: db.admins.includes(tgUser.username || ""),
      wins: 0,
      losses: 0
    };
    writeDB(db);
  }

  return db.users[userIdStr];
});

// 2. Активация промокода
export const activatePromo = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const { initData, code } = ctx.data as { initData: string; code: string };
  const tgUser = validateTelegram(initData);
  if (!tgUser) throw new Error("Ошибка авторизации");

  const db = readDB();
  const userId = tgUser.id.toString();
  const promo = db.promos[code.toUpperCase()];

  if (!promo) return { success: false, message: "Промокод не найден" };
  if (promo.usedBy.includes(tgUser.id)) return { success: false, message: "Вы уже использовали этот код" };
  if (promo.usedBy.length >= promo.maxUses) return { success: false, message: "Лимит активаций исчерпан" };

  promo.usedBy.push(tgUser.id);
  db.users[userId].balance += promo.reward;
  writeDB(db);

  return { success: true, message: `Начислено ${promo.reward} $ROCKET`, newBalance: db.users[userId].balance };
});

// 3. Создание промокода (Только Админ)
export const createPromo = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const { initData, reward, maxUses } = ctx.data as { initData: string; reward: number; maxUses: number };
  const tgUser = validateTelegram(initData);
  if (!tgUser || !readDB().admins.includes(tgUser.username || "")) throw new Error("Доступ запрещен");

  const db = readDB();
  const code = crypto.randomBytes(4).toString("hex").toUpperCase();

  db.promos[code] = { code, reward, maxUses, usedBy: [] };
  writeDB(db);

  return db.promos[code];
});

// 4. Получить промокоды (Только Админ)
export const getPromos = createServerFn({ method: "GET" }).handler(async (ctx) => {
  const { initData } = ctx.data as { initData: string };
  const tgUser = validateTelegram(initData);
  if (!tgUser || !readDB().admins.includes(tgUser.username || "")) throw new Error("Доступ запрещен");

  return Object.values(readDB().promos);
});

// 5. Выдать админку (Только для @Egor_marki)
export const makeAdmin = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const { initData, targetUsername } = ctx.data as { initData: string; targetUsername: string };
  const tgUser = validateTelegram(initData);
  if (!tgUser || tgUser.username !== "Egor_marki") throw new Error("Только создатель может выдавать админку");

  const db = readDB();
  const cleanUsername = targetUsername.replace("@", "");
  
  if (!db.admins.includes(cleanUsername)) {
    db.admins.push(cleanUsername);
    for (const id in db.users) {
      if (db.users[id].username === cleanUsername) db.users[id].isAdmin = true;
    }
    writeDB(db);
  }
  return { success: true };
});

// 6. Сохранение результата игры (Синхронизация)
export const syncGameResult = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const { initData, bet, payout, win } = ctx.data as { initData: string; bet: number; payout: number; win: boolean };
  const tgUser = validateTelegram(initData);
  if (!tgUser) throw new Error("Auth error");

  const db = readDB();
  const user = db.users[tgUser.id.toString()];
  if (!user) return;

  user.balance = user.balance - bet + payout;
  if (win) user.wins++; else user.losses++;
  
  writeDB(db);
  return { balance: user.balance };
});