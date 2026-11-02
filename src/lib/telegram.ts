import { useEffect, useState } from "react";

interface TgUser { id?: number; first_name?: string; last_name?: string; username?: string; photo_url?: string }
interface TgWebApp {
  ready: () => void;
  expand: () => void;
  initDataUnsafe?: { user?: TgUser };
  setHeaderColor?: (c: string) => void;
  setBackgroundColor?: (c: string) => void;
  HapticFeedback?: { impactOccurred: (s: string) => void };
}

export const getWebApp = (): TgWebApp | undefined =>
  typeof window === "undefined" ? undefined : (window as unknown as { Telegram?: { WebApp?: TgWebApp } }).Telegram?.WebApp;

export function initTelegram() {
  const wa = getWebApp();
  if (!wa) return;
  try {
    wa.ready();
    wa.expand();
    wa.setHeaderColor?.("#070B14");
    wa.setBackgroundColor?.("#070B14");
  } catch { /* browser preview */ }
}

export function haptic() {
  try { getWebApp()?.HapticFeedback?.impactOccurred("light"); } catch { /* noop */ }
}

/** Display-only identity. Unverified: never use as proof of identity. */
export function useTelegramUser() {
  const [u, setU] = useState<{ name: string; id: number | null; photo: string | null; demo: boolean }>({
    name: "Демо-пилот", id: null, photo: null, demo: true,
  });
  useEffect(() => {
    const user = getWebApp()?.initDataUnsafe?.user;
    if (user?.first_name) {
      setU({ name: [user.first_name, user.last_name].filter(Boolean).join(" "), id: user.id ?? null, photo: user.photo_url ?? null, demo: false });
    }
  }, []);
  return u;
}
