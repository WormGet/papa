import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Outlet, Link, createRootRouteWithContext, HeadContent, Scripts } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { Header } from "@/components/game/Header";
import { BottomNavigation } from "@/components/game/BottomNavigation";
import { NotificationToast } from "@/components/game/NotificationToast";
import { GameLoop } from "@/components/game/GameLoop";
import appCss from "../styles.css?url";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover, maximum-scale=1" },
      { name: "theme-color", content: "#070B14" },
      { title: "ROCKET CRASH" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Orbitron:wght@700;900&display=swap" },
    ],
    scripts: [{ src: "https://telegram.org/js/telegram-web-app.js" }],
  }),
  shellComponent: ({ children }: { children: ReactNode }) => (
    <html lang="ru" suppressHydrationWarning>
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  ),
  component: () => {
    const { queryClient } = Route.useRouteContext();
    useEffect(() => {
      const tg = (window as any).Telegram?.WebApp;
      if (tg) { tg.ready(); tg.expand(); }
    }, []);

    return (
      <QueryClientProvider client={queryClient}>
        <GameLoop />
        <Header />
        <main className="mx-auto min-h-dvh max-w-[430px] px-3 pt-[calc(max(env(safe-area-inset-top),0.5rem)+3.25rem)] pb-[calc(max(env(safe-area-inset-bottom),0.5rem)+5rem)]">
          <Outlet />
        </main>
        <BottomNavigation />
        <NotificationToast />
      </QueryClientProvider>
    );
  },
});