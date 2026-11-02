import { useGame } from "@/lib/game/store";
import { cn } from "@/lib/utils";
import { RocketCoin } from "./icons";

function maskName(name: string): string {
  if (name.length <= 3) return name;
  const first = name.slice(0, 2);
  const last = name.slice(-2);
  const middle = name.slice(2, -2);
  return `${first}${middle.replace(/[^_.]/g, "*")}${last}`;
}

export function LiveBets() {
  const roundId = useGame((s) => s.roundId);
  const phase = useGame((s) => s.phase);
  const bet = useGame((s) => s.bet);
  const bots = useGame((s) => s.bots);

  const started = phase === "RUNNING" || phase === "CRASHED";
  const activeBots = bots.filter((b) => b.isPlaced);

  const rows = activeBots.map((bot) => {
    return {
      id: bot.id,
      displayName: maskName(bot.name),
      amount: bot.amount,
      target: bot.target,
      cashed: bot.cashed,
      lost: bot.lost,
      payout: bot.cashed ? Math.floor(bot.amount * bot.target) : 0,
    };
  });

  if (bet && bet.roundId === roundId) {
    rows.unshift({
      id: -1,
      displayName: "Вы",
      amount: bet.amount,
      target: bet.cashedAt ?? 0,
      cashed: bet.status === "cashed",
      lost: bet.status === "lost",
      payout: bet.payout,
    });
  }

  const total = rows.reduce((sum, row) => sum + row.amount, 0);

  return (
    <section className="rounded-3xl border border-border bg-card p-3">
      <div className="mb-2 flex items-center justify-between text-xs">
        <span className="font-bold">
          Ставки раунда{" "}
          <span className="font-normal text-muted-foreground">
            · {rows.length}
          </span>
        </span>
        <span className="flex items-center gap-1 font-bold tabular-nums text-muted-foreground">
          {total.toLocaleString("ru-RU")}
          <RocketCoin className="size-3.5" />
        </span>
      </div>

      <div className="grid grid-cols-[1fr_auto_auto] gap-x-3 px-2 pb-1 text-[10px] uppercase tracking-wider text-muted-foreground">
        <span>Игрок</span>
        <span className="text-right">Ставка</span>
        <span className="w-24 text-right">Вывод</span>
      </div>

      <ul className="space-y-1">
        {rows.map((row) => (
          <li
            key={row.id}
            className={cn(
              "grid grid-cols-[1fr_auto_auto] items-center gap-x-3 rounded-xl px-2 py-1.5 text-sm transition-all duration-300",
              row.cashed ? "bg-success/10" : row.lost ? "bg-crash/10" : "bg-surface",
              row.id === -1 && "ring-1 ring-electric/60",
              phase === "COUNTDOWN" && row.id !== -1 && "animate-in fade-in slide-in-from-bottom-2"
            )}
          >
            <span className="truncate font-semibold">{row.displayName}</span>
            <span className="text-right tabular-nums text-muted-foreground">
              {row.amount.toLocaleString("ru-RU")}
            </span>
            <span
              className={cn(
                "w-24 text-right text-xs font-bold tabular-nums",
                row.cashed ? "text-success" : row.lost ? "text-crash" : "text-muted-foreground",
              )}
            >
              {row.cashed
                ? `${row.target.toFixed(2)}x · +${row.payout}`
                : row.lost
                  ? "Сгорела"
                  : started
                    ? "В полёте"
                    : "Ждёт"}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}