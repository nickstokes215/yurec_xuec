import { useEffect, useLayoutEffect, useState } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { markTourSeen, shouldAutoTour } from "@/lib/use-tour";
import { cn } from "@/lib/utils";

type Step = {
  id: string;
  title: string;
  text: string;
  target?: string;
};

const STEPS: Step[] = [
  {
    id: "hello",
    title: "Алё, двор открыт",
    text: "Это Жизнь Юрца. Сборник с Шотмана: рассказы, ролики, игры и болтовня со мной. Сейчас ткну пальцем — где что лежит.",
  },
  {
    id: "brand",
    title: "Шапка",
    text: "Слева — двор. Справа тема (солнце/луна) и шестерёнка. Шестерёнка — настройки. Если заблудился, всегда сюда.",
    target: "brand",
  },
  {
    id: "citat",
    title: "Цитата дня",
    text: "Каждый заход новая. Ткнул карточку — весь цитатник. В нижнем меню его можно спрятать, вход всё равно здесь.",
    target: "citat-day",
  },
  {
    id: "home",
    title: "Сборник",
    text: "Серии, песни, визиты, бонусы. Ищи Юрца, Зинаиду, Гошу. Отметил «прочитано» — двор помнит.",
    target: "nav:/",
  },
  {
    id: "media",
    title: "Медиа",
    text: "Ролики, шортсы, песни, газета, звонки. Киоск в кармане, можно и без интернета — если скачал.",
    target: "nav:/videos",
  },
  {
    id: "games",
    title: "Игры",
    text: "Помойкобол, Алконоид, кроссворды, квест, своя игра. Проиграл — тоже бывает медаль. Двор уважает лузеров.",
    target: "nav:/game",
  },
  {
    id: "ai",
    title: "Юрец AI",
    text: "Пишешь — орёт в ответ. Бета, хамоватый, свой. Кнопка есть и внизу, и сверху, если не выключил.",
    target: "nav:/chat",
  },
  {
    id: "chars",
    title: "Герои",
    text: "Карточки двора и карта Шотмана. Сосед, НЛО, граната, Светка — все на месте.",
    target: "nav:/characters",
  },
  {
    id: "zash",
    title: "Зашквары",
    text: "Медали. За подвиг и за то, что просто ткнул не туда. Пятьдесят штук. Двор выдаёт сам.",
    target: "nav:/zashkvary",
  },
  {
    id: "settings",
    title: "Настройки",
    text: "Тема, нижнее меню, справка, обучение. Это окно больше само не вылезет. Захочешь ещё раз — кнопка «Пройти обучение заново».",
    target: "settings",
  },
];

type Hole = { top: number; left: number; width: number; height: number; r: number };

function liveSteps(): Step[] {
  return STEPS.filter((s) => {
    if (!s.target) return true;
    return Boolean(document.querySelector(`[data-tour="${s.target}"]`));
  });
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
    height: Math.min(window.innerHeight - 12, b.height + pad * 2),
    r: Math.min(18, Math.round(Math.min(b.width, b.height) / 4) + 8),
  };
}

export function TourHost() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [on, setOn] = useState(false);
  const [idx, setIdx] = useState(0);
  const [hole, setHole] = useState<Hole | null>(null);
  const [pack, setPack] = useState<Step[]>(STEPS);

  function stop() {
    markTourSeen();
    setOn(false);
    setIdx(0);
    setHole(null);
    document.documentElement.classList.remove("modal-lock");
  }

  function begin() {
    setIdx(0);
    setOn(true);
    document.documentElement.classList.add("modal-lock");
    if (pathname !== "/") void navigate({ to: "/" });
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useLayoutEffect(() => {
    if (!on) return;
    const list = liveSteps();
    setPack(list.length ? list : STEPS.filter((s) => !s.target));
    const s = (list.length ? list : STEPS)[Math.min(idx, Math.max(0, list.length - 1))];
    function ping() {
      setHole(measure(s?.target));
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
  }, [on, idx, pathname]);

  useEffect(() => {
    if (!on) return;
    const w = window as Window & { yurecBack?: () => boolean };
    const prev = w.yurecBack;
    const onBack = () => {
      if (idx <= 0) {
        stop();
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
  const cur = pack[Math.min(idx, pack.length - 1)];
  if (!cur) return null;
  const last = idx >= pack.length - 1;
  const n = pack.length;
  const placeUp = hole ? hole.top + hole.height > window.innerHeight * 0.55 : false;

  return (
    <div className="tour" data-testid="tour">
      <button type="button" className="tour-dim" aria-label="Пропустить обучение" onClick={stop} />
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
              : { top: Math.min(window.innerHeight - 200, hole.top + hole.height + 12) }
            : undefined
        }
      >
        <p className="tour-kicker">
          Обучение · {Math.min(idx + 1, n)} / {n}
        </p>
        <p className="tour-title">{cur.title}</p>
        <p className="tour-text">{cur.text}</p>
        <div className="tour-row">
          <button type="button" className="tour-skip" onClick={stop}>
            {last ? "Закрыть" : "Пропустить"}
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
              if (last) stop();
              else setIdx((v) => v + 1);
            }}
          >
            {last ? "Понял, пошёл" : "Дальше"}
          </button>
        </div>
      </div>
    </div>
  );
}
