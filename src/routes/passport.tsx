import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useSyncExternalStore } from "react";
import { openZoom } from "@/lib/zoom";
import { collectPassport } from "@/lib/use-passport";
import changelogJson from "@/data/changelog.json";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/passport")({ component: PassportPage });

const COVER = `/covers/passport.jpg?v=${changelogJson.version}`;

function usePassport() {
  const stamp = useSyncExternalStore(
    (fn) => {
      window.addEventListener("yurec-progress", fn);
      window.addEventListener("yurec-av-wins", fn);
      window.addEventListener("yurec-ark-wins", fn);
      window.addEventListener("yurec-svoya", fn);
      window.addEventListener("yurec-endings", fn);
      window.addEventListener("yurec-license-changed", fn);
      return () => {
        window.removeEventListener("yurec-progress", fn);
        window.removeEventListener("yurec-av-wins", fn);
        window.removeEventListener("yurec-ark-wins", fn);
        window.removeEventListener("yurec-svoya", fn);
        window.removeEventListener("yurec-endings", fn);
        window.removeEventListener("yurec-license-changed", fn);
      };
    },
    () => JSON.stringify(collectPassport()),
    () => "",
  );
  return stamp ? (JSON.parse(stamp) as ReturnType<typeof collectPassport>) : { rows: [], lines: [] };
}

function PassportPage() {
  const data = usePassport();
  return (
    <main className="px-4 pt-4 pb-10">
      <Link to="/about" className="inline-flex h-10 items-center gap-1.5 text-sm text-muted">
        <ArrowLeft className="size-4" />
        Назад в Инфо
      </Link>
      <button
        type="button"
        onClick={() => openZoom(COVER)}
        className="mx-auto mt-3 block w-full max-w-[22rem]"
        aria-label="Открыть обложку: Паспорт двора"
      >
        <img src={COVER} alt="Паспорт двора" className="aspect-square w-full rounded-2xl object-cover shadow-[0_0_0_1px_rgba(255,255,255,0.08)]" />
      </button>
      <p className="mt-5 text-center text-[11px] font-medium tracking-[0.16em] text-muted uppercase">Справка</p>
      <h2 className="mt-1 text-center font-sans text-2xl font-semibold leading-tight">Паспорт двора</h2>
      <p className="mt-2 text-center font-serif text-[16px] leading-relaxed text-muted">
        Что двор уже запомнил. Скринь в канал — или молчи, как Юрец после рюмки.
      </p>

      <section className="mt-5 overflow-hidden rounded-2xl bg-surface px-4 py-4 shadow-[0_0_0_1px_rgba(255,255,255,0.06)]">
        <ul className="divide-y divide-border">
          {data.rows.map((r) => (
            <li key={r.k} className="flex items-baseline justify-between gap-3 py-2.5">
              <span className="text-[13px] text-muted">{r.k}</span>
              <span className={cn("text-[15px] font-semibold tabular-nums", r.gold ? "text-gold" : "text-fg")}>{r.v}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-3 rounded-2xl bg-surface px-4 py-4 shadow-[0_0_0_1px_rgba(255,255,255,0.06)]">
        {data.lines.map((t) => (
          <p key={t} className="font-serif text-[15px] leading-relaxed text-muted">
            {t}
          </p>
        ))}
      </section>
    </main>
  );
}
