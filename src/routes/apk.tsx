import { createFileRoute, Link } from "@tanstack/react-router";
import { Download, Smartphone } from "lucide-react";
import { APP_VERSION } from "@/data/catalog";

export const Route = createFileRoute("/apk")({ component: ApkPage });

function ApkPage() {
  return (
    <main className="px-4 pt-4 pb-10">
      <p className="text-[11px] font-medium tracking-[0.16em] text-muted uppercase">Установка</p>
      <h2 className="mt-1 font-sans text-2xl font-semibold leading-tight">Поставить на Android</h2>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        Два рабочих пути. Первый — за пять минут, без файлов. Второй — настоящий APK в лаунчер.
      </p>

      <section className="mt-6 rounded-xl bg-surface px-4 py-4 shadow-[0_0_0_1px_rgba(255,255,255,0.06)]">
        <div className="flex items-center gap-2">
          <Smartphone className="size-4 text-muted" />
          <h3 className="font-sans text-sm font-semibold">1. Наспех — на домашний экран</h3>
        </div>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-muted">
          <li>Откройте этот сборник в Chrome на телефоне.</li>
          <li>Меню (три точки) → «Добавить на главный экран» / «Установить приложение».</li>
          <li>Иконка появится рядом с обычными приложениями.</li>
        </ol>
        <p className="mt-3 text-xs text-subtle">
          Это PWA: тот же сборник, обновляется сам. Play Store не нужен.
        </p>
      </section>

      <section className="mt-3 rounded-xl bg-surface px-4 py-4 shadow-[0_0_0_1px_rgba(255,255,255,0.06)]">
        <div className="flex items-center gap-2">
          <Download className="size-4 text-muted" />
          <h3 className="font-sans text-sm font-semibold">2. Правильно — APK</h3>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Пакет <span className="text-fg">ru.yurec.xuec</span> {APP_VERSION}: Android 5 и новее,
          включая 15. Тексты внутри, вкладка «Игры». YouTube и Telegram открываются снаружи.
        </p>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-muted">
          <li>Удалите старую «Жизнь Юрца» — пакет и подпись сменились, поверх не встанет.</li>
          <li>Скачайте новый файл на телефон.</li>
          <li>Откройте его в «Файлы» / уведомлении загрузки.</li>
          <li>Разрешите установку из этого источника, если Android спросит.</li>
          <li>Нажмите «Установить». Иконка — «Жизнь Юрца».</li>
        </ol>
        <a
          href="/yurec_xuec.apk"
          download="yurec_xuec.apk"
          className="mt-4 flex h-12 items-center justify-center gap-2 rounded-xl bg-accent text-sm font-medium text-accent-fg"
        >
          <Download className="size-4" />
          Скачать APK {APP_VERSION}
        </a>
        <p className="mt-3 text-xs text-subtle">
          Android может предупредить «неизвестно». Это нормально для APK не из Play. Ставьте только
          свой файл.
        </p>
      </section>

      <Link to="/channel" className="mt-6 block text-center text-sm text-muted hover:text-fg">
        Назад к каналу
      </Link>
    </main>
  );
}
