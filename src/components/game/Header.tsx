import { Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useState, type ReactNode } from "react";
import { useGame } from "@/lib/game/store";
import { useTelegramUser } from "@/lib/telegram";
import { RocketCoin, StarsIcon } from "./icons";
import { Modal } from "./Modal";

export function BalancePill({ icon, value, children }: { icon: ReactNode; value: number; children?: ReactNode }) {
  return (
    <div className="flex h-8 items-center gap-1.5 rounded-full border border-border bg-card pl-1.5 pr-1.5 text-[13px] font-bold tabular-nums">
      {icon}
      <span className="pr-1">{value.toLocaleString("ru-RU")}</span>
      {children}
    </div>
  );
}

export function Avatar({ size = "size-9" }: { size?: string }) {
  const u = useTelegramUser();
  const letter = (u.name || "П").charAt(0).toUpperCase();
  return u.photo ? (
    <img src={u.photo} alt={u.name} className={`${size} rounded-full border-2 border-electric object-cover glow-blue`} />
  ) : (
    <div className={`${size} grid place-items-center rounded-full border-2 border-electric bg-gradient-primary font-bold glow-blue`}>{letter}</div>
  );
}

export function Header() {
  const balance = useGame((s) => s.balance);
  const stars = useGame((s) => s.stars);
  const [open, setOpen] = useState(false);
  return (
    <header className="fixed inset-x-0 top-0 z-30 mx-auto max-w-[430px] border-b border-border/60 bg-background/85 px-3 pt-safe pb-2 backdrop-blur-md">
      <div className="flex items-center justify-between gap-2">
        <Link to="/profile" aria-label="Профиль"><Avatar /></Link>
        <div className="font-display text-[13px] font-black leading-none tracking-wider">
          <div className="text-foreground">ROCKET</div>
          <div className="text-electric">CRASH</div>
        </div>
        <div className="flex items-center gap-1.5">
          <BalancePill icon={<RocketCoin className="size-5" />} value={balance} />
          <BalancePill icon={<StarsIcon className="size-5" />} value={stars}>
            <button onClick={() => setOpen(true)} aria-label="Пополнить Stars" className="grid size-5 place-items-center rounded-full bg-gradient-primary">
              <Plus className="size-3.5" strokeWidth={3} />
            </button>
          </BalancePill>
        </div>
      </div>
      <Modal open={open} onClose={() => setOpen(false)} title="Пополнение баланса">
        <p>Пополнение Telegram Stars будет настроено позже. Сейчас платежи не подключены.</p>
        <p className="mt-2">Stars — отдельная валюта: в демо-игре их нельзя заработать. Игра использует только виртуальные $ROCKET без реальной ценности.</p>
      </Modal>
    </header>
  );
}
