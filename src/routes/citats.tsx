import { createFileRoute, Link } from "@tanstack/react-router";
import { CITATS, CITATS_COVER, CITATS_PITCH } from "@/data/citats";
import { formatCode, getStory } from "@/data/catalog";
import { openZoom } from "@/lib/zoom";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/citats")({ component: CitatsPage });

const SPEAKER_TONE: Record<string, string> = {
  yurec: "bg-hero text-hero-fg",
  svetlana: "bg-ms text-fg",
  kostya: "bg-mp text-accent-fg",
  lysy: "bg-elevated text-fg",
  zinaida: "bg-mn text-fg",
  povar: "bg-mo text-fg",
  tolik: "bg-off text-off-fg",
  gosha: "bg-mc text-fg",
  zhenya: "bg-log text-log-fg",
  batya: "bg-mv text-fg",
};

function CitatsPage() {
  return (
    <main className="px-4 pt-4 pb-10 wide:px-6">
      <button
        type="button"
        onClick={() => openZoom(CITATS_COVER)}
        className="mx-auto block w-full max-w-[22rem]"
        aria-label="Открыть обложку: Зашквары Юрца"
      >
        <img
          src={CITATS_COVER}
          alt="Юрец читает книгу «Зашквары Юрца»"
          className="aspect-square w-full rounded-2xl object-cover shadow-[0_0_0_1px_rgba(255,255,255,0.08)]"
        />
      </button>
      <p className="mt-5 text-[11px] font-medium tracking-[0.16em] text-muted uppercase">Цитатник</p>
      <h2 className="mt-1 font-sans text-2xl font-semibold leading-tight">Зашквары Юрца</h2>
      <p className="mt-2 font-serif text-[16px] leading-relaxed text-muted">{CITATS_PITCH}</p>
      <p className="mt-4 text-center text-[12px] tabular-nums text-subtle">{CITATS.length} цитат</p>
      <ul className="citat-board mt-4">
        {CITATS.map((c) => {
          const story = getStory(c.slug);
          if (!story) return null;
          return (
            <li key={c.id} className="min-w-0">
              <Link
                to="/story/$slug"
                params={{ slug: c.slug }}
                className="flex h-full flex-col rounded-2xl bg-surface px-3 py-3 shadow-[0_0_0_1px_rgba(255,255,255,0.06)] transition-[transform,background-color] duration-150 ease-out active:scale-[0.99] hover:bg-elevated"
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={cn(
                      "inline-flex h-6 max-w-[72%] items-center truncate rounded-full px-2 text-[10px] font-semibold",
                      SPEAKER_TONE[c.speakerId] || "bg-elevated text-fg",
                    )}
                  >
                    {c.speaker}
                  </span>
                  <span className="shrink-0 text-[9px] font-medium tracking-wide text-subtle">
                    {formatCode(story)}
                  </span>
                </div>
                <p className="mt-2 flex-1 font-serif text-[14px] leading-snug text-fg italic">«{c.text}»</p>
                <p className="mt-2 truncate text-[11px] text-muted">
                  {story.title} <span className="text-subtle">▸</span>
                </p>
              </Link>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
