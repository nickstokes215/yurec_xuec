import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  BookOpen,
  Bookmark,
  Clapperboard,
  Dices,
  Film,
  Images,
  Info,
  Moon,
  Music,
  Newspaper,
  Phone,
  Quote,
  RectangleVertical,
  Settings,
  Sparkles,
  Sun,
  Users,
  Trophy,
} from "lucide-react";
import { type ReactNode, useEffect, useRef } from "react";
import { FireworksHost } from "@/components/fireworks";
import { RainHost } from "@/components/rain";
import { StarfallHost } from "@/components/starfall";
import { ScrollTop } from "@/components/scroll-top";
import { ZoomLayer } from "@/components/zoom-layer";
import { OfflinePlayer } from "@/components/offline-player";
import { openZoom } from "@/lib/zoom";
import { cn, rememberReturn } from "@/lib/utils";
import { useTheme } from "@/lib/use-theme";
import { useBookmarksNav, useInfoNav, useZashNav, useAiNav, useAiTop, applyStoredIcon, useAppIcon, APP_ICONS, applyKeepAwake } from "@/lib/use-settings";

const NAV = [
  { to: "/", label: "Сборник", icon: BookOpen },
  { to: "/citats", label: "Цитатник", icon: Quote },
  { to: "/videos", label: "Медиа", icon: Clapperboard },
  { to: "/game", label: "Игры", icon: Dices },
  { to: "/chat", label: "Юрец AI", icon: Sparkles },
  { to: "/characters", label: "Герои", icon: Users },
  { to: "/saved", label: "Закладки", icon: Bookmark },
  { to: "/zashkvary", label: "Зашквары", icon: Trophy },
  { to: "/about", label: "Инфо", icon: Info },
] as const;

const MEDIA_NAV = [
  { to: "/videos/video", label: "Видео", icon: Film },
  { to: "/videos/shorts", label: "Shorts", icon: RectangleVertical },
  { to: "/videos/songs", label: "Песни", icon: Music },
  { to: "/videos/press", label: "Газета", icon: Newspaper },
  { to: "/videos/call", label: "Звонки", icon: Phone },
  { to: "/videos/other", label: "Другое", icon: Images },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const { resolved, cycle } = useTheme();
  const { show: showBooks } = useBookmarksNav();
  const { show: showInfo } = useInfoNav();
  const { show: showZash } = useZashNav();
  const { show: showAi } = useAiNav();
  const { show: showAiTop } = useAiTop();
  const icon = useAppIcon();
  const iconMeta = APP_ICONS.find((x) => x.id === icon.id) || APP_ICONS[0];
  useEffect(() => {
    applyStoredIcon();
    applyKeepAwake();
  }, []);
  useEffect(() => {
    function syncWide() {
      const w = Math.max(
        document.documentElement.clientWidth || 0,
        window.innerWidth || 0,
        window.visualViewport?.width || 0,
      );
      document.documentElement.setAttribute("data-wide", w >= 560 ? "1" : "0");
    }
    syncWide();
    window.addEventListener("resize", syncWide);
    window.addEventListener("orientationchange", syncWide);
    window.visualViewport?.addEventListener("resize", syncWide);
    return () => {
      window.removeEventListener("resize", syncWide);
      window.removeEventListener("orientationchange", syncWide);
      window.visualViewport?.removeEventListener("resize", syncWide);
    };
  }, []);
  const navItems = NAV.filter(
    (i) =>
      (i.to !== "/saved" || showBooks) &&
      (i.to !== "/zashkvary" || showZash) &&
      (i.to !== "/chat" || showAi) &&
      (i.to !== "/about" || showInfo),
  );
  const isReader = pathname.startsWith("/story/");
  const hideChrome = isReader;
  const hideDock = pathname === "/game/av" || pathname.startsWith("/game/av") || pathname === "/game/ark" || pathname.startsWith("/game/ark") || pathname === "/game/svoya" || pathname.startsWith("/game/svoya");
  const isMedia = pathname === "/videos" || pathname.startsWith("/videos/") || pathname.startsWith("/press/");
  const isChat = pathname === "/chat" || pathname.startsWith("/chat/");
  const showToTop = pathname === "/" || isMedia;
  const skipScrollSave = useRef(false);

  useEffect(() => {
    document.documentElement.classList.toggle("av-nodock", hideDock);
    document.body.classList.toggle("av-nodock", hideDock);
    return () => {
      document.documentElement.classList.remove("av-nodock");
      document.body.classList.remove("av-nodock");
    };
  }, [hideDock]);

  function jumpTop(key: string) {
    skipScrollSave.current = true;
    try {
      sessionStorage.setItem(key, "0");
    } catch {
      /* ignore */
    }
    window.scrollTo(0, 0);
    window.setTimeout(() => {
      skipScrollSave.current = false;
      try {
        sessionStorage.setItem(key, "0");
      } catch {
        /* ignore */
      }
    }, 400);
  }

  useEffect(() => {
    if (!pathname.startsWith("/game")) return;
    let last = "/game";
    if (pathname === "/game/av" || pathname.startsWith("/game/av")) last = "/game/av";
    else if (pathname === "/game/crosswords" || pathname.startsWith("/game/crossword")) last = "/game/crosswords";
    else if (pathname.startsWith("/game/") && pathname !== "/game/") last = "/game/quest";
    try {
      localStorage.setItem("yurec-game-last", last);
    } catch {
      /* ignore */
    }
  }, [pathname]);

  const pathRef = useRef(pathname);
  pathRef.current = pathname;
  useEffect(() => {
    const w = window as Window & { yurecBack?: () => boolean };
    const prev = w.yurecBack;
    const onBack = () => {
      if (typeof prev === "function" && prev()) return true;
      const p = pathRef.current;
      if (p.startsWith("/game/crossword") && p !== "/game/crosswords") {
        void navigate({ to: "/game/crosswords" });
        return true;
      }
      return false;
    };
    w.yurecBack = onBack;
    return () => {
      if (w.yurecBack === onBack) w.yurecBack = prev;
    };
  }, [navigate]);

  useEffect(() => {
    rememberReturn(pathname);
    if (pathname.startsWith("/story/")) return;
    if (pathname !== "/" && !pathname.startsWith("/videos") && !pathname.startsWith("/press")) return;
    const key = `yurec-scroll:${pathname}`;
    let y = 0;
    try {
      y = Number(sessionStorage.getItem(key) || 0);
    } catch {
      /* ignore */
    }
    const t = window.setTimeout(() => window.scrollTo(0, y), 50);
    let lastSave = 0;
    const onScroll = () => {
      if (skipScrollSave.current) return;
      const now = Date.now();
      if (now - lastSave < 160) return;
      lastSave = now;
      try {
        sessionStorage.setItem(key, String(window.scrollY));
      } catch {
        /* ignore */
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("scroll", onScroll);
      if (skipScrollSave.current) return;
      try {
        sessionStorage.setItem(key, String(window.scrollY));
      } catch {
        /* ignore */
      }
    };
  }, [pathname]);

  return (
    <div className="min-h-dvh bg-void">
      <div
        className={cn(
          "relative mx-auto flex min-h-dvh w-full max-w-[var(--app-max)] flex-col bg-bg",
          "shadow-[var(--shadow-device)]",
          isChat && "h-dvh overflow-hidden",
        )}
      >
        {!hideChrome && (
          <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-border bg-bg/92 px-4 backdrop-blur-sm">
            <div className="flex min-w-0 items-center gap-2.5">
              <button
                type="button"
                onClick={() => openZoom(iconMeta.src)}
                className="shrink-0"
                aria-label="Открыть баннер"
              >
                <img
                  src={iconMeta.src}
                  alt=""
                  className="size-9 rounded-lg object-cover shadow-[0_0_0_1px_rgba(255,255,255,0.08)]"
                />
              </button>
              <Link to="/" className="min-w-0">
                <p className="truncate font-sans text-[11px] font-medium tracking-[0.18em] text-muted uppercase">
                  {iconMeta.label}
                </p>
                <h1 className="truncate font-sans text-base font-semibold leading-tight">Жизнь Юрца</h1>
              </Link>
            </div>
            <div className="ml-auto flex shrink-0 items-center">
              {showAiTop ? (
                <Link
                  to="/chat"
                  aria-label="Юрец AI"
                  className="grid size-11 place-items-center rounded-md"
                >
                  <Sparkles className="size-5" />
                </Link>
              ) : null}
              <button
                type="button"
                onClick={cycle}
                className="grid size-11 place-items-center rounded-md"
                aria-label="Тема оформления"
              >
                {resolved === "light" ? <Moon className="size-5" /> : <Sun className="size-5" />}
              </button>
              <Link
                to="/settings"
                aria-label="Настройки"
                className="grid size-11 place-items-center rounded-md"
              >
                <Settings className="size-5" />
              </Link>
            </div>
          </header>
        )}

        <div className={cn("flex-1", isChat && "flex min-h-0 flex-col overflow-hidden", !hideChrome && !hideDock && (isMedia ? "pb-[8.5rem]" : isChat ? "pb-0" : "pb-20"))}>{children}</div>

        {!hideChrome && !hideDock && (
          <nav
            data-app-dock="1"
            className="fixed inset-x-0 bottom-0 z-20 mx-auto w-full max-w-[var(--app-max)] border-t border-border bg-bg/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm"
          >
            {isMedia ? (
              <ul className="dock-inner grid h-[3.6rem] grid-cols-6 border-b border-border px-0.5" aria-label="Разделы медиа">
                {MEDIA_NAV.map((item) => {
                  const active =
                    pathname === item.to || (item.to === "/videos/press" && pathname.startsWith("/press/"));
                  const Icon = item.icon;
                  return (
                    <li key={item.to}>
                      <Link
                        to="/videos/$cat"
                        params={{ cat: item.to.slice("/videos/".length) }}
                        aria-label={item.label}
                        onClick={(e) => {
                          if (pathname !== item.to) return;
                          e.preventDefault();
                          jumpTop(`yurec-scroll:${item.to}`);
                        }}
                        className={cn(
                          "flex h-full flex-col items-center justify-center gap-0.5 text-[9px] font-medium",
                          active ? "text-fg" : "text-subtle",
                        )}
                      >
                        <span
                          className={cn(
                            "relative flex h-6 w-7 items-center justify-center rounded-md",
                            active && "bg-elevated",
                          )}
                        >
                          <Icon className="size-4" strokeWidth={active ? 2.2 : 1.7} />
                        </span>
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : null}
            <ul className={cn(
              "dock-inner grid h-16",
              navItems.length >= 9 ? "grid-cols-9 px-0.5" : navItems.length >= 8 ? "grid-cols-8 px-0.5" : navItems.length >= 7 ? "grid-cols-7 px-0.5" : "px-1",
              navItems.length >= 7 ? "" : navItems.length >= 6 ? "grid-cols-6" : navItems.length === 5 ? "grid-cols-5" : "grid-cols-4",
            )}>
              {navItems.map((item) => {
                const active =
                  item.to === "/"
                    ? pathname === "/"
                    : item.to === "/videos"
                      ? pathname === "/videos" || pathname.startsWith("/videos/") || pathname.startsWith("/press/")
                    : item.to === "/about"
                      ? pathname === "/about" || pathname === "/changelog" || pathname === "/ideas" || pathname === "/donate" || pathname === "/offline" || pathname === "/settings" || pathname === "/passport" || (!showZash && (pathname === "/zashkvary" || pathname.startsWith("/zashkvary/")))
                      : pathname === item.to || pathname.startsWith(`${item.to}/`);
                const Icon = item.icon;
                return (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      aria-label={item.label}
                      onClick={(e) => {
                        if (item.to === "/") {
                          if (pathname !== "/") return;
                          e.preventDefault();
                          if (window.scrollY > 24) {
                            jumpTop("yurec-scroll:/");
                            return;
                          }
                          window.dispatchEvent(new Event("yurec-reset-home"));
                          return;
                        }
                        if (item.to === "/videos") {
                          if (!isMedia) return;
                          if (pathname !== "/videos" && pathname !== "/videos/") {
                            if (window.scrollY > 24) {
                              e.preventDefault();
                              jumpTop(`yurec-scroll:${pathname}`);
                              return;
                            }
                            return;
                          }
                          e.preventDefault();
                          if (window.scrollY > 24) {
                            jumpTop("yurec-scroll:/videos");
                            return;
                          }
                          window.dispatchEvent(new Event("yurec-reset-media"));
                          return;
                        }
                        if (item.to === "/citats") {
                          if (pathname === "/citats" || pathname === "/citats/") {
                            e.preventDefault();
                            jumpTop("yurec-scroll:/citats");
                            return;
                          }
                        }
                        if (item.to === "/characters") {
                          if (pathname !== "/characters" && pathname !== "/characters/") {
                            if (pathname.startsWith("/characters/")) return;
                            return;
                          }
                          e.preventDefault();
                          if (window.scrollY > 24) {
                            jumpTop("yurec-scroll:/characters");
                            return;
                          }
                          window.dispatchEvent(new Event("yurec-reset-chars"));
                          return;
                        }
                        if (item.to === "/game") {
                          const onGame = pathname === "/game" || pathname === "/game/" || pathname.startsWith("/game/");
                          if (onGame) {
                            if (pathname.startsWith("/game/") && pathname !== "/game") {
                              if (window.scrollY > 24) {
                                e.preventDefault();
                                jumpTop(`yurec-scroll:${pathname}`);
                                return;
                              }
                              return;
                            }
                            e.preventDefault();
                            jumpTop("yurec-scroll:/game");
                            return;
                          }
                          let last = "/game";
                          try {
                            last = localStorage.getItem("yurec-game-last") || "/game";
                          } catch {
                            last = "/game";
                          }
                          if (last === "/game/quest") {
                            e.preventDefault();
                            void navigate({ to: "/game/quest" });
                          } else if (last === "/game/crosswords") {
                            e.preventDefault();
                            void navigate({ to: "/game/crosswords" });
                          } else if (last === "/game/av") {
                            e.preventDefault();
                            void navigate({ to: "/game/av" });
                          }
                        }
                      }}
                      className={cn(
                        "flex h-full flex-col items-center justify-center gap-0.5 font-medium",
                        navItems.length >= 8 ? "text-[8px]" : navItems.length >= 7 ? "text-[9px]" : "text-[10px]",
                        active ? "text-fg" : "text-subtle",
                      )}
                    >
                      <span
                        className={cn(
                          "relative flex h-7 w-8 items-center justify-center rounded-lg",
                          active && "bg-elevated",
                        )}
                      >
                        <Icon className="size-5" strokeWidth={active ? 2.2 : 1.7} />
                        {item.to === "/chat" ? <span className="nav-beta">бета</span> : null}
                      </span>
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        )}
      </div>
      <ZoomLayer />
      <OfflinePlayer />
      {showToTop ? <ScrollTop media={isMedia} /> : null}
      <FireworksHost />
      <RainHost />
      <StarfallHost />
    </div>
  );
}
