import { Link } from "@tanstack/react-router";
import { ListChecks, Rocket, Trophy, User } from "lucide-react";

const TABS = [
  { to: "/events", label: "События", Icon: Trophy },
  { to: "/", label: "Игра", Icon: Rocket },
  { to: "/tasks", label: "Задания", Icon: ListChecks },
  { to: "/profile", label: "Профиль", Icon: User },
] as const;

export function BottomNavigation() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-[430px] border-t border-border/60 bg-background/90 px-2 pt-2 pb-safe backdrop-blur-md">
      <ul className="grid grid-cols-4 gap-1">
        {TABS.map(({ to, label, Icon }) => (
          <li key={to}>
            <Link
              to={to}
              activeOptions={{ exact: true }}
              className="flex flex-col items-center gap-0.5 rounded-2xl py-1.5 text-[11px] font-semibold text-muted-foreground transition data-[status=active]:bg-accent data-[status=active]:text-cyan"
            >
              <Icon className="size-5" />
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
