const AT = "yurec-notes-at";
const ASKED = "yurec-notes-asked";
const DAY = 24 * 60 * 60 * 1000;

type Line = { title: string; text: string; route: string };

const LINES: Line[] = [
  { title: "Кроссворд стынет", text: "В киоске пустая сетка. Карандаш на месте.", route: "/" },
  { title: "Помойкобол", text: "Бабка размялась. Один матч, и можно закрыть.", route: "/game/av" },
  { title: "Цитата дня", text: "Одна фраза на столе. Не скрин — зайди.", route: "/citats" },
  { title: "Алконоид", text: "Шарик уже на харе. Запыльни, когда будет время.", route: "/game/ark" },
  { title: "Шотман", text: "Двор на месте. Ты давно не заглядывал.", route: "/" },
  { title: "Киоск", text: "Кроссворд не решится сам. Пять минут.", route: "/game/crosswords" },
  { title: "Стена", text: "Мел лежит. Подъезд ждёт одну строку.", route: "/wall" },
  { title: "Юрца игра", text: "Два раунда, кот и аукцион. Перо в серванте.", route: "/game/svoya" },
  { title: "Недочитано", text: "Серия брошена на диване. Можно с того же места.", route: "/" },
  { title: "Квест", text: "На Шотмана есть ход, который ты ещё не делал.", route: "/game/quest" },
  { title: "Гоша", text: "Каркнул один раз. Это не спам, это стук.", route: "/" },
  { title: "Сборник", text: "Полка пылится. Открой любой рассказ.", route: "/" },
  { title: "Песня", text: "Один куплет. Соседи ещё спят, можно тихо.", route: "/" },
  { title: "Визит", text: "Порог трёшки. Второй раз Юрец уже налил.", route: "/" },
  { title: "Бонус", text: "Спецвыпуск лежит отдельно. Пять минут, и медаль ближе.", route: "/" },
  { title: "Партия", text: "Один розыгрыш в Помойкоболе. После гола можно закрыть.", route: "/game/av" },
];

type Native = {
  notesAsk?: () => string;
  notesTest?: () => string;
  notesClock?: (minutes: number) => string;
};

function bridge(): Native | null {
  const n = (window as Window & { YurecNative?: Native }).YurecNative;
  return n || null;
}

const CLOCK_KEY = "yurec-notes-clock";
let clockTimer = 0;

export function readNotesClock(): string {
  try {
    const v = localStorage.getItem(CLOCK_KEY) || "";
    return /^\d{2}:\d{2}$/.test(v) ? v : "";
  } catch {
    return "";
  }
}

export function notesMinutes(hhmm: string): number {
  const m = /^(\d{2}):(\d{2})$/.exec(hhmm);
  if (!m) return -1;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h > 23 || min > 59) return -1;
  return h * 60 + min;
}

export function setNotesClock(hhmm: string) {
  const mins = notesMinutes(hhmm);
  try {
    if (mins < 0) localStorage.removeItem(CLOCK_KEY);
    else localStorage.setItem(CLOCK_KEY, hhmm);
  } catch {
    /* память закрыта */
  }
  const native = bridge();
  if (native && typeof native.notesClock === "function") {
    try {
      native.notesClock(mins);
    } catch {
      /* мост молчит */
    }
  }
  armWebClock();
}

function armWebClock() {
  if (clockTimer) window.clearTimeout(clockTimer);
  clockTimer = 0;
  if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
  const mins = notesMinutes(readNotesClock());
  if (mins < 0) return;
  const now = new Date();
  const cur = now.getHours() * 60 + now.getMinutes();
  let wait = mins - cur;
  if (wait <= 0) wait += 24 * 60;
  clockTimer = window.setTimeout(() => {
    maybeDailyWeb();
    armWebClock();
  }, wait * 60 * 1000);
}
function dayLine(): Line {
  const t = new Date();
  const idx = (t.getFullYear() * 366 + Math.floor((t.getTime() - Date.UTC(t.getFullYear(), 0, 0)) / 86400000)) % LINES.length;
  return LINES[idx] || LINES[0]!;
}

function show(line: Line, tag: string) {
  const n = new Notification(line.title, { body: line.text, tag });
  n.onclick = () => {
    window.focus();
    n.close();
    window.location.assign(line.route);
  };
}

export async function notesBoot() {
  const native = bridge();
  if (native && typeof native.notesAsk === "function") {
    if (typeof native.notesClock === "function") {
      try {
        native.notesClock(notesMinutes(readNotesClock()));
      } catch {
        /* мост молчит */
      }
    }
    return;
  }
  if (typeof Notification === "undefined") return;
  try {
    if (localStorage.getItem(ASKED) === "1") {
      if (Notification.permission === "granted") {
        maybeDailyWeb();
        armWebClock();
      }
      return;
    }
    localStorage.setItem(ASKED, "1");
    const perm = await Notification.requestPermission();
    if (perm === "granted") {
      localStorage.setItem(AT, String(Date.now()));
      armWebClock();
    }
  } catch {
    /* браузер не дал */
  }
}

function maybeDailyWeb() {
  const mins = notesMinutes(readNotesClock());
  const now = Date.now();
  const last = Number(localStorage.getItem(AT) || "0");
  if (mins >= 0) {
    const d = new Date();
    const cur = d.getHours() * 60 + d.getMinutes();
    if (cur < mins) return;
    const slot = new Date(d.getFullYear(), d.getMonth(), d.getDate(), Math.floor(mins / 60), mins % 60).getTime();
    if (last >= slot) return;
    show(dayLine(), "yurec-daily");
    localStorage.setItem(AT, String(now));
    return;
  }
  if (!last || now - last < DAY) return;
  show(dayLine(), "yurec-daily");
  localStorage.setItem(AT, String(now));
}

export async function notesAsk(): Promise<string> {
  const native = bridge();
  if (native && typeof native.notesAsk === "function") {
    try {
      return String(native.notesAsk() || "ok");
    } catch {
      return "fail";
    }
  }
  if (typeof Notification === "undefined") return "нет";
  try {
    localStorage.setItem(ASKED, "1");
    const perm = Notification.permission === "granted" ? "granted" : await Notification.requestPermission();
    if (perm === "granted") {
      if (!localStorage.getItem(AT)) localStorage.setItem(AT, String(Date.now()));
      armWebClock();
      return "ok";
    }
    return "denied";
  } catch {
    return "fail";
  }
}

export async function notesTest(): Promise<string> {
  const native = bridge();
  if (native && typeof native.notesTest === "function") {
    try {
      return String(native.notesTest() || "ok");
    } catch {
      return "fail";
    }
  }
  if (typeof Notification === "undefined") return "нет";
  let perm = Notification.permission;
  if (perm === "default") {
    try {
      perm = await Notification.requestPermission();
    } catch {
      return "fail";
    }
  }
  if (perm !== "granted") return "denied";
  const samples: Line[] = [
    { title: "Проверка: новая сборка", text: "Так выглядит канал обновлений. Это диагностика, не настоящий релиз.", route: "/apk" },
    LINES[0]!,
    LINES[1]!,
  ];
  samples.forEach((line, i) => {
    window.setTimeout(() => show(line, "yurec-test-" + i), i * 500);
  });
  return "ok";
}

export function notesHint(how: string) {
  if (how === "ok") return "Ушло. На телефоне три штуки: обновление, двор и игра. На сайте — если браузер пустил.";
  if (how === "ask") return "Система спрашивает доступ. Разреши — и проверка сработает.";
  if (how === "settings") return "Android больше не спрашивает. Включи уведомления в настройках системы.";
  if (how === "denied") return "Доступ закрыт. Без него стук в дверь не доходит.";
  if (how === "later") return "Уже спрашивали. Если отказал — включи в системе.";
  if (how === "нет") return "Этот браузер уведомления не умеет. На телефоне — умеет.";
  return "Не вышло. На телефоне это системный запрос.";
}
