import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { game, useGame } from "@/lib/game/store";

export function AutoBetToggle() {
  const autoBet = useGame((s) => s.autoBet);
  const autoCash = useGame((s) => s.autoCash);
  const target = useGame((s) => s.autoTarget);
  const [draft, setDraft] = useState(target.toFixed(2));
  useEffect(() => setDraft(target.toFixed(2)), [target]);

  return (
    <div className="grid grid-cols-2 gap-2">
      <label className="flex items-center justify-between rounded-2xl border border-border bg-card px-3 py-3">
        <span className="text-sm font-semibold">Автоставка</span>
        <Switch checked={autoBet} onCheckedChange={game.setAutoBet} />
      </label>
      <div className="rounded-2xl border border-border bg-card px-3 py-2">
        <label className="flex items-center justify-between">
          <span className="text-sm font-semibold">Автовывод</span>
          <Switch checked={autoCash} onCheckedChange={game.setAutoCash} />
        </label>
        <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          на
          <input
            inputMode="decimal"
            aria-label="Множитель автовывода"
            value={draft}
            onChange={(e) => setDraft(e.target.value.replace(",", "."))}
            onBlur={() => game.setAutoTarget(parseFloat(draft))}
            onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
            className="w-14 rounded-md bg-surface px-1.5 py-0.5 text-center font-display font-bold text-cyan outline-none focus:ring-1 focus:ring-ring"
          />
          x
        </div>
      </div>
    </div>
  );
}
