import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, Trophy } from "lucide-react";
import rocketImg from "@/assets/rocket.png";
import { Starfield } from "@/components/game/Starfield";

export const Route = createFileRoute("/events")({
  head: () => ({
    meta: [
      { title: "События — ROCKET CRASH" },
      { name: "description", content: "Космические события ROCKET CRASH: демо-ивенты и история." },
      { property: "og:title", content: "События — ROCKET CRASH" },
      { property: "og:description", content: "Демо-события космической краш-игры." },
    ],
  }),
  component: EventsPage,
});

const PAST = [
  { name: "Конкурс 1500 $ROCKET", date: "Ивент · 20 окт", note: "Завершено" },
  { name: "Орбитальная неделя", date: "Ивент · 05 окт", note: "Завершено" },
  { name: "Первый старт", date: "Ивент · 21 сен", note: "Завершено" },
];

function EventsPage() {
  return (
    <div className="space-y-5 pt-3">
      <h1 className="text-3xl font-extrabold">События</h1>
      <div className="relative overflow-hidden rounded-3xl border border-border bg-space p-5">
        <Starfield />
        <img src={rocketImg} alt="" width={768} height={1024} loading="lazy" className="absolute -right-4 -bottom-6 w-32 rotate-[30deg] opacity-90" />
        <div className="relative max-w-[65%]">
          <span className="rounded-full bg-success/15 px-2.5 py-1 text-[11px] font-bold text-success">ДЕМО · СКОРО</span>
          <h2 className="mt-3 font-display text-xl font-black leading-tight">Марсианский рывок</h2>
          <p className="mt-2 text-sm text-muted-foreground">Пример события: поймайте множитель 5x и выше. Награды — только виртуальные $ROCKET.</p>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-cyan"><CalendarDays className="size-4" /> Даты будут объявлены</div>
        </div>
      </div>
      <section>
        <h3 className="mb-2 text-sm font-bold text-muted-foreground">История событий (пример)</h3>
        <ul className="space-y-2">
          {PAST.map((p) => (
            <li key={p.name} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3">
              <div className="grid size-10 place-items-center rounded-xl bg-accent text-cyan"><Trophy className="size-5" /></div>
              <div className="flex-1">
                <div className="text-sm font-semibold">{p.name}</div>
                <div className="text-xs text-muted-foreground">{p.date}</div>
              </div>
              <span className="text-xs text-muted-foreground">{p.note}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
