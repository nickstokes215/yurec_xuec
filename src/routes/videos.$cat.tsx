import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { SortSticky } from "@/components/sort-bar";
import {
  PRESS_ISSUES,
  applyOrder,
  channelForCat,
  coverFallback,
  getMediaCat,
  isYoutubeMedia,
  mediaByCat,
  mediaStamp,
  parseEpisodeCode,
  pressTitle,
  searchMedia,
  telegramPostUrl,
  videoCover,
  youtubeThumb,
  youtubeWatchUrl,
  type PressIssue,
  type Video,
} from "@/data/catalog";
import { useSortMode } from "@/lib/use-sort";
import { openZoom } from "@/lib/zoom";
import { cn } from "@/lib/utils";
import { OfflineBtn } from "@/components/offline-btn";
import { offlineForVideo } from "@/lib/offline";

export const Route = createFileRoute("/videos/$cat")({ component: MediaShelfRoute });

function MediaShelfRoute() {
  const { cat } = Route.useParams();
  return <MediaShelf key={cat} cat={cat} />;
}

function youtubeUrl(v: Video) {
  if (v.kind === "short") return `https://www.youtube.com/shorts/${v.id}`;
  return youtubeWatchUrl(v.id);
}

export function MediaSearch({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-subtle" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Найти по названию…"
        className="h-12 w-full rounded-xl bg-surface pr-3 pl-10 text-sm text-fg shadow-[0_0_0_1px_rgba(255,255,255,0.06)] placeholder:text-subtle focus:outline-2 focus:outline-offset-2 focus:outline-accent"
      />
    </div>
  );
}

function MediaShelf({ cat }: { cat: string }) {
  const meta = getMediaCat(cat);
  const { mode, cycle } = useSortMode();
  const [query, setQuery] = useState("");

  const list = useMemo(
    () => applyOrder(searchMedia(mediaByCat(cat), query), mode),
    [cat, mode, query],
  );
  const issues = useMemo(() => applyOrder(searchMedia(PRESS_ISSUES, query), mode), [mode, query]);
  const channel = channelForCat(cat);

  if (!meta) {
    return (
      <main className="px-4 pt-10 text-center">
        <p className="text-sm text-muted">Этой полки в архиве нет.</p>
        <Link to="/videos" className="mt-4 inline-flex h-11 items-center rounded-xl bg-elevated px-4 text-sm">
          К медиа
        </Link>
      </main>
    );
  }

  const total = meta.id === "press" ? issues.length : list.length;
  const looking = Boolean(query.trim());

  return (
    <main className="px-4 pt-4 pb-8">
      <SortSticky
        mode={mode}
        onCycle={cycle}
        count={`${meta.kicker} · ${total}`}
        channelHref={channel.href}
        channelKind={channel.kind}
        leading={
          <div className="min-w-0">
            <Link to="/videos" className="inline-flex items-center gap-1 text-[11px] font-medium tracking-wide text-muted uppercase">
              <ArrowLeft className="size-3.5" />
              Медиа
            </Link>
            <h2 className="mt-0.5 font-sans text-xl font-semibold leading-tight">{meta.label}</h2>
          </div>
        }
        filters={
          <div className="mt-2">
            <MediaSearch value={query} onChange={setQuery} />
          </div>
        }
      />

      <ul className={cn(meta.id === "press" ? "press-list" : "board mt-4")}>
        {meta.id === "press"
          ? issues.map((issue, i) => (
              <li key={issue.id}>
                <IssueCard issue={issue} zebra={i % 2 === 1} />
              </li>
            ))
          : list.map((v) => (
              <li key={v.id}>{isYoutubeMedia(v) ? <YoutubeCard v={v} portrait={v.kind === "short" && !v.thumb} /> : <PhotoCard v={v} />}</li>
            ))}
        {total === 0 && (
          <p className="rounded-xl bg-surface px-4 py-10 text-center text-sm text-muted">
            {looking ? "По этому запросу на Шотмана тишина." : "Пока пусто. Юрец ещё не начудил."}
          </p>
        )}
      </ul>
    </main>
  );
}

function codeClass(code?: string, title?: string) {
  return cn(
    "text-[10px] font-semibold tracking-wide text-muted",
    parseEpisodeCode(code, title) ? "normal-case" : "uppercase",
  );
}

function onCoverError(img: HTMLImageElement, v: Video) {
  const step = img.dataset.coverStep || "0";
  if (step === "0" && v.id && v.mediaType !== "image") {
    img.dataset.coverStep = "1";
    img.src = youtubeThumb(v.id);
    return;
  }
  img.dataset.coverStep = "2";
  img.onerror = null;
  img.src = coverFallback(v.kind);
}

export function YoutubeCard({ v, portrait }: { v: Video; portrait?: boolean }) {
  const cover = videoCover(v);
  const kicker = mediaStamp(v) || v.code;
  const off = offlineForVideo(v);
  return (
    <article className="overflow-hidden rounded-xl bg-surface shadow-[0_0_0_1px_rgba(255,255,255,0.06)]">
      <button type="button" onClick={() => openZoom(cover)} className="block w-full" aria-label="Открыть обложку">
        <img
          src={cover}
          alt=""
          loading="eager"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={(e) => onCoverError(e.currentTarget, v)}
          className={
            portrait
              ? "mx-auto aspect-[9/16] max-h-80 w-auto object-cover outline outline-1 -outline-offset-1 outline-fg/10"
              : "aspect-video w-full object-cover outline outline-1 -outline-offset-1 outline-fg/10"
          }
        />
      </button>
      <div className="px-4 py-3">
        <p className={codeClass(v.code, v.title)}>{kicker}</p>
        <h3 className="mt-0.5 font-sans text-[15px] font-semibold leading-snug">{v.title}</h3>
        <div className="mt-2 flex items-stretch gap-2">
          {v.storySlug && v.kind !== "short" ? (
            <Link
              to="/story/$slug"
              params={{ slug: v.storySlug }}
              className="inline-flex h-10 min-w-0 flex-1 items-center justify-center rounded-full bg-tg px-3 text-xs font-medium text-tg-fg"
            >
              {v.kind === "song" ? "Текст" : "Читать"}
            </Link>
          ) : v.telegramId ? (
            <a
              href={telegramPostUrl(v.telegramId)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-10 min-w-0 flex-1 items-center justify-center rounded-full bg-tg px-3 text-xs font-medium text-tg-fg"
            >
              Пост в Telegram
            </a>
          ) : null}
          <a
            href={youtubeUrl(v)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-10 min-w-0 flex-1 items-center justify-center rounded-full bg-yt px-3 text-xs font-medium text-yt-fg"
          >
            {v.kind === "song" ? "Слушать" : "Смотреть"}
          </a>
          {off ? <OfflineBtn item={off} /> : null}
        </div>
      </div>
    </article>
  );
}

export function PhotoCard({ v }: { v: Video }) {
  const src = v.kind === "call" ? "" : videoCover(v);
  const scan = v.kind === "press";
  const listen = v.kind === "call";
  return (
    <article className="overflow-hidden rounded-xl bg-surface shadow-[0_0_0_1px_rgba(255,255,255,0.06)]">
      {src ? (
        <button type="button" onClick={() => openZoom(src)} className="block w-full" aria-label="Открыть">
          <img
            src={src}
            alt=""
            loading="eager"
            decoding="async"
            referrerPolicy="no-referrer"
            onError={(e) => onCoverError(e.currentTarget, v)}
            className={
              scan
                ? "w-full bg-[#e7dcc4] object-contain outline outline-1 -outline-offset-1 outline-fg/10"
                : "max-h-96 w-full object-cover outline outline-1 -outline-offset-1 outline-fg/10"
            }
          />
        </button>
      ) : null}
      <div className="px-4 py-3">
        <p className={codeClass(v.code, v.title)}>{mediaStamp(v) || v.code}</p>
        <h3 className="mt-0.5 font-sans text-[15px] font-semibold leading-snug">{v.title}</h3>
        {v.caption ? (
          <p className="mt-2 font-serif text-[14px] leading-relaxed text-muted">{v.caption}</p>
        ) : null}
        <div className="mt-3 flex flex-nowrap items-stretch gap-2">
          {v.telegramId ? (
            <a
              href={telegramPostUrl(v.telegramId)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-10 min-w-0 flex-1 items-center justify-center rounded-full bg-tg px-3 text-xs font-medium text-tg-fg"
            >
              {listen ? "Слушать" : "Пост в Telegram"}
            </a>
          ) : null}
          {v.storySlug ? (
            <Link
              to="/story/$slug"
              params={{ slug: v.storySlug }}
              className="inline-flex h-10 min-w-0 flex-1 items-center justify-center rounded-full bg-tg px-3 text-xs font-medium text-tg-fg"
            >
              Читать
            </Link>
          ) : null}
          {listen && offlineForVideo(v) ? <OfflineBtn item={offlineForVideo(v)!} /> : null}
        </div>
      </div>
    </article>
  );
}

export function IssueCard({ issue, zebra }: { issue: PressIssue; zebra?: boolean }) {
  return (
    <Link
      to="/press/$id"
      params={{ id: issue.id }}
      className={cn("issue-card", zebra && "zebra")}
    >
      <h3 className="font-sans text-[17px] font-semibold leading-snug">{pressTitle(issue)}</h3>
    </Link>
  );
}
