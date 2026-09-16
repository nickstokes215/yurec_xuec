import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowUp, Bookmark, BookmarkCheck, ChevronLeft, ChevronRight, Moon, Search, Sun } from "lucide-react";
import { Fragment, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  KIND_LABEL,
  KIND_BANNERS,
  APP_VERSION,
  TELEGRAM_URL,
  YOUTUBE_CHANNEL,
  adjacentStories,
  formatCode,
  formatRuDate,
  getStory,
  parseSmsThread,
  storyTelegramHref,
  youtubeWatchUrl,
  type Story,
} from "@/data/catalog";
import { persistProgress, readLast, useBookmarks } from "@/lib/use-library";
import { toggleStoryRead, useStoryRead } from "@/lib/use-read";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { cn, getReturnPath } from "@/lib/utils";
import { findSpans, isSceneHead, richParts } from "@/lib/story-format";
import { PaidGate } from "@/components/paid-gate";
import { OfflineBtn } from "@/components/offline-btn";
import { offlineForStory } from "@/lib/offline";
import { useTheme } from "@/lib/use-theme";
import { useReaderScrub } from "@/lib/use-settings";

export const Route = createFileRoute("/story/$slug")({
  component: StoryPage,
});

const FONT_STEPS = [17, 19, 21] as const;

function HighlightText({
  text,
  query,
  from,
  current,
}: {
  text: string;
  query: string;
  from: number;
  current: number;
}) {
  const parts = richParts(text, query, from, current);
  if (!parts.length) return text;
  const nodes: ReactNode[] = [];
  parts.forEach((p, i) => {
    let node: ReactNode = p.text;
    if (p.hit) {
      node = (
        <mark key={`m${i}`} data-find={p.find} className={p.current ? "find-cur" : "find-hit"}>
          {p.text}
        </mark>
      );
    }
    if (p.italic && p.bold) node = <i key={`i${i}`}><b>{node}</b></i>;
    else if (p.italic) node = <i key={`i${i}`}>{node}</i>;
    else if (p.bold) node = <b key={`b${i}`}>{node}</b>;
    nodes.push(<Fragment key={i}>{node}</Fragment>);
  });
  return <>{nodes}</>;
}

function ReaderScrub({
  scroller,
  deps,
}: {
  scroller: { current: HTMLElement | null };
  deps: unknown;
}) {
  const thumbRef = useRef<HTMLSpanElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  useEffect(() => {
    const el = scroller.current;
    const thumb = thumbRef.current;
    const track = trackRef.current;
    const bar = barRef.current;
    if (!el || !thumb || !track || !bar) return;

    function layout() {
      const node = scroller.current;
      const th = thumbRef.current;
      const tr = trackRef.current;
      const b = barRef.current;
      if (!node || !th || !tr || !b) return;
      const max = node.scrollHeight - node.clientHeight;
      if (max <= 48) {
        b.style.display = "none";
        return;
      }
      b.style.display = "";
      const trackH = tr.clientHeight;
      const thumbH = th.offsetHeight || 38;
      const y = (node.scrollTop / max) * Math.max(1, trackH - thumbH);
      th.style.transform = `translateY(${Math.max(0, Math.min(trackH - thumbH, y))}px)`;
    }

    function fromY(clientY: number) {
      const node = scroller.current;
      const th = thumbRef.current;
      const tr = trackRef.current;
      if (!node || !th || !tr) return;
      const rect = tr.getBoundingClientRect();
      const thumbH = th.offsetHeight || 38;
      const y = Math.max(0, Math.min(rect.height - thumbH, clientY - rect.top - thumbH / 2));
      const max = node.scrollHeight - node.clientHeight;
      if (max > 0 && rect.height > thumbH) node.scrollTop = (y / (rect.height - thumbH)) * max;
      th.style.transform = `translateY(${y}px)`;
    }

    function onScroll() {
      if (!dragging.current) layout();
    }

    const onDown = (e: PointerEvent) => {
      dragging.current = true;
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      fromY(e.clientY);
      e.preventDefault();
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging.current) return;
      fromY(e.clientY);
      e.preventDefault();
    };
    const onUp = () => {
      dragging.current = false;
    };

    bar.addEventListener("pointerdown", onDown);
    bar.addEventListener("pointermove", onMove);
    bar.addEventListener("pointerup", onUp);
    bar.addEventListener("pointercancel", onUp);
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", layout);
    const ro = new ResizeObserver(layout);
    ro.observe(el);
    layout();
    return () => {
      bar.removeEventListener("pointerdown", onDown);
      bar.removeEventListener("pointermove", onMove);
      bar.removeEventListener("pointerup", onUp);
      bar.removeEventListener("pointercancel", onUp);
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", layout);
      ro.disconnect();
    };
  }, [scroller, deps]);

  return (
    <div ref={barRef} className="reader-scrub" aria-hidden="true">
      <div className="reader-scrub-track" ref={trackRef}>
        <span className="reader-scrub-thumb" ref={thumbRef} />
      </div>
    </div>
  );
}

function StoryPage() {
  const { slug } = Route.useParams();
  const story = getStory(slug);
  const navigate = useNavigate();
  const { user } = useCurrentUserState();
  const { has, toggle } = useBookmarks();
  const read = useStoryRead(slug);
  const [font, setFont] = useState<(typeof FONT_STEPS)[number]>(19);
  const { resolved, cycle } = useTheme();
  const paper = resolved === "light";
  const scrub = useReaderScrub();
  const [progress, setProgress] = useState(0);
  const [findQ, setFindQ] = useState("");
  const [findI, setFindI] = useState(0);
  const [showTop, setShowTop] = useState(false);
  const scroller = useRef<HTMLElement>(null);

  useEffect(() => {
    try {
      const f = Number(localStorage.getItem("yurec-font"));
      if (FONT_STEPS.includes(f as (typeof FONT_STEPS)[number])) {
        setFont(f as (typeof FONT_STEPS)[number]);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    setFindQ("");
    setFindI(0);
    const el = scroller.current;
    const last = readLast();
    const restore = Boolean(last && last.slug === slug && last.percent > 3 && last.percent < 99);
    if (!restore || !el || !last) {
      setProgress(0);
      el?.scrollTo({ top: 0 });
      return;
    }
    setProgress(last.percent);
    let raf1 = 0;
    let raf2 = 0;
    let timer = 0;
    const jump = () => {
      const max = el.scrollHeight - el.clientHeight;
      if (max > 0) el.scrollTo({ top: Math.round((last.percent / 100) * max) });
    };
    raf1 = window.requestAnimationFrame(() => {
      raf2 = window.requestAnimationFrame(jump);
    });
    timer = window.setTimeout(jump, 80);
    return () => {
      window.cancelAnimationFrame(raf1);
      window.cancelAnimationFrame(raf2);
      window.clearTimeout(timer);
    };
  }, [slug]);

  useEffect(() => {
    const el = scroller.current;
    if (!el || !story) return;
    const t = window.setTimeout(() => {
      const max = el.scrollHeight - el.clientHeight;
      if (max <= 0) persistProgress(story.slug, 100, Boolean(user));
    }, 120);
    return () => window.clearTimeout(t);
  }, [slug, story, user]);

  const paragraphs = useMemo(() => {
    if (!story) return [];
    return story.body
      .split(/\n{2,}/)
      .map((p) => p.trim())
      .filter(Boolean)
      .filter((p) => !/^\s*слушать на (youtube|ютуб)\b/i.test(p));
  }, [story]);

  const sms = useMemo(() => {
    if (!story || story.kind !== "sms") return null;
    return parseSmsThread(story.body);
  }, [story]);

  const off = story ? offlineForStory(story) : undefined;
  const adj = story ? adjacentStories(story.slug) : { prev: undefined, next: undefined };
  const saved = story ? has(story.slug) : false;

  const findChunks = useMemo(() => {
    if (sms && sms.messages.length) {
      return [...sms.intro, ...sms.messages.map((m) => m.text)];
    }
    return paragraphs;
  }, [sms, paragraphs]);

  const findTotal = useMemo(() => {
    const q = findQ.trim();
    if (!q) return 0;
    return findChunks.reduce((n, t) => n + findSpans(t, q).length, 0);
  }, [findChunks, findQ]);

  useEffect(() => {
    setFindI(0);
  }, [findQ]);

  useEffect(() => {
    if (!findQ.trim() || findTotal <= 0) return;
    const el = scroller.current?.querySelector(`[data-find="${findI}"]`);
    if (el instanceof HTMLElement) {
      el.scrollIntoView({ block: "center", behavior: "smooth" });
    }
  }, [findI, findQ, findTotal, slug]);

  function nextFind() {
    if (findTotal <= 0) return;
    setFindI((i) => (i + 1) % findTotal);
  }

  function onScroll() {
    const el = scroller.current;
    if (!el || !story) return;
    const max = el.scrollHeight - el.clientHeight;
    const pct = max <= 0 ? 100 : Math.min(100, Math.round((el.scrollTop / max) * 100));
    setProgress(pct);
    setShowTop(max > 80 && el.scrollTop > 160);
    persistProgress(story.slug, pct, Boolean(user));
  }

  function cycleFont() {
    const i = FONT_STEPS.indexOf(font);
    const next = FONT_STEPS[(i + 1) % FONT_STEPS.length];
    setFont(next);
    try {
      localStorage.setItem("yurec-font", String(next));
    } catch {
      /* ignore */
    }
  }

  if (!story) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="text-sm text-muted">Этого рассказа нет в сборнике.</p>
        <Link to="/" className="text-sm font-medium text-fg underline-offset-4 hover:underline">
          Назад к ленте
        </Link>
      </main>
    );
  }

  return (
    <main
      ref={scroller}
      onScroll={onScroll}
      className={cn(
        "h-dvh overflow-y-auto",
        scrub.show && "reader-scroller",
        paper ? "bg-paper text-ink" : "bg-bg text-fg",
      )}
    >
      <div
        className="sticky top-0 z-20 h-0.5 origin-left bg-current transition-transform duration-150 ease-out"
        style={{ transform: `scaleX(${progress / 100})` }}
        aria-hidden
      />
      <header
        className={cn(
          "sticky top-0.5 z-10 flex h-14 items-center gap-1 px-2 backdrop-blur-sm",
          paper ? "bg-paper/90" : "bg-bg/92",
        )}
      >
        <button
          type="button"
          onClick={() => {
            const ret = getReturnPath();
            if (ret.startsWith("/videos/")) {
              const cat = ret.split("/")[2];
              if (cat) {
                void navigate({ to: "/videos/$cat", params: { cat } });
                return;
              }
            }
            if (ret === "/videos" || ret.startsWith("/videos")) {
              void navigate({ to: "/videos" });
              return;
            }
            if (ret === "/saved" || ret.startsWith("/saved")) {
              void navigate({ to: "/saved" });
              return;
            }
            if (ret.startsWith("/characters")) {
              void navigate({ to: "/characters" });
              return;
            }
            if (ret === "/game/crosswords" || ret.startsWith("/game/crossword")) {
              void navigate({ to: "/game/crosswords" });
              return;
            }
            if (ret === "/game/quest" || (ret.startsWith("/game/") && ret !== "/game/")) {
              void navigate({ to: "/game/quest" });
              return;
            }
            if (ret.startsWith("/game")) {
              void navigate({ to: "/game" });
              return;
            }
            if (ret.startsWith("/press")) {
              void navigate({ to: "/videos/$cat", params: { cat: "press" } });
              return;
            }
            void navigate({ to: "/" });
          }}
          className="grid size-11 place-items-center rounded-md"
          aria-label="Назад"
        >
          <ArrowLeft className="size-5" />
        </button>
        <div className="min-w-0 flex-1">
          <p className={cn("truncate text-[10px] font-semibold tracking-wide", story.kind === "episode" ? "normal-case" : "uppercase", paper ? "text-ink-muted" : "text-muted")}>
            {formatCode(story)}
          </p>
          <p className="truncate text-sm font-semibold">{story.title}</p>
        </div>
        <button type="button" onClick={cycleFont} className="grid size-11 place-items-center rounded-md" aria-label="Размер шрифта">
          <span className="text-[15px] font-semibold leading-none tracking-tight">A±</span>
        </button>
        <button
          type="button"
          onClick={cycle}
          className="grid size-11 place-items-center rounded-md"
          aria-label="Тема"
        >
          {paper ? <Moon className="size-5" /> : <Sun className="size-5" />}
        </button>
        <button
          type="button"
          onClick={() => void toggle(story.slug)}
          className="grid size-11 place-items-center rounded-md"
          aria-label={saved ? "Убрать закладку" : "В закладки"}
        >
          {saved ? <BookmarkCheck className="size-5" /> : <Bookmark className="size-5" />}
        </button>
      </header>

      <article className={cn("read-col px-5 pt-4 pb-16", scrub.show && "pr-9")}>
        <p className={cn("text-[11px] font-medium tracking-[0.14em] uppercase", paper ? "text-ink-muted" : "text-muted")}>
          {KIND_LABEL[story.kind]}
          {story.date ? ` · ${formatRuDate(story.date)}` : ""}
        </p>
        <h1 className="mt-2 font-sans text-[28px] font-semibold leading-[1.15] tracking-tight">{story.title}</h1>
        <p className={cn("mt-2 flex flex-wrap items-center gap-2 text-sm", paper ? "text-ink-muted" : "text-muted")}>
          <span>
            {story.minutes} мин · с канала {TELEGRAM_URL.replace("https://", "")}
          </span>
          {story.kind === "episode" ? (
            <button
              type="button"
              onClick={() => toggleStoryRead(story.slug)}
              className={cn(
                "rounded-full px-2.5 py-1 font-sans text-[10px] font-semibold tracking-wide",
                read ? "bg-[#2f8f4e] text-[#e8f8ee]" : paper ? "bg-ink-muted/15 text-ink-muted" : "bg-elevated text-muted",
              )}
              aria-pressed={read}
              aria-label={read ? "Снять отметку «прочитано»" : "Отметить прочитанным"}
            >
              {read ? "прочитано" : "не прочитано"}
            </button>
          ) : null}
        </p>

        <div className="mt-4 flex flex-nowrap items-stretch gap-1.5">
          <TelegramLink story={story} />
          <YoutubeLink story={story} />
          {off ? <OfflineBtn item={off} className="flex-1 px-2" /> : null}
        </div>
        {story.kind === "sms" && story.youtubeId ? (
          <a
            href={youtubeWatchUrl(story.youtubeId)}
            target="_blank"
            rel="noreferrer"
            className="mt-4 block overflow-hidden rounded-2xl shadow-[0_0_0_1px_rgba(255,255,255,0.06)]"
          >
            <img
              src={`/thumbs/${story.slug}.jpg?v=${APP_VERSION}`}
              alt={story.title}
              className="aspect-video w-full object-cover"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = KIND_BANNERS.sms;
              }}
            />
          </a>
        ) : null}

        <div
          className={cn(
            "sticky top-14 z-10 -mx-5 mt-4 flex items-center gap-2 px-5 py-2 backdrop-blur-sm",
            paper ? "bg-paper/95" : "bg-bg/95",
          )}
        >
          <div className="relative min-w-0 flex-1">
            <Search
              className={cn(
                "pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2",
                paper ? "text-ink-muted" : "text-subtle",
              )}
            />
            <input
              type="search"
              value={findQ}
              onChange={(e) => setFindQ(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  nextFind();
                }
              }}
              placeholder="Найти в рассказе…"
              aria-label="Найти в рассказе"
              className={cn(
                "h-11 w-full rounded-xl pr-3 pl-10 text-sm shadow-[0_0_0_1px_rgba(255,255,255,0.06)] placeholder:text-subtle focus:outline-2 focus:outline-offset-2 focus:outline-accent",
                paper ? "bg-ink/8 text-ink" : "bg-surface text-fg",
              )}
            />
          </div>
          {findQ.trim() ? (
            <>
              <span className={cn("shrink-0 text-[11px] tabular-nums", paper ? "text-ink-muted" : "text-subtle")}>
                {findTotal ? `${findI + 1} / ${findTotal}` : "нет"}
              </span>
              <button
                type="button"
                onClick={nextFind}
                disabled={!findTotal}
                className={cn(
                  "h-11 shrink-0 rounded-xl px-3 text-xs font-medium",
                  paper ? "bg-ink/8 text-ink" : "bg-elevated text-fg",
                  !findTotal && "opacity-40",
                )}
              >
                Далее
              </button>
            </>
          ) : null}
        </div>

        {sms && sms.messages.length ? (
          <SmsThread
            intro={sms.intro}
            messages={sms.messages}
            paper={paper}
            font={font}
            query={findQ}
            current={findI}
          />
        ) : (
          <div
            className="mt-8 font-serif leading-[1.65]"
            style={{ fontSize: font }}
          >
            {(() => {
              let off = 0;
              return paragraphs.map((p, i) => {
                const from = off;
                off += findSpans(p, findQ).length;
                return (
                  <p key={i} className={cn("mb-5 whitespace-pre-wrap", isSceneHead(p) && "scene-head")}>
                    <HighlightText text={p} query={findQ} from={from} current={findI} />
                  </p>
                );
              });
            })()}
          </div>
        )}

        <nav className="mt-10 flex items-stretch gap-2">
          {adj.prev ? (
            <Link
              to="/story/$slug"
              params={{ slug: adj.prev.slug }}
              className={cn(
                "flex min-w-0 flex-1 items-center gap-1 rounded-xl px-3 py-3",
                paper ? "bg-ink/8" : "bg-surface",
              )}
            >
              <ChevronLeft className="size-4 shrink-0" />
              <span className="min-w-0">
                <span className={cn("block text-[10px] uppercase", paper ? "text-ink-muted" : "text-subtle")}>Назад</span>
                <span className="block truncate text-sm font-medium">{adj.prev.title}</span>
              </span>
            </Link>
          ) : (
            <span className="flex-1" />
          )}
          {adj.next ? (
            <Link
              to="/story/$slug"
              params={{ slug: adj.next.slug }}
              className={cn(
                "flex min-w-0 flex-1 items-center justify-end gap-1 rounded-xl px-3 py-3 text-right",
                paper ? "bg-ink/8" : "bg-surface",
              )}
            >
              <span className="min-w-0">
                <span className={cn("block text-[10px] uppercase", paper ? "text-ink-muted" : "text-subtle")}>Дальше</span>
                <span className="block truncate text-sm font-medium">{adj.next.title}</span>
              </span>
              <ChevronRight className="size-4 shrink-0" />
            </Link>
          ) : (
            <span className="flex-1" />
          )}
        </nav>
      </article>
      {showTop ? (
        <div className="pointer-events-none fixed inset-x-0 z-30 mx-auto flex w-full max-w-[var(--app-max)] justify-end px-4 bottom-[calc(1.5rem+env(safe-area-inset-bottom))]">
          <button
            type="button"
            aria-label="Наверх"
            onClick={() => scroller.current?.scrollTo({ top: 0, behavior: "smooth" })}
            className="pointer-events-auto grid size-11 place-items-center rounded-full bg-elevated text-fg shadow-[0_0_0_1px_rgba(255,255,255,0.14),0_10px_28px_rgba(0,0,0,0.45)]"
          >
            <ArrowUp className="size-5" strokeWidth={2.2} />
          </button>
        </div>
      ) : null}
      {scrub.show ? <ReaderScrub scroller={scroller} deps={slug + ":" + font + ":" + paragraphs.length} /> : null}
    </main>
  );
}

function ytLabel(_story: Story) {
  return "YouTube";
}

function tgLabel(_story: Story) {
  return "Telegram";
}

function YoutubeLink({ story }: { story: Story }) {
  const label = ytLabel(story);
  const href = story.youtubeId ? youtubeWatchUrl(story.youtubeId) : YOUTUBE_CHANNEL;
  const link = (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex h-10 min-w-0 flex-1 items-center justify-center rounded-full bg-yt px-2 text-xs font-medium text-yt-fg"
    >
      {label}
    </a>
  );
  if (story.paid) return <PaidGate label={label}>{link}</PaidGate>;
  if (!story.youtubeId) return null;
  return link;
}

function TelegramLink({ story }: { story: Story }) {
  const href = storyTelegramHref(story);
  if (!href) {
    return (
      <span className="inline-flex h-10 min-w-0 flex-1 items-center justify-center rounded-full bg-elevated px-2 text-xs font-medium">
        Telegram
      </span>
    );
  }
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex h-10 min-w-0 flex-1 items-center justify-center rounded-full bg-tg px-2 text-xs font-medium text-tg-fg"
    >
      {tgLabel(story)}
    </a>
  );
}

function SmsThread({
  intro,
  messages,
  paper,
  font,
  query,
  current,
}: {
  intro: string[];
  messages: { at: string; text: string }[];
  paper: boolean;
  font: number;
  query: string;
  current: number;
}) {
  let off = 0;
  return (
    <div className="mt-8">
      <div className="font-serif leading-[1.65]" style={{ fontSize: font }}>
        {intro.map((p, i) => {
          const from = off;
          off += findSpans(p, query).length;
          return (
            <p key={i} className={cn("mb-5 whitespace-pre-wrap", isSceneHead(p) && "scene-head")}>
              <HighlightText text={p} query={query} from={from} current={current} />
            </p>
          );
        })}
      </div>
      <p className={cn("mb-3 text-[11px] font-medium tracking-wide uppercase", paper ? "text-ink-muted" : "text-subtle")}>
        {messages.length} SMS · Fly
      </p>
      <ol className="flex flex-col gap-3">
        {messages.map((m, i) => {
          const from = off;
          off += findSpans(m.text, query).length;
          return (
            <li key={`${m.at}-${i}`}>
              <p className={cn("mb-1 text-[11px] tabular-nums", paper ? "text-ink-muted" : "text-subtle")}>
                {m.at}
              </p>
              <p
                className={cn(
                  "max-w-[92%] rounded-tr-2xl rounded-br-2xl rounded-bl-2xl px-3.5 py-2.5 leading-snug",
                  paper ? "bg-ink/10 text-ink" : "bg-elevated text-fg",
                )}
                style={{ fontSize: Math.max(15, font - 2) }}
              >
                <HighlightText text={m.text} query={query} from={from} current={current} />
              </p>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
