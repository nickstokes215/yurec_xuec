import { useEffect, useLayoutEffect, useState } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { noteFlag } from "@/lib/use-achievements";
import { markTourSeen, shouldAutoTour } from "@/lib/use-tour";
import { cn } from "@/lib/utils";

type TourTo = "/" | "/videos" | "/game" | "/characters" | "/zashkvary" | "/chat" | "/about" | "/settings";

type Step = {
  id: string;
  title: string;
  text: string;
  path: TourTo;
  target?: string;
};

const STEPS: Step[] = [
  {
    id: "hello",
    path: "/",
    title: "Алё, двор открыт",
    text: "Это Жизнь Юрца. Сборник с Шотмана: рассказы, ролики, игры и болтовня. Сейчас коротко по важным местам, в том числе туда, куда сам не догадаешься зайти. Дойдёшь до конца — двор выдаст медаль. Смахнёшь раньше — медали нет.",
  },
  {
    id: "brand",
    path: "/",
    target: "brand",
    title: "Шапка",
    text: "Слева баннер двора: тап — картинка на весь экран. Справа солнце или луна меняет тему. Шестерёнка — настройки. Заблудился — всегда сюда.",
  },
  {
    id: "citat",
    path: "/",
    target: "citat-day",
    title: "Цитата дня",
    text: "Каждый заход новая. Тап по тексту открывает цитатник: фраза ведёт в рассказ, откуда ор. Кнопка «Открытка» собирает картинку в галерею. Если кнопки нет — открытки выключены в настройках.",
  },
  {
    id: "find",
    path: "/",
    target: "home-tools",
    title: "Поиск сборника",
    text: "Поле ищет по текстам. Чипы режут на серии, песни, визиты и бонусы. «Случайный» кидает в любой рассказ. Сортировка крутит порядок: старые, новые, по алфавиту. В самом рассказе есть «прочитано», закладка и лупа на картинке. Ушёл на середине — здесь появится «Продолжить».",
  },
  {
    id: "media",
    path: "/videos",
    target: "media-grid",
    title: "Медиа",
    text: "Плитки: видео, шортсы, песни, газета, звонки. Внутри свой поиск и сортировка. У ролика бывает скачивание — тогда смотрится без сети. Газета листается разворотами. Нижняя полоска разделов появляется, когда уже зашёл внутрь.",
  },
  {
    id: "games",
    path: "/game",
    target: "game-card",
    title: "Игры двигаются",
    text: "Зажми карточку примерно на полсекунды и тащи — игры меняются местами. Короткий тап открывает, не двигает. Заводской порядок вернёт кнопка внизу или пункт в настройках. В Помойкоболе и Алконоиде «ПАУЗА» справа от названия. В кроссворде «?» открывает одну букву, от пяти до семи раз. В «Юрца игре» кот и аукцион спрятаны, пока клетку не вскроешь.",
  },
  {
    id: "pass",
    path: "/game",
    target: "game-pass",
    title: "Паспорт двора",
    text: "Сводка: что прочитано, какие уровни отбиты, сколько зашкваров открыто. Это не настройки. Сюда, когда хочешь увидеть двор целиком, а не крутить тумблеры.",
  },
  {
    id: "map",
    path: "/characters",
    target: "yard-map",
    title: "Карта и стена",
    text: "Карта: сначала город, потом двор, потом трёшка. Жми на огни — откроется точка и карточка героя. Под картой «Стена подъезда»: мел только на этом телефоне, чужих надписей нет. Уезжает вместе со справкой из настроек.",
  },
  {
    id: "chars",
    path: "/characters",
    target: "char-card",
    title: "Карточки героев",
    text: "Короткий тап открывает героя: биография и ещё фразы, если жать на цитату. Зажми карточку и тащи — порядок меняется, как у игр. Чипы сверху режут двор, банду, семью и остальное. Сбросить порядок можно в настройках, пункт «Герои».",
  },
  {
    id: "zash",
    path: "/zashkvary",
    target: "zash-board",
    title: "Зашквары",
    text: "Медали. Часть за подвиг, часть за то, что просто ткнул не туда. Закрытая показывает подсказку, открытая — картинку, ор и дату. Двор выдаёт сам, руками список не отмечают. Если кнопки внизу нет — вход через «Инфо».",
  },
  {
    id: "chat",
    path: "/chat",
    target: "chat-box",
    title: "Юрец AI",
    text: "Пишешь — орёт в ответ. Есть «Разговор» и «SMS-ки». Чипы подставляют готовый вопрос. Шаринг сохраняет переписку. По умолчанию чат сгорает, когда закрыл сборник: хранение включается в настройках. Кнопку чата можно убрать сверху или снизу.",
  },
  {
    id: "info",
    path: "/about",
    target: "about-links",
    title: "Инфо",
    text: "Канал, донат, журнал версий, идеи, паспорт и зашквары. Название саги можно потыкать — двор это замечает, но не говорит, сколько раз. Иконку приложения и подпись ярлыка меняют в настройках.",
  },
  {
    id: "set-find",
    path: "/settings",
    target: "set-search",
    title: "Поиск настроек",
    text: "Настроек много. Поле сверху прячет карточки, в которых нет твоих слов. «Ё» и «е» для него одно и то же. Несколько слов ищутся сразу все.",
  },
  {
    id: "set-look",
    path: "/settings",
    target: "set-theme",
    title: "Тема и шрифт",
    text: "Светлая, тёмная, чёрная или как в системе. Ниже — размер шрифта в читалке. Солнце в шапке крутит тему, не заходя сюда.",
  },
  {
    id: "set-post",
    path: "/settings",
    target: "set-post",
    title: "Открытка",
    text: "Шрифт, свой текст или цитата дня, чья картинка, JPG или PNG, папка в галерее. Можно выключить совсем. Фон и узор — случайные каждый раз или закреплённые. PNG тяжелее, JPG надёжнее.",
  },
  {
    id: "set-dock",
    path: "/settings",
    target: "set-dock",
    title: "Нижнее меню и быт",
    text: "Закладки, цитатник, зашквары и инфо можно убрать из нижнего ряда. По умолчанию цитатник и закладки спрятаны: цитатник всё равно открывается с цитаты дня, закладка ставится в рассказе. Рядом лежат звук, вибрация, «не гасить экран», полоса в тексте, виджет на стол и справка двора — файл, которым двор переезжает на другой телефон.",
  },
  {
    id: "medal",
    path: "/settings",
    target: "set-tour",
    title: "Медаль двора",
    text: "Обучение само больше не вылезет. Ещё раз — эта кнопка. Раз дошёл до конца, а не смахнул, двор выдаёт зашквар «Экскурсия». Он уже твой.",
  },
];

type Hole = { top: number; left: number; width: number; height: number; r: number };

function normPath(p: string) {
  const x = (p || "/").split("?")[0] || "/";
  if (x.length > 1 && x.endsWith("/")) return x.slice(0, -1);
  return x;
}

function measure(id?: string): Hole | null {
  if (!id) return null;
  const el = document.querySelector(`[data-tour="${id}"]`) as HTMLElement | null;
  if (!el) return null;
  const b = el.getBoundingClientRect();
  if (b.width < 4 || b.height < 4) return null;
  const pad = 6;
  return {
    top: Math.max(6, b.top - pad),
    left: Math.max(6, b.left - pad),
    width: Math.min(window.innerWidth - 12, b.width + pad * 2),
    height: Math.min(280, Math.min(window.innerHeight - 12, b.height + pad * 2)),
    r: Math.min(18, Math.round(Math.min(b.width, b.height) / 4) + 8),
  };
}

function placeTour(el: HTMLElement | null) {
  const html = document.documentElement;
  const body = document.body;
  if (html.classList.contains("modal-lock")) {
    html.classList.remove("modal-lock");
    body.style.top = "";
  }
  let y = 0;
  if (el) {
    const b = el.getBoundingClientRect();
    y = Math.max(0, b.top + (window.scrollY || 0) - 120);
    window.scrollTo(0, y);
    y = window.scrollY || y;
  } else {
    window.scrollTo(0, 0);
  }
  html.classList.add("modal-lock");
  body.style.top = `-${y}px`;
}

function releaseTour() {
  const html = document.documentElement;
  const body = document.body;
  const y = Math.abs(parseInt(body.style.top || "0", 10) || 0);
  html.classList.remove("modal-lock");
  body.style.top = "";
  window.scrollTo(0, y);
}

export function TourHost() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [on, setOn] = useState(false);
  const [idx, setIdx] = useState(0);
  const [hole, setHole] = useState<Hole | null>(null);

  function stop(award = false) {
    releaseTour();
    markTourSeen();
    setOn(false);
    setIdx(0);
    setHole(null);
    if (award) window.setTimeout(() => noteFlag("tour"), 40);
  }

  function begin() {
    setHole(null);
    setIdx(0);
    setOn(true);
  }

  useEffect(() => {
    function onStart() {
      begin();
    }
    window.addEventListener("yurec-tour-start", onStart);
    const t = window.setTimeout(() => {
      if (shouldAutoTour()) begin();
    }, 700);
    return () => {
      window.removeEventListener("yurec-tour-start", onStart);
      window.clearTimeout(t);
    };
  }, []);

  useLayoutEffect(() => {
    if (!on) return;
    const s = STEPS[Math.min(idx, STEPS.length - 1)];
    if (!s) return;
    if (normPath(pathname) !== normPath(s.path)) {
      void navigate({ to: s.path });
      return;
    }
    const el = s.target ? (document.querySelector(`[data-tour="${s.target}"]`) as HTMLElement | null) : null;
    placeTour(el);
    function ping() {
      setHole(measure(s.target));
    }
    ping();
    const t = window.setTimeout(ping, 80);
    const t2 = window.setTimeout(ping, 280);
    window.addEventListener("resize", ping);
    return () => {
      window.clearTimeout(t);
      window.clearTimeout(t2);
      window.removeEventListener("resize", ping);
    };
  }, [on, idx, pathname, navigate]);

  useEffect(() => {
    if (!on) return;
    const w = window as Window & { yurecBack?: () => boolean };
    const prev = w.yurecBack;
    const onBack = () => {
      if (idx <= 0) {
        stop(false);
        return true;
      }
      setIdx((n) => n - 1);
      return true;
    };
    w.yurecBack = onBack;
    return () => {
      if (w.yurecBack === onBack) w.yurecBack = prev;
    };
  }, [on, idx]);

  if (!on) return null;
  const cur = STEPS[Math.min(idx, STEPS.length - 1)];
  if (!cur) return null;
  const last = idx >= STEPS.length - 1;
  const n = STEPS.length;
  const placeUp = hole ? hole.top + hole.height > window.innerHeight * 0.55 : false;

  return (
    <div className="tour" data-testid="tour">
      <button type="button" className="tour-dim" aria-label="Пропустить обучение" onClick={() => stop(false)} />
      {hole ? (
        <span
          className="tour-hole"
          style={{
            top: hole.top,
            left: hole.left,
            width: hole.width,
            height: hole.height,
            borderRadius: hole.r,
          }}
        />
      ) : null}
      <div
        className={cn("tour-card", !hole && "tour-card-mid", hole && placeUp && "tour-card-up", hole && !placeUp && "tour-card-down")}
        style={
          hole
            ? placeUp
              ? { bottom: Math.max(16, window.innerHeight - hole.top + 12) }
              : { top: Math.min(window.innerHeight - 220, hole.top + hole.height + 12) }
            : undefined
        }
      >
        <p className="tour-kicker">
          Обучение · {Math.min(idx + 1, n)} / {n}
        </p>
        <p className="tour-title">{cur.title}</p>
        <p className="tour-text">{cur.text}</p>
        <div className="tour-row">
          <button type="button" className="tour-skip" onClick={() => stop(false)}>
            {last ? "Без медали" : "Пропустить"}
          </button>
          {idx > 0 ? (
            <button type="button" className="tour-next ghost" onClick={() => setIdx((v) => Math.max(0, v - 1))}>
              Назад
            </button>
          ) : null}
          <button
            type="button"
            className="tour-next"
            onClick={() => {
              if (last) stop(true);
              else setIdx((v) => v + 1);
            }}
          >
            {last ? "Забрать медаль" : "Дальше"}
          </button>
        </div>
      </div>
    </div>
  );
}
