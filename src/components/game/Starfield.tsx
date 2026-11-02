import { memo } from "react";

function seeded(n: number, seed: number) {
  let s = seed;
  const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  return Array.from({ length: n }, () => ({ x: r() * 100, y: r() * 100, s: r() * 1.6 + 0.6, d: r() * 3 }));
}
const A = seeded(45, 11);
const B = seeded(20, 97);

function Layer({ stars, speed, big }: { stars: typeof A; speed: string; big?: boolean }) {
  return (
    <div className="absolute inset-x-0 -top-full h-[200%] animate-stars" style={{ ["--stars-speed" as string]: speed }}>
      {[0, 50].map((off) =>
        stars.map((p, i) => (
          <span
            key={`${off}-${i}`}
            className={`absolute rounded-full bg-foreground ${big ? "animate-twinkle" : "opacity-60"}`}
            style={{ left: `${p.x}%`, top: `${p.y / 2 + off}%`, width: p.s * (big ? 1.4 : 1), height: p.s * (big ? 1.4 : 1), animationDelay: `${p.d}s` }}
          />
        )),
      )}
    </div>
  );
}

export const Starfield = memo(function Starfield({ fast = false }: { fast?: boolean }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <Layer stars={A} speed={fast ? "6s" : "80s"} />
      <Layer stars={B} speed={fast ? "3.5s" : "45s"} big />
    </div>
  );
});
