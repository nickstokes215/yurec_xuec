import { createFileRoute, Link } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import { stats, TELEGRAM_URL, YOUTUBE_URL } from "@/data/catalog";

export const Route = createFileRoute("/channel")({ component: ChannelPage });

function ChannelPage() {
  return (
    <main className="px-4 pt-4 pb-10">
      <p className="text-[11px] font-medium tracking-[0.16em] text-muted uppercase">О саге</p>
      <h2 className="mt-1 font-sans text-2xl font-semibold leading-tight">Жизнь Юрца</h2>
      <p className="mt-3 font-serif text-[17px] leading-relaxed text-muted">
        Комедийная сага в декорациях невской хрущёвки. Юрец, бабка Зинаида, Гоша без хвоста,
        «Олимпик», «Пятёрочка» и улица Шотмана — сборник рассказов с открытого канала и ролики
        к тем же сериям.
      </p>

      <dl className="mt-6 grid grid-cols-3 gap-2">
        {[
          [stats.episodes, "серий"],
          [stats.songs, "песен"],
          [stats.videos, "роликов"],
        ].map(([n, l]) => (
          <div key={String(l)} className="rounded-xl bg-surface px-3 py-4 text-center">
            <dt className="text-xl font-semibold tabular-nums">{n}</dt>
            <dd className="mt-0.5 text-[11px] text-muted">{l}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-6 flex flex-col gap-2">
        <a
          href={YOUTUBE_URL}
          target="_blank"
          rel="noreferrer"
          className="flex h-12 items-center justify-between rounded-xl bg-yt px-4 text-sm font-medium text-yt-fg"
        >
          YouTube · @yurec_xuec
          <ExternalLink className="size-4" />
        </a>
        <a
          href={TELEGRAM_URL}
          target="_blank"
          rel="noreferrer"
          className="flex h-12 items-center justify-between rounded-xl bg-tg px-4 text-sm font-medium text-tg-fg"
        >
          Telegram · t.me/yurec_xuec
          <ExternalLink className="size-4" />
        </a>
        <Link
          to="/apk"
          className="flex h-12 items-center justify-between rounded-xl bg-elevated px-4 text-sm font-medium"
        >
          Поставить на Android · APK
        </Link>
      </div>

      <section className="mt-8 rounded-xl bg-surface px-4 py-4">
        <h3 className="font-sans text-sm font-semibold">Автор</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Сценарий и режиссура: Константин Смирнов. Тексты публикуются в открытом телеграм-канале
          «Жизнь Юрца: Артхаусный хоррор».
        </p>
      </section>

      <p className="mt-6 font-serif text-sm leading-relaxed text-subtle">
        Основано на реальных событиях. Отдельные сцены драматизированы для усиления эмоционального
        воздействия. Все совпадения с реальными лицами и событиями случайны.
      </p>
    </main>
  );
}
