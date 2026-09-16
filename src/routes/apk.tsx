import { createFileRoute, Link } from "@tanstack/react-router";
import { Download, Github, Share2, Smartphone } from "lucide-react";
import { useEffect, useState } from "react";
import {
  APP_VERSION,
  GITHUB_APK_URL,
  GITHUB_RELEASES_URL,
} from "@/data/catalog";

export const Route = createFileRoute("/apk")({ component: ApkPage });

function sniff(): "ios" | "android" | "other" {
  if (typeof navigator === "undefined") return "other";
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/i.test(ua)) return "ios";
  if (/Android/i.test(ua)) return "android";
  return "other";
}

function isStandalone() {
  if (typeof window === "undefined") return false;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return nav.standalone === true || window.matchMedia("(display-mode: standalone)").matches;
}

function ApkPage() {
  const [plat, setPlat] = useState<"ios" | "android" | "other">("other");
  const [home, setHome] = useState(false);
  useEffect(() => {
    setPlat(sniff());
    setHome(isStandalone());
  }, []);

  return (
    <main className="px-4 pt-4 pb-10">
      <p className="text-[11px] font-medium tracking-[0.16em] text-muted uppercase">Установка</p>
      <h2 className="mt-1 font-sans text-2xl font-semibold leading-tight">Поставить на телефон</h2>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        Веб-сборник — это и есть приложение для iPhone. На Android два пути: ярлык с Chrome или
        настоящий APK. В App Store нативного IPA нет: Apple берёт Mac и 99$ в год.
      </p>

      {home ? (
        <p className="mt-4 rounded-xl bg-off px-4 py-3 text-sm leading-relaxed text-off-fg">
          Сборник уже на экране «Домой». Открой ярлык — это и есть приложение, без рамки браузера.
        </p>
      ) : null}

      {plat !== "android" ? <IphoneCard highlight={plat === "ios"} /> : null}
      {plat !== "ios" ? <AndroidPwaCard highlight={plat === "android"} /> : null}
      {plat === "android" ? <IphoneCard highlight={false} /> : null}
      <ApkCard />

      <Link to="/channel" className="mt-6 block text-center text-sm text-muted hover:text-fg">
        Назад к каналу
      </Link>
    </main>
  );
}

function IphoneCard({ highlight }: { highlight: boolean }) {
  return (
    <section
      className={
        highlight
          ? "mt-6 rounded-xl bg-surface px-4 py-4 shadow-[0_0_0_1px_rgba(201,162,39,0.45)]"
          : "mt-6 rounded-xl bg-surface px-4 py-4 shadow-[0_0_0_1px_rgba(255,255,255,0.06)]"
      }
    >
      <div className="flex items-center gap-2">
        <Share2 className="size-4 text-muted" />
        <h3 className="font-sans text-sm font-semibold">iPhone — на экран «Домой»</h3>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        Наспех и правильно — один путь. Только Safari. Chrome, Telegram и «ВК» ярлык как приложение
        не ставят.
      </p>
      <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-muted">
        <li>Открой этот сборник в Safari на iPhone.</li>
        <li>Кнопка «Поделиться» — квадрат со стрелкой вверх.</li>
        <li>«На экран „Домой“» → «Добавить».</li>
        <li>Ярлык «Жизнь Юрца» сядет рядом с обычными приложениями.</li>
      </ol>
      <a
        href="/?install=1&platform=ios"
        className="mt-4 flex h-12 items-center justify-center gap-2 rounded-xl bg-elevated text-sm font-medium"
      >
        <Smartphone className="size-4" />
        Картинки шагов
      </a>
      <p className="mt-3 text-xs text-subtle">
        Это PWA: тот же двор, без Safari-рамки. Оффлайн-игры и лицензия живут в этом телефоне.
        Обновляется сам, когда открываешь ярлык с сетью.
      </p>
    </section>
  );
}

function AndroidPwaCard({ highlight }: { highlight: boolean }) {
  return (
    <section
      className={
        highlight
          ? "mt-3 rounded-xl bg-surface px-4 py-4 shadow-[0_0_0_1px_rgba(201,162,39,0.45)]"
          : "mt-3 rounded-xl bg-surface px-4 py-4 shadow-[0_0_0_1px_rgba(255,255,255,0.06)]"
      }
    >
      <div className="flex items-center gap-2">
        <Smartphone className="size-4 text-muted" />
        <h3 className="font-sans text-sm font-semibold">1. Android наспех — на домашний экран</h3>
      </div>
      <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-muted">
        <li>Открой этот сборник в Chrome на телефоне.</li>
        <li>Меню (три точки) → «Добавить на главный экран» / «Установить приложение».</li>
        <li>Иконка появится рядом с обычными приложениями.</li>
      </ol>
      <p className="mt-3 text-xs text-subtle">
        Это PWA: тот же сборник, обновляется сам. Play Store не нужен.
      </p>
    </section>
  );
}

function ApkCard() {
  return (
    <section className="mt-3 rounded-xl bg-surface px-4 py-4 shadow-[0_0_0_1px_rgba(255,255,255,0.06)]">
      <div className="flex items-center gap-2">
        <Download className="size-4 text-muted" />
        <h3 className="font-sans text-sm font-semibold">2. Android правильно — APK</h3>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        Пакет <span className="text-fg">ru.yurec.xuec</span> {APP_VERSION}: Android 5 и новее,
        включая 15. Тексты внутри, вкладка «Игры». YouTube и Telegram открываются снаружи.
      </p>
      <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-muted">
        <li>Удали старую «Жизнь Юрца» — пакет и подпись сменились, поверх не встанет.</li>
        <li>Скачай файл на телефон — с этой страницы или из GitHub Releases.</li>
        <li>Открой его в «Файлы» / уведомлении загрузки.</li>
        <li>Разреши установку из этого источника, если Android спросит.</li>
        <li>Нажми «Установить». Иконка — «Жизнь Юрца».</li>
      </ol>
      <a
        href="/yurec_xuec.apk"
        download="yurec_xuec.apk"
        className="mt-4 flex h-12 items-center justify-center gap-2 rounded-xl bg-accent text-sm font-medium text-accent-fg"
      >
        <Download className="size-4" />
        Скачать APK {APP_VERSION}
      </a>
      <a
        href={GITHUB_APK_URL}
        className="mt-2 flex h-12 items-center justify-center gap-2 rounded-xl bg-elevated text-sm font-medium"
      >
        <Github className="size-4" />
        Последний APK с GitHub
      </a>
      <a
        href={GITHUB_RELEASES_URL}
        className="mt-2 flex h-12 items-center justify-center gap-2 rounded-xl bg-elevated text-sm font-medium"
      >
        Все релизы
      </a>
      <p className="mt-3 text-xs text-subtle">
        Android может предупредить «неизвестно». Это нормально для APK не из Play. Ставь только свой
        файл. В релизах лежит тот же пакет, что и здесь.
      </p>
    </section>
  );
}
