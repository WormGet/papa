export function RocketCoin({ className = "size-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <defs>
        <linearGradient id="rc-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--cyan)" />
          <stop offset="1" stopColor="var(--primary)" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="11" fill="url(#rc-g)" />
      <path d="M12 4.5c2.6 1.6 3.6 4.4 3.3 7.6l1.6 2.1-2.2.4-.8 1.6h-3.8l-.8-1.6-2.2-.4 1.6-2.1C8.4 8.9 9.4 6.1 12 4.5z" fill="var(--foreground)" />
      <circle cx="12" cy="9.6" r="1.4" fill="var(--primary)" />
      <path d="M10.8 16.6h2.4L12 19.4z" fill="var(--gold)" />
    </svg>
  );
}

export function StarsIcon({ className = "size-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <defs>
        <linearGradient id="st-g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--cyan)" />
          <stop offset="1" stopColor="var(--electric)" />
        </linearGradient>
      </defs>
      <path d="M12 1.8l2.9 6.3 6.9.7-5.2 4.6 1.5 6.8L12 16.7l-6.1 3.5 1.5-6.8L2.2 8.8l6.9-.7z" fill="url(#st-g)" stroke="var(--foreground)" strokeOpacity=".35" strokeWidth=".8" strokeLinejoin="round" />
    </svg>
  );
}
