import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  MEDIA_CATS,
  PRESS_ISSUES,
  isYoutubeMedia,
  mediaByCat,
  searchMedia,
  videos,
} from "@/data/catalog";
import { cn } from "@/lib/utils";
import { IssueCard, MediaSearch, PhotoCard, YoutubeCard } from "./videos.$cat";

export const Route = createFileRoute("/videos/")({ component: MediaHub });

const TINT: Record<string, string> = {
  video: "text-mv",
  shorts: "text-ms",
  songs: "text-mn",
  press: "text-mp",
  call: "text-mc",
  other: "text-mo",
};

function ruCount(n: number, cat: string) {
  if (cat === "video") return n === 1 ? "1 серия" : n < 5 ? `${n} серии` : `${n} серий`;
  if (cat === "shorts") return n === 1 ? "1 шортс" : `${n} шортсов`;
  if (cat === "songs") return n === 1 ? "1 песня" : n < 5 ? `${n} песни` : `${n} песен`;
  if (cat === "press") return n === 1 ? "1 выпуск" : n < 5 ? `${n} выпуска` : `${n} выпусков`;
  if (cat === "call") return n === 1 ? "1 звонок" : n < 5 ? `${n} звонка` : `${n} звонков`;
  return n === 1 ? "1 прикол" : n < 5 ? `${n} прикола` : `${n} приколов`;
}

function MediaHub() {
  const [query, setQuery] = useState("");
  useEffect(() => {
    function onReset() {
      setQuery("");
    }
    window.addEventListener("yurec-reset-media", onReset);
    return () => window.removeEventListener("yurec-reset-media", onReset);
  }, []);
  const looking = Boolean(query.trim());
  const hits = useMemo(() => searchMedia(videos, query), [query]);
  const issues = useMemo(() => searchMedia(PRESS_ISSUES, query), [query]);
  const total = hits.length + issues.length;

  return (
    <main className="px-4 pt-4 pb-8">
      <p className="text-[11px] font-medium tracking-[0.16em] text-muted uppercase">Архив Шотмана</p>
      <h2 className="mt-1 font-sans text-2xl font-semibold leading-tight">Медиа</h2>
      <p className="mt-2 font-serif text-[16px] leading-relaxed text-muted">
        Серии, шортсы, песни, газета, звонки и прочий угар. Жми плитку — внутри своя полка.
      </p>

      <div className="sticky top-14 z-[15] -mx-4 mt-2 border-b border-border bg-bg px-4 py-2">
        <MediaSearch value={query} onChange={setQuery} />
        {looking ? <p className="mt-2 text-xs text-subtle">{total} по запросу</p> : null}
      </div>

      {looking ? (
        <ul className="board mt-4">
          {hits.map((v) => (
            <li key={v.id}>{isYoutubeMedia(v) ? <YoutubeCard v={v} portrait={v.kind === "short" && !v.thumb} /> : <PhotoCard v={v} />}</li>
          ))}
          {issues.map((issue) => (
            <li key={issue.id}>
              <IssueCard issue={issue} />
            </li>
          ))}
          {total === 0 ? (
            <p className="rounded-xl bg-surface px-4 py-10 text-center text-sm text-muted">
              По этому запросу на Шотмана тишина.
            </p>
          ) : null}
        </ul>
      ) : (
        <section className="mt-3">
          <ul className="grid grid-cols-2 gap-3 wide:grid-cols-3">
            {MEDIA_CATS.map((cat) => {
              const n = cat.id === "press" ? PRESS_ISSUES.length : mediaByCat(cat.id).length;
              return (
                <li key={cat.id} className="min-h-0">
                  <Link
                    to="/videos/$cat"
                    params={{ cat: cat.id }}
                    className="relative block aspect-[5/4] overflow-hidden rounded-2xl shadow-[0_0_0_1px_rgba(255,255,255,0.08)] transition-transform duration-150 ease-out active:scale-[0.98] wide:aspect-video"
                  >
                    <img src={cat.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-void via-void/30 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-3.5">
                      <p className={cn("text-[10px] font-semibold tracking-[0.16em] uppercase", TINT[cat.id])}>
                        {cat.kicker}
                      </p>
                      <p className="mt-0.5 font-sans text-[20px] font-semibold leading-tight">{cat.label}</p>
                      <p className="mt-0.5 text-[11px] tabular-nums text-muted">{ruCount(n, cat.id)}</p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </main>
  );
}
