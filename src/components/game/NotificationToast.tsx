import { useEffect, useState } from "react";
import { game, type Toast } from "@/lib/game/store";
import { cn } from "@/lib/utils";

export function NotificationToast() {
  const [t, setT] = useState<(Toast & { id: number }) | null>(null);
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    game.onToast((x) => {
      setT({ ...x, id: Date.now() });
      clearTimeout(timer);
      timer = setTimeout(() => setT(null), 2600);
    });
    return () => { game.onToast(null); clearTimeout(timer); };
  }, []);
  if (!t) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 top-16 z-40 flex justify-center px-4">
      <div
        key={t.id}
        className={cn(
          "animate-in fade-in slide-in-from-top-4 rounded-2xl border px-4 py-2.5 text-sm font-semibold backdrop-blur-md",
          t.kind === "success" && "border-success/40 bg-success/15 text-success glow-success",
          t.kind === "crash" && "border-crash/40 bg-crash/15 text-crash",
          t.kind === "info" && "border-border bg-card text-foreground",
        )}
      >
        {t.text}
      </div>
    </div>
  );
}
