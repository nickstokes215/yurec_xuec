import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Search, Shuffle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ChipRow } from "@/components/chip-row";
import { SortSticky } from "@/components/sort-bar";
import { StoryCard } from "@/components/story-card";
import { Button } from "@/components/ui/button";
import {
  TELEGRAM_URL,
  ruCount,
  applyOrder,
  getStory,
  KIND_BANNERS,
  searchStories,
  stories,
  type StoryKind,
} from "@/data/catalog";
import { useContinueStory } from "@/lib/use-library";
import { useSortMode } from "@/lib/use-sort";
import { CITATS, citatOfDay } from "@/data/citats";
import { cn } from "@/lib/utils";
import { openZoom } from "@/lib/zoom";

export const Route = createFileRoute("/")({ component: Home });

const KINDS: { id: "all" | StoryKind; label: string }[] = [
  { id: "all", label: "Все" },
  { id: "episode", label: "Серии" },
  { id: "song", label: "Песни" },
  { id: "visit", label: "Визиты" },
  { id: "sms", label: "Бонусы" },
];

function readHomeKind(): "all" | StoryKind {
  try {
    const k = sessionStorage.getItem("yurec-home-kind");
    if (k === "episode" || k === "song" || k === "visit" || k === "sms" || k === "all") return k;
  } catch {
    /* ignore */
  }
  return "all";
}

function Home() {
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<"all" | StoryKind>("all");
  const { mode, cycle } = useSortMode();
  const navigate = useNavigate();
  const cont = useContinueStory();
  const contStory = cont ? getStory(cont.slug) : undefined;

  useEffect(() => {
    setKind(readHomeKind());
  }, []);

  useEffect(() => {
    function onReset() {
      try {
        sessionStorage.setItem("yurec-chips-home", "0");
      } catch {
        /* ignore */
      }
      window.dispatchEvent(new Event("yurec-zero-chips:yurec-chips-home"));
      pickKind("all");
      setQuery("");
    }
    window.addEventListener("yurec-reset-home", onReset);
    return () => window.removeEventListener("yurec-reset-home", onReset);
  }, []);

  const list = useMemo(
    () => applyOrder(searchStories(query, kind), mode),
    [query, kind, mode],
  );

  function pickKind(next: "all" | StoryKind) {
    setKind(next);
    setQuery("");
    try {
      sessionStorage.setItem("yurec-home-kind", next);
    } catch {
      /* ignore */
    }
  }

  function randomStory() {
    const pick = stories[Math.floor(Math.random() * stories.length)];
    if (pick) void navigate({ to: "/story/$slug", params: { slug: pick.slug } });
  }

  const banner = KIND_BANNERS[kind] || KIND_BANNERS.all;
  const dayCitat = useMemo(() => citatOfDay(), []);

  return (
    <main className="px-4 pb-8 pt-4 wide:px-6">
      <section className="relative overflow-hidden rounded-2xl bg-surface">
        <button
          type="button"
          onClick={() => openZoom(banner)}
          className="relative block w-full text-left"
          aria-label="Открыть баннер"
        >
          <img
            src={banner}
            alt=""
            className="h-48 w-full object-cover object-top opacity-80 outline outline-1 -outline-offset-1 outline-fg/10 wide:h-64"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/40 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-4">
            <p className="text-[11px] font-medium tracking-[0.16em] text-accent uppercase">
              Сборник рассказов
            </p>
            <h2 className="mt-1 font-sans text-2xl font-semibold leading-tight">Жизнь Юрца</h2>
            <p className="mt-1 text-sm text-muted">рассказы · ролики · песни · игры</p>
          </div>
        </button>
      </section>

      <Link
        to="/citats"
        className="mt-4 block rounded-2xl bg-surface px-4 py-3 shadow-[0_0_0_1px_rgba(255,255,255,0.06)]"
      >
        <p className="text-[11px] font-medium tracking-[0.16em] text-accent uppercase">Цитата дня</p>
        <p className="mt-2 font-serif text-[16px] leading-snug text-fg italic">«{dayCitat.text}»</p>
        <p className="mt-2 text-[12px] text-muted">
          {dayCitat.speaker} <span className="text-subtle">· {CITATS.length} в цитатнике</span>
        </p>
      </Link>

      {contStory && (
        <Link
          to="/story/$slug"
          params={{ slug: contStory.slug }}
          className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-elevated px-4 py-3 shadow-[0_0_0_1px_rgba(255,255,255,0.06)]"
        >
          <div className="min-w-0">
            <p className="text-[11px] font-medium tracking-wide text-muted uppercase">Продолжить</p>
            <p className="truncate text-sm font-semibold">{contStory.title}</p>
          </div>
          <span className="shrink-0 text-xs tabular-nums text-subtle">{cont?.percent ?? 0}%</span>
        </Link>
      )}

      <SortSticky
        count={ruCount(list.length, kind)}
        mode={mode}
        onCycle={cycle}
        channelHref={TELEGRAM_URL}
        channelKind="tg"
        className="pt-2 wide:-mx-6 wide:px-6"
        filters={
          <>
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-subtle" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Найти Юрца, Зинаиду, Гошу…"
                className="h-12 w-full rounded-xl bg-surface pr-3 pl-10 text-sm text-fg shadow-[0_0_0_1px_rgba(255,255,255,0.06)] placeholder:text-subtle focus:outline-2 focus:outline-offset-2 focus:outline-accent"
              />
            </div>
            <ChipRow storageKey="yurec-chips-home" deps={kind} className="mt-3">
              {KINDS.map((k) => (
                <button
                  key={k.id}
                  type="button"
                  onClick={() => pickKind(k.id)}
                  className={cn(
                    "h-9 shrink-0 rounded-full px-3.5 text-xs font-medium",
                    kind === k.id ? "bg-accent text-accent-fg" : "bg-surface text-muted",
                  )}
                >
                  {k.label}
                </button>
              ))}
              <Button variant="subtle" size="pill" onClick={randomStory} className="shrink-0">
                <Shuffle className="size-3.5" />
                Случайный
              </Button>
            </ChipRow>
          </>
        }
      />

      <div className="board mt-3">
        {list.map((story) => (
          <StoryCard key={story.slug} story={story} />
        ))}
        {list.length === 0 && (
          <p className="rounded-xl bg-surface px-4 py-10 text-center text-sm text-muted">
            По этому запросу на Шотмана тишина.
          </p>
        )}
      </div>
    </main>
  );
}
