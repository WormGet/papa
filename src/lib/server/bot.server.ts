import { Bot } from "grammy";
import dotenv from "dotenv";

dotenv.config();

const BOT_TOKEN = process.env.BOT_TOKEN || "";
const WEBAPP_URL = process.env.WEBAPP_URL || "";

if (!BOT_TOKEN) {
  console.error("❌ ОШИБКА: BOT_TOKEN не задан в файле .env");
  process.exit(1);
}

const bot = new Bot(BOT_TOKEN);

bot.command("start", (ctx) => {
  ctx.reply("🚀 Добро пожаловать в Rocket Crash!\n\nНажми кнопку ниже, чтобы начать играть.", {
    reply_markup: {
      inline_keyboard: [[{ text: "🎮 Играть", web_app: { url: WEBAPP_URL } }]],
    },
  });
});

bot.start({
  onStart: (botInfo) => {
    console.log(`✅ Бот @${botInfo.username} запущен!`);
    console.log(`🌐 WebApp URL: ${WEBAPP_URL}`);
  },
});