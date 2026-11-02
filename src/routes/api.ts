import { createAPIFileRoute } from "@tanstack/react-start/api";
import { readDB, writeDB } from "@/lib/server/db.server";
import crypto from "crypto";

// Валидация Telegram
function validateTelegram(initData: string, botToken: string) {
  try {
    const params = new URLSearchParams(initData);
    const hash = params.get("hash");
    if (!hash) return null;
    params.delete("hash");
    const dataCheckString = Array.from(params.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join("\n");
    const secretKey = crypto.createHmac("sha256", "WebAppData").update(botToken).digest();
    const calculatedHash = crypto.createHmac("sha256", secretKey).update(dataCheckString).digest("hex");
    if (calculatedHash !== hash) return null;
    const userStr = params.get("user");
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
}

// Один эндпоинт для всех действий
export const APIRoute = createAPIFileRoute("/api")({
  POST: async ({ request }) => {
    const body = await request.json();
    const initData = body.initData || "";
    
    // На хосте токен должен быть в process.env.BOT_TOKEN
    const botToken = process.env.BOT_TOKEN || ""; 
    const tgUser = validateTelegram(initData, botToken);
    
    if (!tgUser) {
      return new Response(JSON.stringify({ error: "Invalid Auth" }), { status: 401 });
    }

    const db = readDB();
    const userIdStr = tgUser.id.toString();

    // Регистрация/Вход
    if (body.action === "login") {
      if (!db.users[userIdStr]) {
        db.users[userIdStr] = {
          id: tgUser.id,
          username: tgUser.username || null,
          firstName: tgUser.first_name || "Пилот",
          balance: 0,
          isAdmin: db.admins.includes(tgUser.username || ""),
        };
        writeDB(db);
      }
      return new Response(JSON.stringify(db.users[userIdStr]), { status: 200 });
    }

    // Активация промокода
    if (body.action === "promo") {
      const promo = db.promos[body.code.toUpperCase()];
      if (!promo) return new Response(JSON.stringify({ message: "Код не найден" }), { status: 200 });
      if (promo.usedBy.includes(tgUser.id)) return new Response(JSON.stringify({ message: "Уже использован" }), { status: 200 });
      if (promo.usedBy.length >= promo.maxUses) return new Response(JSON.stringify({ message: "Лимит исчерпан" }), { status: 200 });

      promo.usedBy.push(tgUser.id);
      db.users[userIdStr].balance += promo.reward;
      writeDB(db);
      return new Response(JSON.stringify({ success: true, message: `+${promo.reward} $ROCKET`, balance: db.users[userIdStr].balance }), { status: 200 });
    }

    // Админ: создание промокода
    if (body.action === "create_promo" && db.admins.includes(tgUser.username || "")) {
      const code = crypto.randomBytes(4).toString("hex").toUpperCase();
      db.promos[code] = { code, reward: body.reward, maxUses: body.maxUses, usedBy: [] };
      writeDB(db);
      return new Response(JSON.stringify(db.promos[code]), { status: 200 });
    }

    // Админ: список промокодов
    if (body.action === "get_promos" && db.admins.includes(tgUser.username || "")) {
      return new Response(JSON.stringify(Object.values(db.promos)), { status: 200 });
    }

    // Админ: выдача прав
    if (body.action === "make_admin" && tgUser.username === "Egor_marki") {
      const clean = body.target.replace("@", "");
      if (!db.admins.includes(clean)) {
        db.admins.push(clean);
        for (const id in db.users) if (db.users[id].username === clean) db.users[id].isAdmin = true;
        writeDB(db);
      }
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), { status: 400 });
  },
});