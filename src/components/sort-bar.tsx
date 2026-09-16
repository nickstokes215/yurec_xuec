import type { ReactNode } from "react";
import { type SortMode } from "@/data/catalog";
import { cn } from "@/lib/utils";

const LABEL: Record<SortMode, string> = {
  old: "↓ Старые",
  new: "↑ Новые",
  az: "А↓Я",
  za: "Я↑А",
};

const ARIA: Record<SortMode, string> = {
  old: "сначала старые",
  new: "сначала новые",
  az: "по алфавиту от А до Я",
  za: "по алфавиту от Я до А",
};

const PILL =
  "relative inline-flex h-10 w-[11ch] shrink-0 items-center justify-center rounded-full px-2 text-[11px] font-medium";

export function SortButton({ mode, onCycle }: { mode: SortMode; onCycle: () => void }) {
  return (
    <button
      type="button"
      onClick={onCycle}
      className={cn(PILL, "bg-[#1e4a32] text-[#d4eadc]")}
      aria-label={ARIA[mode]}
    >
      <span className="absolute inset-0 flex items-center justify-center whitespace-nowrap">{LABEL[mode]}</span>
    </button>
  );
}

export function ChannelLink({ href, kind }: { href: string; kind: "yt" | "tg" }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={cn(PILL, kind === "tg" ? "bg-tg text-tg-fg" : "bg-yt text-yt-fg")}
    >
      Канал
    </a>
  );
}

export function SortSticky({
  count,
  mode,
  onCycle,
  channelHref,
  channelKind,
  leading,
  filters,
  className,
}: {
  count?: ReactNode;
  mode: SortMode;
  onCycle: () => void;
  channelHref?: string;
  channelKind?: "yt" | "tg";
  leading?: ReactNode;
  filters?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "sticky top-14 z-[15] -mx-4 border-b border-border bg-bg px-4 py-2",
        className,
      )}
    >
      {leading ? <div className="min-w-0">{leading}</div> : null}
      {filters}
      <div className={cn("flex items-center justify-between gap-2", (leading || filters) && "mt-2")}>
        <p className="min-w-0 truncate text-xs text-subtle">{count}</p>
        <div className="flex shrink-0 items-center gap-2">
          <SortButton mode={mode} onCycle={onCycle} />
          {channelHref && channelKind ? <ChannelLink href={channelHref} kind={channelKind} /> : null}
        </div>
      </div>
    </div>
  );
}
