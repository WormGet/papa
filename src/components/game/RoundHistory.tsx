import { useGame } from "@/lib/game/store";
import { cn } from "@/lib/utils";

export function RoundHistory() {
  const history = useGame((s) => s.history);
  if (!history.length) return <div className="h-7 text-xs leading-7 text-muted-foreground">История раундов появится здесь</div>;
  return (
    <div className="flex h-7 gap-1.5 overflow-x-auto [scrollbar-width:none]">
      {history.map((h, i) => (
        <span
          key={`${history.length - i}`}
          className={cn(
            "shrink-0 rounded-full border px-2.5 py-1 font-display text-[11px] font-bold tabular-nums",
            h < 2 && "border-crash/40 bg-crash/10 text-crash",
            h >= 2 && h < 6 && "border-electric/40 bg-electric/10 text-electric",
            h >= 6 && "border-gold/40 bg-gold/10 text-gold",
          )}
        >
          {h.toFixed(2)}x
        </span>
      ))}
    </div>
  );
}
