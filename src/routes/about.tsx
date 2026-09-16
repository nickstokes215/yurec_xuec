import { createFileRoute, Link } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { APP_VERSION, BUILD_AT, TELEGRAM_URL, YOUTUBE_CHANNEL } from "@/data/catalog";
import { openZoom } from "@/lib/zoom";
import { usePaid } from "@/lib/use-paid";
import { isDeveloper } from "@/lib/use-settings";
import { markEgg, useAchievements } from "@/lib/use-achievements";
import { ACH_TOTAL } from "@/data/achievements";

export const Route = createFileRoute("/about")({ component: AboutPage });

function AboutPage() {
  const { paid } = usePaid();
  const [egg, setEgg] = useState(false);
  const [storm, setStorm] = useState(false);
  const taps = useRef({ n: 0, t: 0 });
  const dev = isDeveloper();
  const license = dev ? "Разработчик" : paid ? "Приобретена" : "Отсутствует";
  const zash = useAchievements();

  useEffect(() => {
    return () => {
      setEgg(false);
      setStorm(false);
    };
  }, []);

  function tapTitle() {
    const now = Date.now();
    if (now - taps.current.t > 1600) taps.current.n = 0;
    taps.current.t = now;
    taps.current.n += 1;
    if (taps.current.n >= 5) {
      taps.current.n = 0;
      setEgg(true);
      setStorm(true);
      markEgg();
      window.setTimeout(() => setStorm(false), 2200);
    }
  }

  return (
    <main className="px-4 pt-4 pb-10">
      <button
        type="button"
        onClick={() => openZoom(egg ? "/easter-horror.jpg?v=1.53.8" : "/yurec-icon.jpg?v=1.53.8")}
        className="mx-auto block"
        aria-label="Открыть обложку"
      >
        <img
          src={egg ? "/easter-horror.jpg?v=1.53.8" : "/yurec-icon.jpg?v=1.53.8"}
          alt="Жизнь Юрца"
          className="h-40 w-40 rounded-2xl object-cover shadow-[0_0_0_1px_rgba(255,255,255,0.08)]"
        />
      </button>
      <button type="button" onClick={tapTitle} className="mx-auto mt-5 block w-full bg-transparent">
        <p className="text-center text-[11px] font-medium tracking-[0.16em] text-muted uppercase">
          О приложении
        </p>
        <h2 className="mt-1 text-center font-sans text-2xl font-semibold leading-tight">
          Жизнь Юрца
        </h2>
        <p className="mt-1 text-center text-sm text-muted">{egg ? "Артхаусный хоррор" : "Комедийная сага"}</p>
      </button>
      {storm ? <StormOverlay /> : null}

      <section className="mt-6 space-y-4 font-serif text-[16px] leading-relaxed text-muted">
        <p>
          Сначала был открытый Telegram-канал: рассказы про Юрца, Лысого хера из «Олимпика», его
          «девушку» Светлану, бабку Зинаиду, ворона Гошу и хрущёвскую трёшку на улице Шотмана.
          Истории несколько раз редактировались с целью доведения до совершенства! Позднее к
          сериям были сгенерированы интерактивные обложки, отражающие содержимое конкретного
          эпизода —{" "}
          <a
            href="https://t.me/yurec_xuec"
            target="_blank"
            rel="noreferrer"
            className="text-fg underline decoration-fg/30 underline-offset-4"
          >
            https://t.me/yurec_xuec
          </a>{" "}
          <span className="text-subtle">(ID: 2552620595)</span>
        </p>
        <p>
          Потом те же серии начали получать экранизацию на YouTube — в какой-то момент уже с
          лицом, голосом и картинкой —{" "}
          <a
            href="https://www.youtube.com/@yurec_xuec"
            target="_blank"
            rel="noreferrer"
            className="text-fg underline decoration-fg/30 underline-offset-4"
          >
            https://www.youtube.com/@yurec_xuec
          </a>{" "}
          <span className="text-subtle">(ID: UCUe2h3bjoip1jAD2eX1stIA)</span>
        </p>
        <p>
          Дальше была попытка сделать небольшую текстовую игру (с помощью «Grok Build») для
          Windows с помощью автоматизированных скриптов на Python —{" "}
          <a
            href="https://t.me/yurec_xuec/464"
            target="_blank"
            rel="noreferrer"
            className="text-fg underline decoration-fg/30 underline-offset-4"
          >
            https://t.me/yurec_xuec/464
          </a>
        </p>
        <p>
          Теперь появилось это приложение (с помощью «Grok Build: Create apps»). Теперь есть
          возможность читать всю «комедийную сагу» прямо с телефона, будучи оффлайн. Без ленты.
          Без рекламы. Все рассказы, ссылки на ролики и песни, закладки, поиск, карточки
          персонажей и вкладка «Игры». Игра полностью переписана с нуля (в
          отличие от версии для Windows) и интегрирована в приложение —{" "}
          <a
            href="https://t.me/yurec_xuec/479"
            target="_blank"
            rel="noreferrer"
            className="text-fg underline decoration-fg/30 underline-offset-4"
          >
            https://t.me/yurec_xuec/479
          </a>
        </p>
      </section>

      <div className="mt-6 grid gap-4">
        <a
          href={TELEGRAM_URL}
          target="_blank"
          rel="noreferrer"
          className="grid h-12 w-full grid-cols-[1fr_auto_1fr] items-center rounded-xl bg-tg px-4 text-sm font-medium text-tg-fg"
        >
          <span />
          <span className="whitespace-nowrap text-center">Telegram · t.me/yurec_xuec</span>
          <span className="justify-self-end">
            <ExternalLink className="size-4" />
          </span>
        </a>
        <a
          href={YOUTUBE_CHANNEL}
          target="_blank"
          rel="noreferrer"
          className="grid h-12 w-full grid-cols-[1fr_auto_1fr] items-center rounded-xl bg-yt px-4 text-sm font-medium text-yt-fg"
        >
          <span />
          <span className="whitespace-nowrap text-center">YouTube · @yurec_xuec</span>
          <span className="justify-self-end">
            <ExternalLink className="size-4" />
          </span>
        </a>
        <Link
          to="/passport"
          className="grid h-12 w-full grid-cols-[1fr_auto_1fr] items-center rounded-xl bg-[#3d2a16] px-4 text-sm font-medium text-[#f6e7c2]"
        >
          <span />
          <span className="whitespace-nowrap text-center leading-none">Паспорт двора</span>
          <span className="inline-block size-4 justify-self-end" aria-hidden />
        </Link>
        <Link
          to="/zashkvary"
          className="grid h-12 w-full grid-cols-[1fr_auto_1fr] items-center rounded-xl bg-[#7a5420] px-4 text-sm font-medium text-[#f6e7c2]"
        >
          <span />
          <span className="whitespace-nowrap text-center leading-none">
            Зашквары двора · {zash.count}/{ACH_TOTAL}
          </span>
          <span className="inline-block size-4 justify-self-end" aria-hidden />
        </Link>
        <Link
          to="/ideas"
          className="grid h-12 w-full grid-cols-[1fr_auto_1fr] items-center rounded-xl bg-[#3d4a5c] px-4 text-sm font-medium text-white"
        >
          <span />
          <span className="whitespace-nowrap text-center leading-none">Нереализованные идеи</span>
          <span className="inline-block size-4 justify-self-end" aria-hidden />
        </Link>
        <Link
          to="/apk"
          className="grid h-12 w-full grid-cols-[1fr_auto_1fr] items-center rounded-xl bg-elevated px-4 text-sm font-medium"
        >
          <span />
          <span className="whitespace-nowrap text-center leading-none">Поставить на iPhone и Android</span>
          <span className="inline-block size-4 justify-self-end" aria-hidden />
        </Link>
        <Link
          to="/changelog"
          className="grid h-12 w-full grid-cols-[1fr_auto_1fr] items-center rounded-xl bg-log px-4 text-sm font-medium text-log-fg"
        >
          <span />
          <span className="whitespace-nowrap text-center leading-none">История изменений</span>
          <span className="inline-block size-4 justify-self-end" aria-hidden />
        </Link>
        <Link
          to="/donate"
          className="grid h-12 w-full grid-cols-[1fr_auto_1fr] items-center rounded-xl bg-gold px-4 text-sm font-medium text-gold-fg"
        >
          <span />
          <span className="whitespace-nowrap text-center leading-none">Пожертвование</span>
          <span className="inline-block size-4 justify-self-end" aria-hidden />
        </Link>
      </div>

      <section className="mt-10 text-center">
        <p className="text-[11px] font-medium tracking-[0.18em] text-muted">
          · ДИСКЛЕЙМЕР ·
        </p>
        <p className="mt-3 font-serif text-sm leading-relaxed text-subtle italic">
          Основано на реальных событиях. Отдельные сцены драматизированы для усиления
          эмоционального воздействия. Материал носит исключительно юмористический и
          развлекательный характер и не преследует цели кого-либо оскорбить. Все совпадения с
          реальными лицами и событиями случайны.
        </p>
        <p className="mt-4 text-sm leading-relaxed text-muted">
          Версия: {APP_VERSION}
          <br />
          Дата релиза: {BUILD_AT}
          <br />
          Лицензия: {license}
          <br />
          Автор: Константин Смирнов
          <br />
          Сборка: Grok
        </p>
      </section>
    </main>
  );
}

function StormOverlay() {
  return (
    <div className="egg-storm" aria-hidden>
      <i />
      <i />
      <i />
      <span className="egg-bolt">⚡</span>
    </div>
  );
}
