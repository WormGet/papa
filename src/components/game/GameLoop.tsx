import { useEffect } from "react";
import { game, hydrate } from "@/lib/game/store";
import { initTelegram } from "@/lib/telegram";

/** Drives the round state machine from one rAF loop, independent of the visible tab. */
export function GameLoop() {
  useEffect(() => {
    hydrate();
    initTelegram();
    let raf = 0;
    const loop = (t: number) => { game.tick(t); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    const iv = setInterval(() => game.tick(performance.now()), 250); // keeps rounds settling when tab is hidden
    return () => { cancelAnimationFrame(raf); clearInterval(iv); };
  }, []);
  return null;
}
