import { useGame } from "@/lib/game/store";

export function MultiplierDisplay() {
  const phase = useGame((s) => s.phase);
  const m = useGame((s) => s.multiplier);
  const countdown = useGame((s) => s.countdown);
  const crashPoint = useGame((s) => s.crashPoint);
  const last = useGame((s) => s.history[0]);

  if (phase === "RUNNING")
    return <div className="font-display text-6xl font-black tabular-nums text-foreground text-glow-cyan">{m.toFixed(2)}x</div>;
  if (phase === "CRASHED")
    return (
      <div className="text-center">
        <div className="text-xs font-bold tracking-[0.3em] text-crash">КРАШ</div>
        <div className="font-display text-6xl font-black tabular-nums text-crash text-glow-crash">{crashPoint.toFixed(2)}x</div>
      </div>
    );
  if (phase === "COUNTDOWN")
    return (
      <div className="text-center">
        <div className="text-xs font-semibold tracking-widest text-muted-foreground">СТАРТ ЧЕРЕЗ</div>
        <div key={countdown} className="font-display text-6xl font-black text-success text-glow-success animate-in zoom-in-50 fade-in duration-300">{countdown}</div>
      </div>
    );
  if (phase === "ROUND_RESET")
    return (
      <div className="text-center">
        <div className="text-xs font-semibold tracking-widest text-muted-foreground">ПРОШЛЫЙ РАУНД</div>
        <div className="font-display text-4xl font-black text-crash/80">{last?.toFixed(2)}x</div>
      </div>
    );
  return <div className="mt-4 animate-pulse text-base font-semibold text-muted-foreground">Ожидание ставок...</div>;
}
