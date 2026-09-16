import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import {
  cachedCount,
  formatBytes,
  initOffline,
  isOfflineAudio,
  offlineItems,
  offlineKindLabel,
  offlinePlayerMode,
  offlineSnap,
  packBytes,
  playOffline,
  removeOffline,
  setOfflinePlayerMode,
  startDownload,
  startDownloadAll,
  subscribeOffline,
  type OfflineItem,
} from "@/lib/offline";
import { cn } from "@/lib/utils";

export function OfflineAccessPage() {
  const [, bump] = useState(0);
  const [confirm, setConfirm] = useState(false);
  useEffect(() => {
    initOffline();
    return subscribeOffline(() => bump((n) => n + 1));
  }, []);
  useEffect(() => {
    const prev = (window as Window & { yurecBack?: () => boolean }).yurecBack;
    (window as Window & { yurecBack?: () => boolean }).yurecBack = () => {
      if (confirm) {
        setConfirm(false);
        return true;
      }
      return prev ? prev() : false;
    };
    return () => {
      (window as Window & { yurecBack?: () => boolean }).yurecBack = prev;
    };
  }, [confirm]);
  const items = offlineItems();
  const have = cachedCount();
  const total = items.length;
  const totalBytes = packBytes();
  const ext = offlinePlayerMode() === "ext";

  return (
    <main className="px-4 pt-4 pb-10">
      <Link to="/donate" className="inline-flex h-10 items-center gap-1.5 text-sm text-muted">
        <ArrowLeft className="size-4" />
        Назад к пожертвованию
      </Link>
      <p className="mt-4 text-[11px] font-medium tracking-[0.16em] text-muted uppercase">О приложении</p>
      <h2 className="mt-1 font-sans text-2xl font-semibold leading-tight">Оффлайн-доступ</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        {have} из {total} файлов · весь пакет {formatBytes(totalBytes)}
      </p>

      <div className="mt-4 rounded-2xl bg-surface px-4 py-3 shadow-[0_0_0_1px_rgba(255,255,255,0.06)]">
        <p className="text-center text-[11px] font-medium tracking-[0.14em] text-muted uppercase">Как смотреть видео</p>
        <button
          type="button"
          role="switch"
          aria-checked={ext}
          onClick={() => setOfflinePlayerMode(ext ? "in" : "ext")}
          className="mt-2 flex h-11 w-full overflow-hidden rounded-xl bg-[#152536] p-1"
        >
          <span
            className={cn(
              "grid flex-1 place-items-center rounded-lg px-1 text-center text-[12px] font-medium leading-tight transition-colors",
              !ext ? "bg-[#2d6aa6] text-white" : "text-muted",
            )}
          >
            Встроенный плеер
          </span>
          <span
            className={cn(
              "grid flex-1 place-items-center rounded-lg px-1 text-center text-[12px] font-medium leading-tight transition-colors",
              ext ? "bg-[#2d6aa6] text-white" : "text-muted",
            )}
          >
            Другой плеер
          </span>
        </button>
        <p className="mt-2 text-center text-[11px] leading-relaxed text-subtle">
          {ext
            ? "Ролик откроется через внешний медиаплеер устройства."
            : "Ролик запустится во встроенном проигрывателе внутри приложения."}
        </p>
      </div>

      <button
        type="button"
        onClick={() => setConfirm(true)}
        className="mt-6 grid h-12 w-full place-items-center rounded-xl bg-dl px-4 text-sm font-medium text-dl-fg"
      >
        Скачать всё
      </button>
      <ul className="mt-4 space-y-2">
        {items.map((item) => (
          <OfflineRow key={item.id} item={item} />
        ))}
      </ul>
      {confirm ? (
        <div
          className="fixed inset-0 z-[85] grid place-items-center bg-void/80 px-6"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-[340px] rounded-2xl bg-surface p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.08)]">
            <p className="text-center font-sans text-[15px] font-semibold leading-snug">Скачать всё?</p>
            <p className="mt-2 text-center text-[13px] leading-relaxed text-muted">
              Весь медиа-контент весит {formatBytes(totalBytes)}. Файлы качаются по очереди и останутся на телефоне для
              просмотра без сети.
            </p>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setConfirm(false)}
                className="h-11 flex-1 rounded-xl bg-danger text-sm font-medium text-danger-fg"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirm(false);
                  startDownloadAll();
                }}
                className="h-11 flex-1 rounded-xl bg-off text-sm font-medium text-off-fg"
              >
                Скачать
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}

function OfflineRow({ item }: { item: OfflineItem }) {
  const snap = offlineSnap(item.id);
  const cached = snap.state === "cached";
  const busy = snap.state === "downloading";
  return (
    <li className="rounded-xl bg-elevated px-3 py-2">
      <p className="text-[13px] font-medium leading-snug">{item.title}</p>
      <p className="mt-0.5 text-[11px] text-subtle">
        {offlineKindLabel(item)} · {formatBytes(item.size)}
        {item.duration ? ` · ${item.duration}` : ""}
        {busy ? ` · ${snap.progress}%` : ""}
        {snap.error ? ` · ${snap.error}` : ""}
      </p>
      <div className="mt-2 flex gap-2">
        {cached ? (
          <>
            <button
              type="button"
              onClick={() => void playOffline(item)}
              className="h-9 flex-1 rounded-full bg-off text-[11px] font-medium text-off-fg"
            >
              {isOfflineAudio(item) ? "Слушать" : "Смотреть"}
            </button>
            <button
              type="button"
              onClick={() => void removeOffline(item)}
              className="h-9 flex-1 rounded-full bg-[#3a2a2a] text-[11px] font-medium"
            >
              Удалить
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => startDownload(item)}
            className="h-9 flex-1 rounded-full bg-dl text-[11px] font-medium text-dl-fg"
          >
            {busy ? `${snap.progress}%` : snap.error ? "Ещё раз" : "Скачать"}
          </button>
        )}
      </div>
    </li>
  );
}
