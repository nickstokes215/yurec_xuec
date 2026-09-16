import { Link } from "@tanstack/react-router";
import { Clock3, Play } from "lucide-react";
import { APP_VERSION, formatCode, KIND_BANNERS, KIND_LABEL, type Story } from "@/data/catalog";
import { toggleStoryRead, useStoryRead } from "@/lib/use-read";
import { cn } from "@/lib/utils";

export function StoryCard({ story }: { story: Story }) {
  const read = useStoryRead(story.slug);

  return (
    <Link
      to="/story/$slug"
      params={{ slug: story.slug }}
      className="block rounded-xl bg-surface p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.06)] transition-[transform,background-color] duration-150 ease-out active:scale-[0.99] hover:bg-elevated"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="flex min-w-0 items-center gap-2">
          <span
            className={cn(
              "rounded-full bg-elevated px-2.5 py-1 font-sans text-[10px] font-semibold tracking-wide text-muted",
              story.kind === "episode" ? "normal-case" : "uppercase",
            )}
          >
            {formatCode(story)}
          </span>
          {story.kind === "episode" ? (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleStoryRead(story.slug);
              }}
              className={cn(
                "rounded-full px-2.5 py-1 font-sans text-[10px] font-semibold tracking-wide",
                read ? "bg-[#2f8f4e] text-[#e8f8ee]" : "bg-elevated text-muted",
              )}
              aria-pressed={read}
              aria-label={read ? "Снять отметку «прочитано»" : "Отметить прочитанным"}
            >
              {read ? "прочитано" : "не прочитано"}
            </button>
          ) : null}
        </span>
        <span className="flex items-center gap-3 text-[11px] text-subtle">
          {story.youtubeId && (
            <span className="inline-flex items-center gap-1 text-fg">
              <Play className="size-3 fill-current" />
              {story.kind === "song" ? "музыка" : "видео"}
            </span>
          )}
          <span className="inline-flex items-center gap-1">
            <Clock3 className="size-3" />
            {story.minutes} мин
          </span>
        </span>
      </div>
      <h2 className="mt-2.5 font-sans text-[17px] font-semibold leading-snug text-fg">
        {story.title}
      </h2>
      <p className="mt-1.5 line-clamp-3 font-serif text-[15px] leading-relaxed text-muted">
        {story.excerpt}
      </p>
      {story.kind === "sms" && story.youtubeId ? (
        <img
          src={`/thumbs/${story.slug}.jpg?v=${APP_VERSION}`}
          alt=""
          className="mt-3 aspect-video w-full rounded-lg object-cover"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = KIND_BANNERS.sms;
          }}
        />
      ) : null}
      {story.tags.length > 0 && (
        <p className="mt-3 truncate text-[11px] text-subtle">
          {story.kind !== "episode" ? `${KIND_LABEL[story.kind]} · ` : ""}
          {story.tags.slice(0, 3).join(" · ")}
        </p>
      )}
    </Link>
  );
}
