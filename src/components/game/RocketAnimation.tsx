import rocketImg from "@/assets/rocket.png";
import { useGame } from "@/lib/game/store";
import { cn } from "@/lib/utils";
import { Starfield } from "./Starfield";
import type { ReactNode } from "react";

export function RocketAnimation({ children }: { children?: ReactNode }) {
  const phase = useGame((s) => s.phase);
  const m = useGame((s) => s.multiplier);
  const running = phase === "RUNNING";
  const crashed = phase === "CRASHED";
  const flying = running || crashed;

  const p = flying ? 1 - 1 / Math.pow(m, 1.1) : 0;
  const x = 14 + 64 * p;
  const y = 80 - 58 * p;
  const cx = 14 + (x - 14) * 0.7;
  const angle = flying ? Math.min(62, (Math.atan2(x - cx, 80 - y + 0.001) * 180) / Math.PI * 0.9 + 8) : 0;
  const scale = 1 - p * 0.18;

  return (
    <div className="relative h-[clamp(240px,42vh,360px)] overflow-hidden rounded-3xl border border-border bg-space">
      <Starfield fast={running} />
      {/* grid */}
      <div className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(var(--cyan)_1px,transparent_1px),linear-gradient(90deg,var(--cyan)_1px,transparent_1px)] [background-size:32px_32px]" />

      {flying && (
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 size-full">
          <defs>
            <linearGradient id="trail" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0" stopColor="var(--primary)" stopOpacity="0" />
              <stop offset="1" stopColor="var(--cyan)" />
            </linearGradient>
            <linearGradient id="trail-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="var(--electric)" stopOpacity=".28" />
              <stop offset="1" stopColor="var(--electric)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={`M 2 96 Q ${cx} 96 ${x} ${y + 8} L ${x} 100 L 2 100 Z`} fill="url(#trail-fill)" />
          <path
            d={`M 2 96 Q ${cx} 96 ${x} ${y + 8}`}
            fill="none"
            stroke={crashed ? "var(--crash)" : "url(#trail)"}
            strokeWidth="1.4"
            vectorEffect="non-scaling-stroke"
            style={{ filter: "drop-shadow(0 0 4px var(--cyan))", strokeWidth: 3 }}
          />
        </svg>
      )}

      {/* rocket */}
      <div
        className={cn("absolute w-[74px] transition-opacity duration-300", crashed && "opacity-0")}
        style={{ left: flying ? `${x}%` : "50%", top: flying ? `${y}%` : "62%", transform: `translate(-50%,-50%) rotate(${angle}deg) scale(${flying ? scale : 1})` }}
      >
        <div className={cn(!flying && "animate-bob")}>
        <img src={rocketImg} alt="Ракета" width={768} height={1024} className="relative z-10 w-full drop-shadow-[0_0_14px_var(--electric)]" />
        <div className={cn("absolute left-1/2 top-[90%] -translate-x-1/2", !running && "opacity-40 scale-50")}>
          <div className="h-14 w-6 animate-flame rounded-b-full bg-[linear-gradient(180deg,var(--foreground),var(--cyan)_30%,var(--electric)_65%,transparent)] blur-[2px]" />
          <div className="absolute left-1/2 top-0 h-8 w-3 -translate-x-1/2 animate-flame rounded-b-full bg-[linear-gradient(180deg,var(--foreground),var(--gold)_60%,transparent)]" />
          {running && [0, 1, 2].map((i) => (
            <span key={i} className="absolute left-1/2 top-10 size-1.5 animate-float-up rounded-full bg-cyan" style={{ animationDelay: `${i * 0.3}s`, animationDirection: "reverse", marginLeft: (i - 1) * 6 }} />
          ))}
        </div>
        </div>
      </div>

      {crashed && (
        <div className="absolute size-28 -translate-x-1/2 -translate-y-1/2" style={{ left: `${x}%`, top: `${y}%` }}>
          <div className="absolute inset-0 animate-boom rounded-full bg-[radial-gradient(circle,var(--gold),var(--crash)_45%,transparent_70%)]" />
        </div>
      )}

      {/* launch pad */}
      {!flying && <div className="absolute bottom-[14%] left-1/2 h-2 w-28 -translate-x-1/2 rounded-full bg-electric/30 blur-md" />}

      <div className="absolute inset-0 flex flex-col items-center pt-6">{children}</div>
    </div>
  );
}
