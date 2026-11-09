import { APP_VERSION } from "@/data/catalog";
import { DEV_CHAT_URL } from "@/lib/use-settings";

const AT = "yurec-notes-at";
const ASKED = "yurec-notes-asked";
const PLAN_KEY = "yurec-notes-plan";
const CLOCK_KEY = "yurec-notes-clock";
const DAY = 24 * 60 * 60 * 1000;
const LATEST = "https://api.github.com/repos/nickstokes215/yurec_xuec/releases/latest";

type Line = { title: string; text: string; route: string; url?: string };

const LINES: Line[] = [
  { title: "Кроссворд стынет", text: "В киоске пустая сетка. Карандаш на месте.", route: "/" },
  { title: "Помойкобол", text: "Бабка размялась. Один матч, и можно закрыть.", route: "/game/av" },
  { title: "Цитата дня", text: "Одна фраза на столе. Не скрин — зайди.", route: "/citats" },
  { title: "Алконоид", text: "Шарик уже на харе. Запыльни, когда будет время.", route: "/game/ark" },
  { title: "Шотман", text: "Двор на месте. Ты давно не заглядывал.", route: "/" },
  { title: "Киоск", text: "Кроссворд не решится сам. Пять минут.", route: "/game/crosswords" },
  { title: "Стена", text: "Мел лежит. Подъезд ждёт одну строку.", route: "/wall" },
  { title: "Юрца игра", text: "Три раунда. Кот и аукцион не подписаны. Перо в серванте.", route: "/game/svoya" },
  { title: "Недочитано", text: "Серия брошена на диване. Можно с того же места.", route: "/" },
  { title: "Квест", text: "На Шотмана есть ход, который ты ещё не делал.", route: "/game/quest" },
  { title: "Гоша", text: "Каркнул один раз. Это не спам, это стук.", route: "/" },
  { title: "Сборник", text: "Полка пылится. Открой любой рассказ.", route: "/" },
  { title: "Песня", text: "Один куплет. Соседи ещё спят, можно тихо.", route: "/" },
  { title: "Визит", text: "Порог трёшки. Второй раз Юрец уже налил.", route: "/" },
  { title: "Бонус", text: "Спецвыпуск лежит отдельно. Пять минут, и медаль ближе.", route: "/" },
  { title: "Партия", text: "Один розыгрыш в Помойкоболе. После гола можно закрыть.", route: "/game/av" },
];

const DEV_LINE: Line = {
  title: "Разработка",
  text: "Лимит мог отпуститься. Зайди в Grok и продолжи работу над двором.",
  route: "/settings",
  url: DEV_CHAT_URL,
};

export type NoteMode = "span" | "clock" | "random";
export type NoteKind = "all" | "day" | "dev" | "upd";
export type NoteChan = { on: boolean; mode: NoteMode; min: number };
export type NotePlan = { day: NoteChan; dev: NoteChan; upd: NoteChan };

type Native = {
  notesAsk?: () => string;
  notesTest?: () => string;
  notesTestKind?: (kind: string) => string;
  notesClock?: (minutes: number) => string;
  notesPlan?: (json: string) => string;
};

function bridge(): Native | null {
  const n = (window as Window & { YurecNative?: Native }).YurecNative;
  return n || null;
}

const timers: Record<"day" | "dev" | "upd", number> = { day: 0, dev: 0, upd: 0 };

export function notesMinutes(hhmm: string): number {
  const m = /^(\d{2}):(\d{2})$/.exec(hhmm);
  if (!m) return -1;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h > 23 || min > 59) return -1;
  return h * 60 + min;
}

export function notesHHMM(min: number): string {
  if (min < 0 || min > 1439) return "08:00";
  const h = Math.floor(min / 60);
  const m = min % 60;
  return String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0");
}

export function rollMinute(): number {
  return Math.floor(Math.random() * 1440);
}

function legacyClock(): string {
  try {
    const v = localStorage.getItem(CLOCK_KEY) || "";
    return /^\d{2}:\d{2}$/.test(v) ? v : "";
  } catch {
    return "";
  }
}

function blankPlan(): NotePlan {
  const clock = legacyClock();
  const mins = notesMinutes(clock);
  return {
    day: mins >= 0 ? { on: true, mode: "clock", min: mins } : { on: true, mode: "span", min: -1 },
    dev: { on: false, mode: "clock", min: 8 * 60 },
    upd: { on: true, mode: "clock", min: 8 * 60 },
  };
}

function asChan(raw: unknown, fallback: NoteChan): NoteChan {
  if (!raw || typeof raw !== "object") return fallback;
  const o = raw as Partial<NoteChan>;
  const mode = o.mode === "span" || o.mode === "clock" || o.mode === "random" ? o.mode : fallback.mode;
  const min = typeof o.min === "number" && o.min >= -1 && o.min <= 1439 ? o.min : fallback.min;
  return { on: typeof o.on === "boolean" ? o.on : fallback.on, mode, min };
}

export function readNotesPlan(): NotePlan {
  const fb = blankPlan();
  try {
    const raw = JSON.parse(localStorage.getItem(PLAN_KEY) || "null") as Partial<NotePlan> | null;
    if (!raw) return fb;
    const day = asChan(raw.day, fb.day);
    const dev = asChan(raw.dev, fb.dev);
    const upd = asChan(raw.upd, fb.upd);
    if (dev.mode === "span") dev.mode = "clock";
    if (upd.mode === "span") upd.mode = "clock";
    return { day, dev, upd };
  } catch {
    return fb;
  }
}

export function readNotesClock(): string {
  const day = readNotesPlan().day;
  if (!day.on || day.mode === "span" || day.min < 0) return "";
  return notesHHMM(day.min);
}

function writePlan(plan: NotePlan) {
  try {
    localStorage.setItem(PLAN_KEY, JSON.stringify(plan));
    if (plan.day.on && plan.day.mode !== "span" && plan.day.min >= 0) localStorage.setItem(CLOCK_KEY, notesHHMM(plan.day.min));
    else localStorage.removeItem(CLOCK_KEY);
  } catch {
    /* память закрыта */
  }
}

export function setNotesClock(hhmm: string) {
  const plan = readNotesPlan();
  const mins = notesMinutes(hhmm);
  plan.day = mins < 0 ? { on: true, mode: "span", min: -1 } : { on: true, mode: "clock", min: mins };
  setNotesPlan(plan);
}

export function setNotesPlan(next: NotePlan): NotePlan {
  writePlan(next);
  const native = bridge();
  if (native && typeof native.notesPlan === "function") {
    try {
      const back = native.notesPlan(JSON.stringify(next));
      const parsed = JSON.parse(String(back || "")) as Partial<NotePlan>;
      if (parsed && parsed.day) {
        const plan = {
          day: asChan(parsed.day, next.day),
          dev: asChan(parsed.dev, next.dev),
          upd: asChan(parsed.upd, next.upd),
        };
        writePlan(plan);
        return plan;
      }
    } catch {
      /* мост молчит */
    }
    return next;
  }
  if (native && typeof native.notesClock === "function") {
    try {
      const day = next.day;
      native.notesClock(day.on && day.mode !== "span" ? day.min : -1);
    } catch {
      /* мост молчит */
    }
  }
  armWeb(false);
  return next;
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
    if (line.url) window.open(line.url, "_blank");
    else window.location.assign(line.route);
  };
}

function cmpVer(a: string, b: string) {
  const as = a.split(".");
  const bs = b.split(".");
  const n = Math.max(as.length, bs.length);
  for (let i = 0; i < n; i++) {
    const ai = Number(as[i] || 0);
    const bi = Number(bs[i] || 0);
    if (ai !== bi) return ai - bi;
  }
  return 0;
}

async function checkUpdateWeb() {
  try {
    const res = await fetch(LATEST, { headers: { Accept: "application/vnd.github+json" } });
    if (!res.ok) return;
    const data = (await res.json()) as { tag_name?: string };
    const tag = String(data.tag_name || "").replace(/^[vV]/, "");
    if (!tag || cmpVer(tag, APP_VERSION) <= 0) return;
    const told = localStorage.getItem("yurec-notes-told") || "";
    if (told === tag) return;
    localStorage.setItem("yurec-notes-told", tag);
    show(
      {
        title: "Обновление " + tag,
        text: "Доступна новая сборка. Скачать можно с официального источника автора.",
        route: "/apk",
      },
      "yurec-upd",
    );
  } catch {
    /* сеть молчит */
  }
}

function waitMs(min: number, forceNextDay: boolean) {
  const now = new Date();
  const cur = now.getHours() * 60 + now.getMinutes();
  let wait = min - cur;
  if (forceNextDay || wait <= 0) wait += 24 * 60;
  return Math.max(1, wait) * 60 * 1000;
}

function clearTimer(id: "day" | "dev" | "upd") {
  if (timers[id]) window.clearTimeout(timers[id]);
  timers[id] = 0;
}

function armWeb(forceNextDay: boolean) {
  if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
  if (bridge()?.notesPlan) return;
  const plan = readNotesPlan();
  armChan("day", plan.day, forceNextDay);
  armChan("dev", plan.dev, forceNextDay);
  armChan("upd", plan.upd, forceNextDay);
}

function armChan(id: "day" | "dev" | "upd", chan: NoteChan, forceNextDay: boolean) {
  clearTimer(id);
  if (!chan.on) return;
  if (id === "day" && chan.mode === "span") {
    const last = Number(localStorage.getItem(AT) || "0");
    const wait = Math.max(60_000, last ? last + DAY - Date.now() : DAY);
    timers.day = window.setTimeout(() => {
      show(dayLine(), "yurec-daily");
      localStorage.setItem(AT, String(Date.now()));
      armChan("day", readNotesPlan().day, true);
    }, wait);
    return;
  }
  const min = chan.min >= 0 && chan.min <= 1439 ? chan.min : 8 * 60;
  timers[id] = window.setTimeout(() => {
    if (id === "day") show(dayLine(), "yurec-daily");
    else if (id === "dev") show(DEV_LINE, "yurec-dev");
    else void checkUpdateWeb();
    const plan = readNotesPlan();
    if (plan[id].mode === "random") {
      plan[id] = { ...plan[id], min: rollMinute() };
      writePlan(plan);
    }
    armChan(id, readNotesPlan()[id], true);
  }, waitMs(min, forceNextDay));
}

export async function notesBoot() {
  const plan = readNotesPlan();
  const native = bridge();
  if (native && typeof native.notesPlan === "function") {
    try {
      const back = native.notesPlan(JSON.stringify(plan));
      const parsed = JSON.parse(String(back || "")) as Partial<NotePlan>;
      if (parsed && parsed.day) {
        writePlan({
          day: asChan(parsed.day, plan.day),
          dev: asChan(parsed.dev, plan.dev),
          upd: asChan(parsed.upd, plan.upd),
        });
      }
    } catch {
      /* мост молчит */
    }
    return;
  }
  if (native && typeof native.notesClock === "function") {
    try {
      native.notesClock(plan.day.on && plan.day.mode !== "span" ? plan.day.min : -1);
    } catch {
      /* мост молчит */
    }
    return;
  }
  if (typeof Notification === "undefined") return;
  try {
    if (localStorage.getItem(ASKED) === "1") {
      if (Notification.permission === "granted") armWeb(false);
      return;
    }
    localStorage.setItem(ASKED, "1");
    const perm = await Notification.requestPermission();
    if (perm === "granted") {
      localStorage.setItem(AT, String(Date.now()));
      armWeb(false);
    }
  } catch {
    /* браузер не дал */
  }
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
      armWeb(false);
      return "ok";
    }
    return "denied";
  } catch {
    return "fail";
  }
}

export async function notesTest(kind: NoteKind = "all"): Promise<string> {
  const native = bridge();
  if (native && typeof native.notesTestKind === "function") {
    try {
      return String(native.notesTestKind(kind) || "ok");
    } catch {
      return "fail";
    }
  }
  if (kind === "all" && native && typeof native.notesTest === "function") {
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
  const samples: Line[] = [];
  if (kind === "all" || kind === "upd") {
    samples.push({
      title: "Проверка: обновление",
      text: "Так выглядит канал обновлений. Это диагностика, не настоящий релиз. Настоящий стук скажет, что сборку можно скачать с официального источника автора.",
      route: "/apk",
    });
  }
  if (kind === "all" || kind === "day") samples.push(dayLine());
  if (kind === "all" || kind === "dev") samples.push(DEV_LINE);
  samples.forEach((line, i) => {
    window.setTimeout(() => show(line, "yurec-test-" + kind + "-" + i), i * 500);
  });
  return "ok";
}

export function notesHint(how: string) {
  if (how === "ok") return "Ушло. Можно проверить каждый канал отдельно: двор, разработка, обновление.";
  if (how === "ask") return "Система спрашивает доступ. Разреши — и проверка сработает.";
  if (how === "settings") return "Android больше не спрашивает. Включи уведомления в настройках системы.";
  if (how === "denied") return "Доступ закрыт. Без него стук в дверь не доходит.";
  if (how === "later") return "Уже спрашивали. Если отказал — включи в системе.";
  if (how === "нет") return "Этот браузер уведомления не умеет. На телефоне — умеет.";
  return "Не вышло. На телефоне это системный запрос.";
}
