import { createFileRoute, Link } from "@tanstack/react-router";
import { Download, Github, Monitor, Share2, Smartphone } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import {
  APP_VERSION,
  GITHUB_APK_URL,
  GITHUB_IPA_URL,
  GITHUB_RELEASES_URL,
  GITHUB_WEB_URL,
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
      <h2 className="mt-1 font-sans text-2xl font-semibold leading-tight">Поставить сборник</h2>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        Один двор, три оболочки. Android — APK. iPhone — сайт в Safari на экран «Домой»; если есть
        джейлбрейк — IPA. Компьютер — веб-приложение по адресу сайта.
      </p>

      {home ? (
        <p className="mt-4 rounded-xl bg-off px-4 py-3 text-sm leading-relaxed text-off-fg">
          Сборник уже на экране «Домой». Открой ярлык — это и есть приложение.
        </p>
      ) : null}

      {plat === "android" ? <AndroidCard highlight /> : null}
      {plat === "ios" ? <IphoneCard highlight /> : null}
      {plat === "other" ? <DesktopCard highlight /> : null}
      {plat !== "android" ? <AndroidCard highlight={false} /> : null}
      {plat !== "ios" ? <IphoneCard highlight={false} /> : null}
      {plat !== "other" ? <DesktopCard highlight={false} /> : null}

      <section className="mt-3 rounded-xl bg-surface px-4 py-4 shadow-[0_0_0_1px_rgba(255,255,255,0.06)]">
        <div className="flex items-center gap-2">
          <Github className="size-4 text-muted" />
          <h3 className="font-sans text-sm font-semibold">Файлы {APP_VERSION}</h3>
        </div>
        <a
          href="/yurec_xuec.apk"
          download="yurec_xuec.apk"
          className="mt-4 flex h-12 items-center justify-center gap-2 rounded-xl bg-accent text-sm font-medium text-accent-fg"
        >
          <Download className="size-4" />
          APK {APP_VERSION}
        </a>
        <a
          href={GITHUB_APK_URL}
          className="mt-2 flex h-12 items-center justify-center gap-2 rounded-xl bg-elevated text-sm font-medium"
        >
          <Github className="size-4" />
          APK с GitHub
        </a>
        <a
          href={GITHUB_IPA_URL}
          className="mt-2 flex h-12 items-center justify-center gap-2 rounded-xl bg-elevated text-sm font-medium"
        >
          IPA с GitHub
        </a>
        <a
          href={GITHUB_RELEASES_URL}
          className="mt-2 flex h-12 items-center justify-center gap-2 rounded-xl bg-elevated text-sm font-medium"
        >
          Все релизы
        </a>
      </section>

      <Link to="/channel" className="mt-6 block text-center text-sm text-muted hover:text-fg">
        Назад к каналу
      </Link>
    </main>
  );
}

function Card({
  highlight,
  icon,
  title,
  children,
}: {
  highlight: boolean;
  icon: ReactNode;
  title: string;
  children: ReactNode;
}) {
  return (
    <section
      className={
        highlight
          ? "mt-6 rounded-xl bg-surface px-4 py-4 shadow-[0_0_0_1px_rgba(201,162,39,0.45)]"
          : "mt-3 rounded-xl bg-surface px-4 py-4 shadow-[0_0_0_1px_rgba(255,255,255,0.06)]"
      }
    >
      <div className="flex items-center gap-2">
        {icon}
        <h3 className="font-sans text-sm font-semibold">{title}</h3>
      </div>
      {children}
    </section>
  );
}

function AndroidCard({ highlight }: { highlight: boolean }) {
  return (
    <Card highlight={highlight} icon={<Download className="size-4 text-muted" />} title="Android — APK">
      <p className="mt-3 text-sm leading-relaxed text-muted">
        Пакет <span className="text-fg">ru.yurec.xuec</span> {APP_VERSION}. Android 5 и новее, включая
        15. Тексты внутри, вкладка «Игры». YouTube и Telegram открываются снаружи.
      </p>
      <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-muted">
        <li>Скачай <span className="text-fg">yurec_xuec.apk</span> — кнопка ниже или с GitHub.</li>
        <li>Если стоит старая «Жизнь Юрца» со старым пакетом — удали её, поверх не встанет.</li>
        <li>Открой файл в «Файлы» или из уведомления загрузки.</li>
        <li>Разреши установку из этого источника, если Android спросит.</li>
        <li>Нажми «Установить». Иконка — «Жизнь Юрца».</li>
      </ol>
      <p className="mt-3 text-xs text-subtle">
        Предупреждение «неизвестно» — нормально: файл не из Play. Ставь только свой APK из релиза.
      </p>
    </Card>
  );
}

function IphoneCard({ highlight }: { highlight: boolean }) {
  return (
    <Card highlight={highlight} icon={<Share2 className="size-4 text-muted" />} title="iPhone — сайт и IPA">
      <p className="mt-3 text-sm font-medium text-fg">Без джейлбрейка — Safari</p>
      <ol className="mt-2 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-muted">
        <li>
          В Safari открой сайт:{" "}
          <a href={GITHUB_WEB_URL} className="text-fg underline decoration-fg/30 underline-offset-4">
            nickstokes215.github.io/yurec_xuec
          </a>
        </li>
        <li>Только Safari. Chrome, Telegram и «ВК» ярлык как приложение не ставят.</li>
        <li>Кнопка «Поделиться» — квадрат со стрелкой вверх.</li>
        <li>«На экран „Домой“» → «Добавить».</li>
        <li>Ярлык «Жизнь Юрца» сядет рядом с обычными приложениями, без рамки Safari.</li>
      </ol>
      <p className="mt-4 text-sm font-medium text-fg">С джейлбрейком — IPA</p>
      <ol className="mt-2 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-muted">
        <li>Скачай <span className="text-fg">yurec_xuec.ipa</span> из релизов GitHub.</li>
        <li>Поставь через TrollStore, Sideloadly или тот установщик, которым ставишь джейл.</li>
        <li>Двор внутри файла, как в APK: тексты и игры оффлайн. App Store и 99$ не нужны.</li>
      </ol>
      <a
        href="/?install=1&platform=ios"
        className="mt-4 flex h-12 items-center justify-center gap-2 rounded-xl bg-elevated text-sm font-medium"
      >
        <Smartphone className="size-4" />
        Картинки шагов Safari
      </a>
    </Card>
  );
}

function DesktopCard({ highlight }: { highlight: boolean }) {
  return (
    <Card highlight={highlight} icon={<Monitor className="size-4 text-muted" />} title="Компьютер — сайт">
      <p className="mt-3 text-sm leading-relaxed text-muted">
        Windows, Linux и Mac открывают тот же двор в браузере. Это веб-приложение, не установщик
        .exe.
      </p>
      <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-muted">
        <li>
          Адрес:{" "}
          <a href={GITHUB_WEB_URL} className="text-fg underline decoration-fg/30 underline-offset-4">
            {GITHUB_WEB_URL.replace(/https:\/\//, "").replace(/\/$/, "")}
          </a>
        </li>
        <li>Chrome / Edge: меню → «Установить приложение» / «Создать ярлык» — иконка на рабочий стол.</li>
        <li>Safari на Mac: «Поделиться» → «Добавить на экран Домой» или просто оставь вкладку.</li>
        <li>Firefox: сайт работает как страница. Отдельного «поставить» у него нет.</li>
      </ol>
      <a
        href={GITHUB_WEB_URL}
        className="mt-4 flex h-12 items-center justify-center gap-2 rounded-xl bg-elevated text-sm font-medium"
      >
        <Monitor className="size-4" />
        Открыть веб-сборник
      </a>
    </Card>
  );
}
