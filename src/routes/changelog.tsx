import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { APP_VERSION, CHANGELOG } from "@/data/catalog";

export const Route = createFileRoute("/changelog")({ component: ChangelogPage });

function ChangelogPage() {
  return (
    <main className="px-4 pt-4 pb-10">
      <Link
        to="/about"
        className="inline-flex h-10 items-center gap-1.5 text-sm text-muted"
      >
        <ArrowLeft className="size-4" />
        Назад в Инфо
      </Link>
      <p className="mt-4 text-[11px] font-medium tracking-[0.16em] text-muted uppercase">
        О приложении
      </p>
      <h2 className="mt-1 font-sans text-2xl font-semibold leading-tight">История изменений</h2>
      <p className="mt-2 text-sm text-subtle">Краткая история сборок.</p>
      <ol className="mt-4 flex flex-col gap-2">
        {CHANGELOG.map((entry) => (
          <li
            key={entry.version}
            className="rounded-xl bg-surface px-4 py-3 shadow-[0_0_0_1px_rgba(255,255,255,0.06)]"
          >
            <div className="flex items-baseline justify-between gap-3">
              <p className="font-sans text-sm font-semibold tabular-nums">{entry.version}</p>
              <p className="text-[11px] tabular-nums text-subtle">{entry.at}</p>
            </div>
            <ul className="mt-2 space-y-1 text-sm leading-snug text-muted">
              {entry.items.map((item) => (
                <li key={item} className="pl-3 -indent-3">
                  — {item}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
      <p className="mt-6 text-xs tabular-nums text-subtle">Текущая версия {APP_VERSION}.</p>
    </main>
  );
}
