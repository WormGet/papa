import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Avatar } from "@/components/game/Header";
import { RocketCoin, StarsIcon } from "@/components/game/icons";
import { useGame } from "@/lib/game/store";
import { stats } from "@/lib/game/engine";
import { useTelegramUser } from "@/lib/telegram";
import { cn } from "@/lib/utils";
import { ShieldAlert, Key } from "lucide-react";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Профиль — ROCKET CRASH" },
      { name: "description", content: "Профиль пилота: баланс, статистика и история демо-раундов." },
      { property: "og:title", content: "Профиль — ROCKET CRASH" },
      { property: "og:description", content: "Статистика и история демо-игры ROCKET CRASH." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const s = useGame((x) => x);
  const u = useTelegramUser();
  const st = stats(s);

  const [dbUser, setDbUser] = useState<any>(null);
  const [promoCode, setPromoCode] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Получаем данные из Telegram WebApp
  const tg = (window as any).Telegram?.WebApp;
  // Если открыто не в Телеграме, используем тестовый ID (только для локальной разработки)
  const initData = tg?.initData || (typeof window !== "undefined" && window.location.hostname === "localhost" 
    ? "user=%7B%22id%22%3A123%2C%22first_name%22%3A%22Admin%22%2C%22username%22%3A%22Egor_marki%22%7D" 
    : "");

  // Единая функция для запросов к нашему API (чтобы не импортировать серверный код)
  const callApi = async (action: string, payload: any = {}) => {
    try {
      const res = await fetch("/api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ initData, action, ...payload }),
      });
      return await res.json();
    } catch (e) {
      console.error(e);
      return { error: "Network error" };
    }
  };

  useEffect(() => {
    if (initData) {
      callApi("login").then((data) => {
        if (!data.error) setDbUser(data);
      });
    }
  }, [initData]);

  const handlePromo = async () => {
    if (!promoCode || loading) return;
    setLoading(true);
    
    const res = await callApi("promo", { code: promoCode });
    
    if (res.success) {
      alert(res.message);
      setDbUser({ ...dbUser, balance: res.balance });
      setPromoCode("");
    } else {
      alert(res.message || "Ошибка активации");
    }
    setLoading(false);
  };

  return (
    <div className="space-y-4 pt-3 pb-6">
      <div className="flex items-center gap-4 rounded-3xl border border-border bg-space p-4">
        <Avatar size="size-16" />
        <div>
          <div className="text-lg font-bold">{u.name}</div>
          <div className="text-xs text-muted-foreground">{u.demo ? "Демо-профиль" : `ID: ${u.id}`}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-2xl border border-border bg-card p-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><RocketCoin /> Баланс сервера</div>
          <div className="mt-1 font-display text-xl font-black">
            {dbUser ? dbUser.balance.toLocaleString("ru-RU") : "..."}
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><StarsIcon /> Telegram Stars</div>
          <div className="mt-1 font-display text-xl font-black">{s.stars}</div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-3 space-y-2">
        <h3 className="text-sm font-bold flex items-center gap-2"><Key size={14}/> Активировать промокод</h3>
        <div className="flex gap-2">
          <input 
            value={promoCode} 
            onChange={(e) => setPromoCode(e.target.value.toUpperCase())} 
            className="bg-surface p-2.5 rounded-xl w-full text-sm font-mono uppercase" 
            placeholder="FG34YH88ER"
            disabled={loading}
          />
          <button 
            onClick={handlePromo} 
            disabled={loading}
            className="bg-electric text-black px-4 rounded-xl font-bold text-sm disabled:opacity-50"
          >
            {loading ? "..." : "ОК"}
          </button>
        </div>
      </div>

      {dbUser?.isAdmin && (
        <Link to="/admin" className="flex items-center justify-center gap-2 bg-gold text-black py-3 rounded-2xl font-bold text-sm shadow-lg shadow-gold/20">
          <ShieldAlert size={18} /> Открыть Админ-панель
        </Link>
      )}

      <div className="grid grid-cols-4 gap-2 text-center">
        {[
          ["Ставок", st.total, "text-foreground"],
          ["Побед", st.wins, "text-success"],
          ["Поражений", st.losses, "text-crash"],
          ["Лучший", st.best ? `${st.best.toFixed(2)}x` : "—", "text-cyan"],
        ].map(([l, v, c]) => (
          <div key={l as string} className="rounded-2xl border border-border bg-card px-1 py-2.5">
            <div className={cn("font-display text-base font-black", c as string)}>{v}</div>
            <div className="text-[10px] text-muted-foreground">{l}</div>
          </div>
        ))}
      </div>

      <section>
        <h3 className="mb-2 text-sm font-bold text-muted-foreground">Последние игры</h3>
        {s.games.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-4 text-center text-sm text-muted-foreground">Пока нет сыгранных раундов</div>
        ) : (
          <ul className="space-y-1.5">
            {s.games.slice(0, 10).map((g) => (
              <li key={`${g.roundId}-${g.ts}`} className="flex items-center justify-between rounded-xl bg-card px-3 py-2 text-sm">
                <span className="text-muted-foreground">Ставка · {g.amount}</span>
                <span className={cn("font-bold tabular-nums", g.win ? "text-success" : "text-crash")}>
                  {g.win ? `+${g.payout} · ${g.cashedAt?.toFixed(2)}x` : `−${g.amount} · краш ${g.crashPoint.toFixed(2)}x`}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}