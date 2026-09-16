import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { ACH_COVER, ACH_LOCKED, ACH_PITCH, ACH_TOTAL, ACHIEVEMENTS, type Achievement } from "@/data/achievements";
import { useAchievements } from "@/lib/use-achievements";
import { openZoom } from "@/lib/zoom";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/zashkvary")({ component: ZashkvaryPage });

function formatWhen(ts: number) {
  if (!ts) return "";
  try {
    return new Date(ts).toLocaleString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

function ZashkvaryPage() {
  const { opened, when, count } = useAchievements();
  const [pick, setPick] = useState<Achievement | null>(null);
  const pickOpen = pick ? opened(pick.id) : false;

  return (
    <main className="px-4 pt-4 pb-10 wide:px-6">
      <Link to="/about" className="inline-flex h-10 items-center gap-1.5 text-sm text-muted">
        <ArrowLeft className="size-4" />
        Назад в Инфо
      </Link>
      <button
        type="button"
        onClick={() => openZoom(ACH_COVER)}
        className="mx-auto mt-3 block w-full max-w-[22rem]"
        aria-label="Открыть обложку: Зашквары двора"
      >
        <img
          src={ACH_COVER}
          alt="Зашквары двора"
          className="aspect-square w-full rounded-2xl object-cover shadow-[0_0_0_1px_rgba(255,255,255,0.08)]"
        />
      </button>
      <p className="mt-5 text-center text-[11px] font-medium tracking-[0.16em] text-muted uppercase">Инфо</p>
      <h2 className="mt-1 text-center font-sans text-2xl font-semibold leading-tight">Зашквары двора</h2>
      <p className="mt-2 font-serif text-[16px] leading-relaxed text-muted">{ACH_PITCH}</p>
      <p className="mt-4 text-center text-[12px] tabular-nums text-subtle">
        открыто {count} / {ACH_TOTAL}
      </p>
      <ul className="ach-board mt-4">
        {ACHIEVEMENTS.map((a) => {
          const on = opened(a.id);
          return (
            <li key={a.id}>
              <button
                type="button"
                onClick={() => setPick(a)}
                className={cn(
                  "flex h-full w-full flex-col overflow-hidden rounded-2xl bg-surface text-left shadow-[0_0_0_1px_rgba(255,255,255,0.06)]",
                  on && "shadow-[0_0_0_1px_rgba(201,162,39,0.45)]",
                )}
              >
                <span className="relative aspect-square w-full overflow-hidden bg-elevated">
                  <img
                    src={on ? a.photo : ACH_LOCKED}
                    alt=""
                    className={cn("h-full w-full object-cover", !on && "ach-locked-img")}
                  />
                  {!on ? (
                    <span className="ach-lock-label">???</span>
                  ) : null}
                </span>
                <span className={cn("block px-2.5 py-2 text-center text-[12px] font-semibold leading-tight", on ? "text-gold" : "text-subtle")}>
                  {on ? a.title : "Закрыто"}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {pick ? (
        <div
          className="fixed inset-0 z-[85] grid place-items-center bg-void/80 px-6"
          role="dialog"
          aria-modal="true"
          onClick={(e) => e.target === e.currentTarget && setPick(null)}
        >
          <div className="w-full max-w-[340px] overflow-hidden rounded-2xl bg-surface shadow-[0_0_0_1px_rgba(255,255,255,0.08)]">
            <img src={pickOpen ? pick.photo : ACH_LOCKED} alt="" className="aspect-square w-full object-cover" />
            <div className="px-4 py-4">
              <p className="text-center text-[11px] font-medium tracking-[0.14em] text-muted uppercase">
                {pickOpen ? "Зашквар открыт" : "Пока закрыто"}
              </p>
              <h3 className="mt-1 text-center font-sans text-xl font-semibold leading-tight">
                {pickOpen ? pick.title : "???"}
              </h3>
              <p className="mt-2 text-center font-serif text-[15px] leading-relaxed text-muted">
                {pickOpen ? pick.flavor : pick.hint}
              </p>
              {pickOpen && when(pick.id) ? (
                <p className="mt-2 text-center text-[11px] tabular-nums text-subtle">{formatWhen(when(pick.id))}</p>
              ) : null}
              <button
                type="button"
                onClick={() => setPick(null)}
                className="mt-4 flex h-11 w-full items-center justify-center rounded-xl bg-elevated text-sm font-medium"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
