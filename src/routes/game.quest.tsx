import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { LEVELS, QUEST_PITCH } from "@/data/game";
import { useAllEndings, useGameProgress } from "@/lib/use-game";
import { openZoom } from "@/lib/zoom";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/game/quest")({ component: QuestHub });

function QuestHub() {
  const all = useAllEndings();
  const open = LEVELS.reduce((n, l) => n + ((all[l.id]?.length ?? 0) >= l.endings.length && l.endings.length > 0 ? 1 : 0), 0);
  const total = LEVELS.length;

  return (
    <main className="px-4 pt-4 pb-10 wide:px-6">
      <Link to="/game" className="inline-flex items-center gap-1 text-[11px] font-medium tracking-wide text-muted uppercase">
        <ArrowLeft className="size-3.5" />
        Игры
      </Link>
      <p className="mt-3 text-[11px] font-medium tracking-[0.16em] text-muted uppercase">Игра</p>
      <h2 className="mt-1 font-sans text-2xl font-semibold leading-tight">Юрцовский квест</h2>
      <div className="mt-3 space-y-2 font-serif text-[16px] leading-relaxed text-muted">
        {QUEST_PITCH.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </div>
      <p className="mt-5 text-center text-[12px] tabular-nums text-subtle">
        пройдено {open} / {total}
      </p>
      <div className="mt-3 mb-5 h-px bg-border" role="separator" />
      <ul className="board">
        {LEVELS.map((lvl) => (
          <LevelCard
            key={lvl.id}
            id={lvl.id}
            kicker={`Уровень ${lvl.number}`}
            shortTitle={lvl.shortTitle}
            cover={lvl.cover}
            pitch={lvl.pitch}
            ends={lvl.endings.length}
          />
        ))}
      </ul>
    </main>
  );
}

function LevelCard({
  id,
  kicker,
  shortTitle,
  cover,
  pitch,
  ends,
}: {
  id: string;
  kicker: string;
  shortTitle: string;
  cover: string;
  pitch: string;
  ends: number;
}) {
  const { save, endings } = useGameProgress(id);
  const open = endings.length;
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
            <p className="text-[11px] font-medium tracking-[0.16em] text-accent uppercase">{kicker}</p>
            <h3 className="mt-0.5 font-sans text-xl font-semibold leading-tight">{shortTitle}</h3>
          </div>
        </button>
        <Link
          to="/game/$id"
          params={{ id }}
          className="flex flex-1 flex-col px-4 pt-3 pb-4"
        >
          <p className="min-h-[10rem] flex-1 font-serif text-[14px] leading-relaxed text-muted">{pitch}</p>
          <div className="mt-3 flex items-center justify-between gap-3">
            <p className="text-[11px] tabular-nums text-subtle">концовок {open} / {ends}</p>
            <span
              className={cn(
                "inline-flex h-8 items-center rounded-full px-3 text-xs font-medium",
                save || open ? "bg-hero text-hero-fg" : "bg-elevated text-fg",
              )}
            >
              {save ? `Продолжить · ${save.steps}` : "Играть"}
            </span>
          </div>
        </Link>
      </article>
    </li>
  );
}
