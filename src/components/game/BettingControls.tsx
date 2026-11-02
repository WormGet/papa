import { Minus, Plus } from "lucide-react";
import { game, useGame } from "@/lib/game/store";
import { canBet, STAKE_STEP } from "@/lib/game/engine";
import { haptic } from "@/lib/telegram";
import { cn } from "@/lib/utils";
import { RocketCoin } from "./icons";

export function BettingControls() {
  const s = useGame((x) => x);
  const { phase, bet, stake, balance, multiplier } = s;
  const canCash = phase === "RUNNING" && bet?.status === "active";
  const pending = bet?.status === "pending";
  const betOk = canBet(s);
  const locked = !!bet || phase === "RUNNING" || phase === "CRASHED";

  let label = "СДЕЛАТЬ СТАВКУ";
  let sub: string | null = null;
  let variant: "primary" | "success" | "muted" = "primary";
  if (canCash) { label = "ЗАБРАТЬ ВЫИГРЫШ"; sub = `${Math.floor(bet!.amount * multiplier)} $ROCKET`; variant = "success"; }
  else if (pending) { label = "СТАВКА ПРИНЯТА"; sub = `${bet!.amount} $ROCKET · ждём старт`; variant = "muted"; }
  else if (bet?.status === "cashed") { label = "ВЫИГРЫШ ЗАБРАН"; sub = `+${bet.payout} $ROCKET`; variant = "muted"; }
  else if (phase === "RUNNING" || phase === "CRASHED") { label = "ОЖИДАНИЕ РАУНДА"; sub = "Ставки откроются после краша"; variant = "muted"; }
  else if (stake > balance) { sub = "Недостаточно $ROCKET"; }

  const onMain = () => {
    haptic();
    if (canCash) game.cashOut();
    else if (betOk) game.placeBet();
  };

  return (
    <div className="space-y-3 rounded-3xl border border-border bg-card p-3">
      <div className="flex items-center gap-2">
        <button aria-label="Уменьшить ставку" disabled={locked} onClick={() => game.setStake(stake - STAKE_STEP)} className="grid size-12 place-items-center rounded-2xl bg-elevated text-foreground transition active:scale-95 disabled:opacity-40">
          <Minus className="size-5" />
        </button>
        <div className="flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl border border-border bg-surface">
          <RocketCoin className="size-5" />
          <input
            inputMode="numeric"
            aria-label="Сумма ставки"
            disabled={locked}
            value={stake}
            onChange={(e) => game.setStake(Number(e.target.value.replace(/\D/g, "")) || 0)}
            className="w-20 bg-transparent text-center font-display text-lg font-bold tabular-nums outline-none disabled:opacity-60"
          />
          <span className="text-xs font-semibold text-muted-foreground">$ROCKET</span>
        </div>
        <button aria-label="Увеличить ставку" disabled={locked} onClick={() => game.setStake(stake + STAKE_STEP)} className="grid size-12 place-items-center rounded-2xl bg-elevated text-foreground transition active:scale-95 disabled:opacity-40">
          <Plus className="size-5" />
        </button>
      </div>
      <div className="flex gap-1.5">
        {[50, 100, 250, 500].map((v) => (
          <button key={v} disabled={locked} onClick={() => game.setStake(v)} className={cn("flex-1 rounded-xl border py-1.5 text-xs font-bold transition disabled:opacity-40", stake === v ? "border-electric bg-accent text-cyan" : "border-border text-muted-foreground")}>
            {v}
          </button>
        ))}
      </div>
      <button
        onClick={onMain}
        disabled={!(canCash || betOk)}
        className={cn(
          "flex h-16 w-full flex-col items-center justify-center rounded-2xl font-display text-[15px] font-black tracking-wider transition active:scale-[0.98]",
          variant === "primary" && "bg-gradient-primary text-primary-foreground glow-blue disabled:opacity-50",
          variant === "success" && "bg-gradient-success text-background glow-success",
          variant === "muted" && "border border-border bg-elevated text-muted-foreground",
        )}
      >
        {label}
        {sub && <span className="mt-0.5 font-sans text-xs font-semibold tracking-normal opacity-80">{sub}</span>}
      </button>
    </div>
  );
}
