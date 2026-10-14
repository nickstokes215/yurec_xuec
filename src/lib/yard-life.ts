import { stories, getCharacter } from "@/data/catalog";
import { CROSSWORDS } from "@/data/crossword";

export type WallNote = { id: string; text: string; at: number };

const WALL_KEY = "yurec-wall";
const SHOUT_LAST = "yurec-shout-last";
const SHOUT_SEEN = "yurec-shout-seen";

const MONTHS = [
  "Январь. Батарея молчит, ор нет.",
  "Февраль. Двор серый, «Путинка» прозрачная.",
  "Март. Снег сдался, линолеум ещё нет.",
  "Апрель. Лужи стали характером.",
  "Май. Ёлка всё ещё в углу. Это уже стиль.",
  "Июнь. Комары и Гоша делят антенну.",
  "Июль. Жара. Бак пахнет сильнее легенды.",
  "Август. Асфальт липнет к тапку.",
  "Сентябрь. Киоск снова шуршит газетой.",
  "Октябрь. Темнеет рано, ор слышно дальше.",
  "Ноябрь. Шотман мокрый. Империя в носках.",
  "Декабрь. Снег на баке. Юрец говорит — это погоны.",
];

const WEEK = [
  "Воскресенье. Двор выходной, Юрец нет.",
  "Понедельник. Сосед уже стучит. Рано.",
  "Вторник. Обычное утро, необычный ор.",
  "Среда. Середина. Рюмка считает себя завтраком.",
  "Четверг. До выходных как до Искровского.",
  "Пятница. Киоск ставит кроссворд посвежее.",
  "Суббота. Помойка богаче, чем в будни.",
];

export function isYardHoliday(d = new Date()) {
  const m = d.getMonth();
  const day = d.getDate();
  if (m === 0 && day === 1) return true;
  if (m === 1 && day === 23) return true;
  if (m === 6) return true;
  return false;
}

export function yardMorning(d = new Date()) {
  const m = d.getMonth();
  const day = d.getDate();
  if (m === 0 && day === 1) return "С Новым, Шотман. Ёлка подождёт. Рюмка — нет.";
  if (m === 1 && day === 23) return "Двадцать третье. Батя салютовал бы дробью. Юрец салютует «Путинкой».";
  if (m === 6) return "Июльская жара. Окно открыто, ор идёт на весь Невский район.";
  return MONTHS[m] + " " + WEEK[d.getDay()];
}

function endings(id: string) {
  try {
    if (id === "crossword" && !localStorage.getItem("yurec-game-endings:crossword")) {
      const old = localStorage.getItem("yurec-game-endings");
      if (old) return Array.isArray(JSON.parse(old)) && JSON.parse(old).length > 0;
    }
    const raw = JSON.parse(localStorage.getItem("yurec-game-endings:" + id) || "[]") as unknown;
    return Array.isArray(raw) && raw.length > 0;
  } catch {
    return false;
  }
}

function wins(key: string): Record<string, number> {
  try {
    const raw = JSON.parse(localStorage.getItem(key) || "{}") as unknown;
    return raw && typeof raw === "object" ? (raw as Record<string, number>) : {};
  } catch {
    return {};
  }
}

function readList(key: string): string[] {
  try {
    const raw = JSON.parse(localStorage.getItem(key) || "[]") as unknown;
    return Array.isArray(raw) ? raw.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function cwNo(id: string) {
  if (id === "crossword") return 1;
  const m = /^crossword-(\d+)$/.exec(id);
  return m ? Number(m[1]) : 0;
}

type Shout = { id: string; text: string };

function shoutPool(): Shout[] {
  const out: Shout[] = [];
  const read = new Set(readList("yurec-read"));
  const av = wins("yurec-av-wins");
  const ark = wins("yurec-ark-wins");
  const emptyCw = CROSSWORDS.filter((c) => !endings(c.id)).sort((a, b) => cwNo(a.id) - cwNo(b.id));
  if (emptyCw.length) {
    const c = emptyCw[0];
    out.push({ id: "cw-" + c.id, text: c.title + " до сих пор пустой." });
    if (emptyCw.length > 3) {
      out.push({ id: "cw-n", text: "В киоске пустых сеток: " + emptyCw.length + ". Карандаш стынет." });
    }
  } else if (CROSSWORDS.length) {
    out.push({ id: "cw-all", text: "Киоск закрыт. Все кроссворды уже орёт «готово»." });
  }
  if (!(Number(av.yasher) > 0)) out.push({ id: "yasher", text: "Бабку не отбил." });
  if (!(Number(av.batya) > 0)) out.push({ id: "batya", text: "Батя ещё с дробью. Купол не проверял." });
  if (!(Number(av.sveta) > 0)) out.push({ id: "sveta", text: "Светка в Максидоме. Поцелуй так и висит." });
  const arkAny = Object.keys(ark).some((k) => Number(ark[k]) > 0);
  if (!arkAny) out.push({ id: "ark", text: "Харя ещё не ракетка. Алконоид пылится." });
  const left = stories.filter((s) => !read.has(s.slug)).length;
  if (read.size === 0) out.push({ id: "read0", text: "Ни одной серии. Двор думает, ты почтальон." });
  else if (left > 0) out.push({ id: "readn", text: "Недочитано " + left + ". Полка уже орёт." });
  else out.push({ id: "readdone", text: "Сборник дочитан. Юрец не верит и орёт ещё раз." });
  try {
    const ach = JSON.parse(localStorage.getItem("yurec-achievements") || "{}") as Record<string, number>;
    const got = ach && typeof ach === "object" ? Object.keys(ach).length : 0;
    if (got < 50) out.push({ id: "ach", text: "Зашкваров " + got + ". Остальные сами не откроются." });
  } catch {
    /* ignore */
  }
  try {
    if (localStorage.getItem("yurec-license") !== "1" && localStorage.getItem("yurec-dev") !== "1") {
      out.push({ id: "vest", text: "Жилетка не куплена. Двор считает тебя гостем." });
    }
  } catch {
    /* ignore */
  }
  if (!readWall().length) {
    out.push({ id: "wall", text: "Стена в подъезде голая. Мел лежит. Пиши." });
  } else {
    out.push({ id: "wall-n", text: "На стене " + readWall().length + " надписей. Сосед уже читает." });
  }
  try {
    const last = JSON.parse(localStorage.getItem("yurec-last") || "null") as { slug?: string; percent?: number } | null;
    if (last && last.slug && Number(last.percent) > 3 && Number(last.percent) < 99) {
      const st = stories.find((s) => s.slug === last.slug);
      if (st) out.push({ id: "cont", text: "«" + st.title + "» брошен на " + Math.round(Number(last.percent)) + "%." });
    }
  } catch {
    /* ignore */
  }
  try {
    const plays = Number(localStorage.getItem("yurec-svoya-plays") || "0");
    if (!plays) out.push({ id: "svoya", text: "«Юрца игра» пылится. Темы сами не откроются." });
  } catch {
    /* ignore */
  }
  if (!out.length) out.push({ id: "ok", text: "Двор на месте. Ты тоже. Это уже прогресс." });
  return out;
}

export function takeShout(): string | null {
  try {
    if (sessionStorage.getItem(SHOUT_SEEN) === "1") return null;
    if (localStorage.getItem("yurec-tour") !== "1") return null;
  } catch {
    return null;
  }
  const pool = shoutPool();
  let last = "";
  try {
    last = localStorage.getItem(SHOUT_LAST) || "";
  } catch {
    last = "";
  }
  const fresh = pool.filter((x) => x.id !== last);
  const pick = (fresh.length ? fresh : pool)[Math.floor(Math.random() * (fresh.length ? fresh.length : pool.length))]!;
  try {
    localStorage.setItem(SHOUT_LAST, pick.id);
    sessionStorage.setItem(SHOUT_SEEN, "1");
  } catch {
    /* ignore */
  }
  return pick.text;
}

export function readWall(): WallNote[] {
  try {
    const raw = JSON.parse(localStorage.getItem(WALL_KEY) || "[]") as unknown;
    if (!Array.isArray(raw)) return [];
    return raw
      .filter((x): x is WallNote => !!x && typeof x === "object" && typeof (x as WallNote).text === "string")
      .slice(0, 40);
  } catch {
    return [];
  }
}

function writeWall(list: WallNote[]) {
  try {
    localStorage.setItem(WALL_KEY, JSON.stringify(list.slice(0, 40)));
  } catch {
    /* ignore */
  }
}

export function addWall(text: string) {
  const t = text.replace(/\s+/g, " ").trim().slice(0, 120);
  if (!t) return readWall();
  const next = [{ id: String(Date.now()), text: t, at: Date.now() }, ...readWall()].slice(0, 40);
  writeWall(next);
  return next;
}

export function removeWall(id: string) {
  const next = readWall().filter((n) => n.id !== id);
  writeWall(next);
  return next;
}

export const WALK = [
  {
    layer: "yard",
    pin: "larek",
    title: "Ларёк",
    text: "Жёлтая лампочка, окошко 24/7. Пенсионный фонд «Путинки». Юрец берёт сдачу орлом и идёт дальше.",
    voice: "/quotes/yurec-legenda.mp3",
  },
  {
    layer: "yard",
    pin: "pomoyka",
    title: "Помойка",
    text: "Три бака слева. Казна двора. Гоша уже смотрит, кто что выбросил. Отсюда холодильник не закрывается.",
    voice: "/quotes/gosha-revel.mp3",
  },
  {
    layer: "flat",
    pin: "fridge",
    title: "Трёшка",
    text: "Подъезд пройден. Холодильник нараспашку: капуста, кефир, империя. Можно разуваться. Можно не разуваться.",
    voice: "/quotes/yurec-dlya-svetki.mp3",
  },
] as const;

export async function sharePostcard(opts: { text: string; speaker: string; speakerId: string }) {
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1440;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Нет холста");
  ctx.fillStyle = "#14110c";
  ctx.fillRect(0, 0, 1080, 1440);
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 10;
  ctx.strokeRect(48, 48, 984, 1344);

  const ch = getCharacter(opts.speakerId);
  const photo = ch?.photo?.split("?")[0] || "";
  await new Promise<void>((resolve) => {
    if (!photo) {
      resolve();
      return;
    }
    const img = new Image();
    img.onload = () => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(540, 340, 168, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(img, 372, 172, 336, 336);
      ctx.restore();
      ctx.beginPath();
      ctx.arc(540, 340, 168, 0, Math.PI * 2);
      ctx.strokeStyle = "#c9a227";
      ctx.lineWidth = 8;
      ctx.stroke();
      resolve();
    };
    img.onerror = () => resolve();
    img.src = photo;
  });

  ctx.fillStyle = "#e8c547";
  ctx.font = "600 28px Manrope, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(opts.speaker.toUpperCase(), 540, 560);

  ctx.fillStyle = "#f4efe4";
  ctx.font = "italic 52px Literata, Georgia, serif";
  const words = ("«" + opts.text + "»").split(" ");
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const tryLine = line ? line + " " + w : w;
    if (ctx.measureText(tryLine).width > 860) {
      if (line) lines.push(line);
      line = w;
    } else line = tryLine;
  }
  if (line) lines.push(line);
  let y = 660;
  for (const row of lines.slice(0, 8)) {
    ctx.fillText(row, 540, y);
    y += 68;
  }

  ctx.save();
  ctx.translate(820, 1180);
  ctx.rotate(-0.28);
  ctx.beginPath();
  ctx.arc(0, 0, 118, 0, Math.PI * 2);
  ctx.strokeStyle = "#c43b6e";
  ctx.lineWidth = 8;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, 100, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = "#c43b6e";
  ctx.font = "700 36px Manrope, sans-serif";
  ctx.fillText("ШОТМАН", 0, 8);
  ctx.font = "600 18px Manrope, sans-serif";
  ctx.fillText("НЕВСКИЙ", 0, 40);
  ctx.restore();

  ctx.fillStyle = "#a89878";
  ctx.font = "600 26px Manrope, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("Жизнь Юрца", 96, 1280);

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.92));
  if (!blob) throw new Error("Пустая открытка");
  const b64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || "").split(",")[1] || "");
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
  const native = (window as Window & { YurecNative?: { savePostcard?: (data: string) => string } }).YurecNative;
  let saved = false;
  if (native && typeof native.savePostcard === "function") {
    saved = native.savePostcard(b64) === "ok";
  }
  const file = new File([blob], "shotman-otkrytka.jpg", { type: "image/jpeg" });
  const nav = navigator as Navigator & { canShare?: (data: ShareData) => boolean };
  if (nav.canShare && nav.canShare({ files: [file] }) && navigator.share) {
    await navigator.share({ files: [file], title: "Открытка со Шотмана", text: opts.text });
    return (saved ? "gallery" : "shared") as "gallery" | "shared";
  }
  if (saved) return "gallery" as const;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "shotman-otkrytka.jpg";
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 2000);
  return "file" as const;
}
