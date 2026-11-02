import { createFileRoute } from "@tanstack/react-router";
import { CalendarCheck, Check, Rocket, Wallet } from "lucide-react";
import { RocketCoin } from "@/components/game/icons";
import { game, useGame } from "@/lib/game/store";
import { TASKS, taskKey, taskProgress } from "@/lib/game/engine";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/tasks")({
  head: () => ({
    meta: [
      { title: "Задания — ROCKET CRASH" },
      { name: "description", content: "Выполняйте задания и получайте виртуальные $ROCKET." },
      { property: "og:title", content: "Задания — ROCKET CRASH" },
      { property: "og:description", content: "Демо-задания с наградой в виртуальных $ROCKET." },
    ],
  }),
  component: TasksPage,
});

const ICONS = { rocket: Rocket, wallet: Wallet, calendar: CalendarCheck };

function TasksPage() {
  const s = useGame((x) => x);
  return (
    <div className="space-y-4 pt-3">
      <h1 className="text-3xl font-extrabold">Задания</h1>
      <p className="text-sm text-muted-foreground">Награды начисляются в виртуальных $ROCKET и не имеют реальной ценности.</p>
      <ul className="space-y-2.5">
        {TASKS.map((t) => {
          const Icon = ICONS[t.icon];
          const prog = Math.min(t.goal, taskProgress(s, t.id));
          const done = prog >= t.goal;
          const claimed = s.claimed.includes(taskKey(t.id));
          return (
            <li key={t.id} className="rounded-2xl border border-border bg-card p-3.5">
              <div className="flex items-center gap-3">
                <div className="grid size-11 place-items-center rounded-xl bg-accent text-cyan"><Icon className="size-5" /></div>
                <div className="flex-1">
                  <div className="text-sm font-semibold">{t.title}</div>
                  <div className="mt-0.5 flex items-center gap-1 text-xs font-bold text-gold">
                    +{t.reward} <RocketCoin className="size-3.5" />
                  </div>
                </div>
                <button
                  disabled={!done || claimed}
                  onClick={() => game.claimTask(t.id)}
                  className={cn(
                    "rounded-xl px-3.5 py-2 text-xs font-bold transition active:scale-95",
                    claimed ? "bg-success/15 text-success" : done ? "bg-gradient-primary glow-blue" : "bg-elevated text-muted-foreground",
                  )}
                >
                  {claimed ? <span className="flex items-center gap-1"><Check className="size-3.5" />Получено</span> : done ? "Забрать" : `${prog}/${t.goal}`}
                </button>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface">
                <div className="h-full rounded-full bg-gradient-primary transition-all" style={{ width: `${(prog / t.goal) * 100}%` }} />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
