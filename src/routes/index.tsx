import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { RocketAnimation } from "@/components/game/RocketAnimation";
import { MultiplierDisplay } from "@/components/game/MultiplierDisplay";
import { RoundHistory } from "@/components/game/RoundHistory";
import { BettingControls } from "@/components/game/BettingControls";
import { AutoBetToggle } from "@/components/game/AutoBetToggle";
import { LiveBets } from "@/components/game/LiveBets";
import { Modal } from "@/components/game/Modal";
import { useGame } from "@/lib/game/store";
import type { Phase } from "@/lib/game/engine";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ROCKET CRASH — запусти ракету" },
      { name: "description", content: "Демо краш-игра: делайте виртуальную ставку и забирайте выигрыш до взрыва ракеты." },
      { property: "og:title", content: "ROCKET CRASH — запусти ракету" },
      { property: "og:description", content: "Демо краш-игра в Telegram на виртуальных $ROCKET." },
    ],
  }),
  component: GamePage,
});

const STATUS: Record<Phase, string> = {
  WAITING: "Ожидание ставок",
  COUNTDOWN: "Приём ставок",
  RUNNING: "Ракета в полёте",
  CRASHED: "Раунд завершён",
  ROUND_RESET: "Подготовка раунда",
};

function GamePage() {
  const phase = useGame((s) => s.phase);
  const [how, setHow] = useState(false);

  return (
    <div className="space-y-3 pt-2">
      <RoundHistory />
      <RocketAnimation>
        <MultiplierDisplay />
      </RocketAnimation>
      <BettingControls />
      <AutoBetToggle />
      <LiveBets />
      
      {/* Блок с "Как играть", эмодзи и статусом демо-режима удален */}

      <Modal open={how} onClose={() => setHow(false)} title="Как играть">
        <ol className="list-decimal space-y-2 pl-5 text-foreground/90">
          <li>Сделайте виртуальную ставку до начала раунда.</li>
          <li>Пока ракета летит, множитель растёт.</li>
          <li>Заберите выигрыш до того, как ракета взорвётся.</li>
          <li>При успешном выводе выигрыш = ставка × множитель.</li>
          <li>Если ракета взорвётся раньше — виртуальная ставка сгорает.</li>
        </ol>
        <p className="mt-4 rounded-xl border border-gold/30 bg-gold/10 p-3 text-gold">
          Это демо-прототип. Используются только виртуальные $ROCKET без реальной ценности — реальные деньги не принимаются и не выплачиваются. Результаты раундов генерируются в приложении для демонстрации.
        </p>
      </Modal>
    </div>
  );
}