const CW_START = (id: string) => `yurec-cw-t:${id}`;
const CW_LAST = (id: string) => `yurec-cw-last:${id}`;
const Q_START = (id: string) => `yurec-quest-t:${id}`;
const Q_LAST = (id: string) => `yurec-quest-last:${id}`;

function readNum(key: string): number | null {
  try {
    const n = Number(localStorage.getItem(key) || "");
    return Number.isFinite(n) && n > 0 ? n : null;
  } catch {
    return null;
  }
}

function writeNum(key: string, n: number) {
  try {
    localStorage.setItem(key, String(n));
  } catch {
    /* ignore */
  }
}

function drop(key: string) {
  try {
    localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

export function formatSpan(ms: number): string {
  const sec = Math.max(0, Math.round(ms / 1000));
  if (sec < 60) return `${sec} сек`;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  if (s === 0) return `${m} мин`;
  return `${m} мин ${s} сек`;
}

function rankByMs(ms: number, names: [string, string, string, string, string]): string {
  const min = ms / 60000;
  if (min < 1) return names[0];
  if (min < 3) return names[1];
  if (min < 5) return names[2];
  if (min < 7) return names[3];
  return names[4];
}

const CW_RANKS: [string, string, string, string, string] = ["читер", "читатель", "задрот", "зануда", "алкаш"];
const Q_RANKS: [string, string, string, string, string] = [
  "ясновидец",
  "гуляка",
  "сменщик",
  "вахтёр",
  "пациент вытрезвителя",
];

const CW_TAIL: Record<string, string> = {
  читер: "Гоша даже клюв не успел открыть.",
  читатель: "Газету «Вечерний Шотман» вы, видимо, всё-таки читаете.",
  задрот: "Сетка стала личной обидой. Уважаем.",
  зануда: "Золотое слово уже стыдилось за вас.",
  алкаш: "Пока вы думали, Юрец успел сбегать в ларёк дважды.",
};

const Q_TAIL: Record<string, string> = {
  ясновидец: "Юрец орёт, что вы подглядывали в сценарий.",
  гуляка: "Двор пройден без лишней драмы. Почти.",
  сменщик: "Как смена в «Олимпике», только без линолеума.",
  вахтёр: "Сидели долго, чай остыл, концовка всё равно та же.",
  "пациент вытрезвителя": "Маршрут потерялся между шагом и рюмкой.",
};

export function crosswordFlavor(ms: number): string {
  const rank = rankByMs(ms, CW_RANKS);
  return `На этот раз вы потратили ${formatSpan(ms)} на разгадывание кроссворда! Звание: ${rank}. ${CW_TAIL[rank]}`;
}

export function questFlavor(ms: number): string {
  const rank = rankByMs(ms, Q_RANKS);
  return `Этот заход занял ${formatSpan(ms)}. Звание: ${rank}. ${Q_TAIL[rank]}`;
}

export function startCrosswordTimer(id: string, restart = false) {
  if (restart || readNum(CW_START(id)) == null) writeNum(CW_START(id), Date.now());
}

export function finishCrosswordTimer(id: string): number | null {
  const start = readNum(CW_START(id));
  const ms = start ? Math.max(0, Date.now() - start) : readNum(CW_LAST(id));
  if (ms == null) return null;
  writeNum(CW_LAST(id), ms);
  drop(CW_START(id));
  return ms;
}

export function readCrosswordLast(id: string): number | null {
  return readNum(CW_LAST(id));
}

export function clearCrosswordTimer(id: string) {
  drop(CW_START(id));
  drop(CW_LAST(id));
}

export function startQuestTimer(id: string, restart = false) {
  if (restart || readNum(Q_START(id)) == null) writeNum(Q_START(id), Date.now());
}

export function finishQuestTimer(id: string): number | null {
  const start = readNum(Q_START(id));
  const ms = start ? Math.max(0, Date.now() - start) : readNum(Q_LAST(id));
  if (ms == null) return null;
  writeNum(Q_LAST(id), ms);
  drop(Q_START(id));
  return ms;
}

export function clearQuestTimer(id: string) {
  drop(Q_START(id));
  drop(Q_LAST(id));
}
