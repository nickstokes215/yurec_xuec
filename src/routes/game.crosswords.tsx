import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { CROSSWORDS } from "@/data/crossword";
import { CROSSWORD_PITCH } from "@/data/game";
import { useAllEndings, useGameProgress } from "@/lib/use-game";
import { openZoom } from "@/lib/zoom";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/game/crosswords")({ component: CrosswordsHub });

function CrosswordsHub() {
  const all = useAllEndings();
  const open = CROSSWORDS.reduce((n, cw) => n + (all[cw.id]?.length ?? 0), 0);

  return (
    <main className="px-4 pt-4 pb-10 wide:px-6">
      <Link to="/game" className="inline-flex items-center gap-1 text-[11px] font-medium tracking-wide text-muted uppercase">
        <ArrowLeft className="size-3.5" />
        Игры
      </Link>
      <p className="mt-3 text-[11px] font-medium tracking-[0.16em] text-muted uppercase">Игра</p>
      <h2 className="mt-1 font-sans text-2xl font-semibold leading-tight">Шотманские кроссворды</h2>
      <div className="mt-3 space-y-2 font-serif text-[16px] leading-relaxed text-muted">
        {CROSSWORD_PITCH.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </div>
      <p className="mt-5 text-center text-[12px] tabular-nums text-subtle">
        разгадано {open} / {CROSSWORDS.length}
      </p>
      <div className="mt-3 mb-5 h-px bg-border" role="separator" />
      <ul className="board">
        {CROSSWORDS.map((cw) => (
          <CrosswordCard key={cw.id} id={cw.id} shortTitle={cw.shortTitle} cover={cw.cover} pitch={cw.pitch} />
        ))}
      </ul>
    </main>
  );
}

function CrosswordCard({
  id,
  shortTitle,
  cover,
  pitch,
}: {
  id: string;
  shortTitle: string;
  cover: string;
  pitch: string;
}) {
  const { endings } = useGameProgress(id);
  const open = endings.length > 0;
  return (
    <li className="h-full">
      <article className="flex h-full flex-col overflow-hidden rounded-2xl bg-surface shadow-[0_0_0_1px_rgba(255,255,255,0.06)]">
        <button
          type="button"
          onClick={() => openZoom(cover)}
          className="relative aspect-video bg-elevated"
          aria-label={`Открыть обложку: ${shortTitle}`}
        >
          <img src={cover} alt="" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-bg via-bg/60 to-transparent p-4 text-left">
            <h3 className="font-sans text-xl font-semibold leading-tight">{shortTitle}</h3>
          </div>
        </button>
        <Link to="/game/$id" params={{ id }} className="flex flex-1 flex-col px-4 pt-3 pb-4">
          <p className="min-h-[10rem] flex-1 font-serif text-[14px] leading-relaxed text-muted">{pitch}</p>
          <p className="mt-3 text-center text-[15px] font-medium tabular-nums text-subtle">{open ? "разгадан" : "не разгадан"}</p>
          <span
            className={cn(
              "mt-3 grid h-12 w-full place-items-center rounded-xl text-[15px] font-semibold tracking-wide",
              open ? "bg-elevated text-fg" : "bg-hero text-hero-fg shadow-[0_0_0_1px_rgba(232,195,106,0.35)]",
            )}
          >
            {open ? "Открыть сетку" : "Разгадывать"}
          </span>
        </Link>
      </article>
    </li>
  );
}
