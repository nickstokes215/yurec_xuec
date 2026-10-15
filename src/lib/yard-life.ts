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

type Paper = {
  a: string;
  b: string;
  ink: string;
  mute: string;
  stamp: string;
  kind: "night" | "chalk" | "news" | "rain" | "rust" | "fridge" | "soviet" | "lino";
};

const PAPERS: Paper[] = [
  { a: "#14110c", b: "#3a2a16", ink: "#f6f0e4", mute: "#e8c547", stamp: "#c43b6e", kind: "night" },
  { a: "#1a2618", b: "#31422c", ink: "#e7f0d8", mute: "#d5e4c4", stamp: "#e8c547", kind: "chalk" },
  { a: "#f4ead6", b: "#e2d0ae", ink: "#241910", mute: "#7a2e2e", stamp: "#9a3030", kind: "news" },
  { a: "#0d2233", b: "#1c4664", ink: "#e8f4fb", mute: "#9ad4ea", stamp: "#e8c547", kind: "rain" },
  { a: "#3b2214", b: "#8a4b28", ink: "#fff4e8", mute: "#f0c27a", stamp: "#1a120c", kind: "rust" },
  { a: "#d7eef3", b: "#8fb9c6", ink: "#102830", mute: "#14586e", stamp: "#c43b6e", kind: "fridge" },
  { a: "#6d1c28", b: "#2c0c12", ink: "#f8e7c4", mute: "#f0d78c", stamp: "#f4efe4", kind: "soviet" },
  { a: "#241c16", b: "#4a3a28", ink: "#f4efe4", mute: "#c9a227", stamp: "#c43b6e", kind: "lino" },
  { a: "#12101a", b: "#2c2640", ink: "#f4efe8", mute: "#d8c6f2", stamp: "#e8c547", kind: "night" },
  { a: "#10211c", b: "#0c1412", ink: "#e7f3ec", mute: "#b7d7c4", stamp: "#c9a227", kind: "rain" },
];

const QUOTE_FONTS = [
  "italic {s}px Georgia, 'Times New Roman', serif",
  "{s}px 'Courier New', ui-monospace, monospace",
  "italic {s}px Palatino, 'Iowan Old Style', Georgia, serif",
  "{s}px 'Segoe Print', 'Comic Sans MS', cursive",
  "700 {s}px Manrope, ui-sans-serif, sans-serif",
  "italic 600 {s}px Literata, Georgia, serif",
  "{s}px ui-sans-serif, system-ui, sans-serif",
  "italic 700 {s}px 'Iowan Old Style', Palatino, serif",
];

function pick<T>(list: readonly T[]): T {
  return list[Math.floor(Math.random() * list.length)]!;
}

function cover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, size: number) {
  const s = Math.max(size / img.width, size / img.height);
  const w = img.width * s;
  const h = img.height * s;
  ctx.drawImage(img, x + (size - w) / 2, y + (size - h) / 2, w, h);
}

function wrapLines(ctx: CanvasRenderingContext2D, text: string, max: number) {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const tryLine = line ? line + " " + w : w;
    if (ctx.measureText(tryLine).width > max && line) {
      lines.push(line);
      line = w;
    } else line = tryLine;
  }
  if (line) lines.push(line);
  return lines;
}

function paintPaper(ctx: CanvasRenderingContext2D, paper: Paper) {
  const ang = Math.random() * Math.PI * 2;
  const g = ctx.createLinearGradient(540 - Math.cos(ang) * 800, 720 - Math.sin(ang) * 900, 540 + Math.cos(ang) * 800, 720 + Math.sin(ang) * 900);
  g.addColorStop(0, paper.a);
  g.addColorStop(1, paper.b);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 1080, 1440);
  ctx.save();
  if (paper.kind === "night") {
    ctx.fillStyle = paper.mute;
    for (let i = 0; i < 48; i++) {
      ctx.globalAlpha = 0.25 + Math.random() * 0.6;
      const x = 40 + Math.random() * 1000;
      const y = 40 + Math.random() * 1360;
      ctx.fillRect(x, y, 2, 8);
      ctx.fillRect(x - 3, y + 3, 8, 2);
    }
  } else if (paper.kind === "chalk") {
    ctx.fillStyle = "#f4f7ee";
    for (let i = 0; i < 180; i++) {
      ctx.globalAlpha = 0.05 + Math.random() * 0.18;
      ctx.beginPath();
      ctx.arc(Math.random() * 1080, Math.random() * 1440, 1 + Math.random() * 3, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (paper.kind === "news") {
    ctx.strokeStyle = "rgba(36,25,16,.18)";
    ctx.lineWidth = 1;
    for (let y = 80; y < 1400; y += 36) {
      ctx.beginPath();
      ctx.moveTo(70, y);
      ctx.lineTo(1010, y);
      ctx.stroke();
    }
  } else if (paper.kind === "rain") {
    ctx.strokeStyle = "rgba(232,244,251,.28)";
    ctx.lineWidth = 2;
    for (let i = 0; i < 70; i++) {
      const x = Math.random() * 1080;
      const y = Math.random() * 1440;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - 18, y + 46);
      ctx.stroke();
    }
  } else if (paper.kind === "rust") {
    ctx.fillStyle = "rgba(90,40,16,.35)";
    for (let i = 0; i < 14; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * 1080, Math.random() * 1440, 20 + Math.random() * 70, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (paper.kind === "fridge") {
    ctx.fillStyle = "rgba(255,255,255,.35)";
    for (let i = 0; i < 8; i++) ctx.fillRect(0, Math.random() * 1440, 1080, 8 + Math.random() * 22);
  } else if (paper.kind === "soviet") {
    ctx.fillStyle = "rgba(248,231,196,.12)";
    ctx.beginPath();
    ctx.arc(860, 220, 180, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.strokeStyle = "rgba(244,239,228,.12)";
    ctx.lineWidth = 2;
    for (let i = -8; i < 18; i++) {
      ctx.beginPath();
      ctx.moveTo(i * 90, 0);
      ctx.lineTo(i * 90 + 700, 1440);
      ctx.moveTo(i * 90, 1440);
      ctx.lineTo(i * 90 + 700, 0);
      ctx.stroke();
    }
  }
  ctx.restore();
}

function paintStamp(ctx: CanvasRenderingContext2D, paper: Paper, x: number, y: number) {
  const sub = pick(["НЕВСКИЙ", "ДВОР", "ОРЁТ", "147", String(new Date().getFullYear())]);
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-0.4 + Math.random() * 0.5);
  ctx.beginPath();
  ctx.arc(0, 0, 108, 0, Math.PI * 2);
  ctx.strokeStyle = paper.stamp;
  ctx.lineWidth = 7;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, 90, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = paper.stamp;
  ctx.textAlign = "center";
  ctx.font = "700 32px Manrope, sans-serif";
  ctx.fillText("ШОТМАН", 0, 6);
  ctx.font = "600 16px Manrope, sans-serif";
  ctx.fillText(sub, 0, 34);
  ctx.restore();
}

function paintCard(ctx: CanvasRenderingContext2D, img: HTMLImageElement | null, text: string, speaker: string) {
  const paper = pick(PAPERS);
  const layout = Math.floor(Math.random() * 3);
  const fontTpl = pick(QUOTE_FONTS);
  paintPaper(ctx, paper);
  ctx.strokeStyle = paper.mute;
  ctx.lineWidth = layout === 1 ? 4 : 10;
  if (layout !== 2) ctx.strokeRect(46, 46, 988, 1348);
  if (Math.random() < 0.45) {
    ctx.lineWidth = 2;
    ctx.strokeRect(64, 64, 952, 1312);
  }

  let quoteX = 540;
  let quoteMax = 860;
  let quoteTop = 620;
  ctx.textAlign = "center";

  if (img && layout === 0) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(540, 330, 156, 0, Math.PI * 2);
    ctx.clip();
    cover(ctx, img, 384, 174, 312);
    ctx.restore();
    ctx.beginPath();
    ctx.arc(540, 330, 156, 0, Math.PI * 2);
    ctx.strokeStyle = paper.mute;
    ctx.lineWidth = 8;
    ctx.stroke();
    paintStamp(ctx, paper, 820, 1180);
  } else if (img && layout === 1) {
    ctx.save();
    ctx.translate(780, 250);
    ctx.rotate(-0.08);
    ctx.fillStyle = paper.ink;
    ctx.fillRect(-8, -8, 236, 276);
    ctx.beginPath();
    ctx.rect(0, 0, 220, 260);
    ctx.clip();
    cover(ctx, img, 0, 0, 220);
    ctx.restore();
    quoteX = 500;
    quoteMax = 720;
    quoteTop = 560;
    paintStamp(ctx, paper, 240, 1180);
  } else if (img) {
    ctx.fillStyle = paper.mute;
    ctx.fillRect(0, 0, 86, 1440);
    ctx.save();
    ctx.beginPath();
    ctx.arc(220, 360, 130, 0, Math.PI * 2);
    ctx.clip();
    cover(ctx, img, 90, 230, 260);
    ctx.restore();
    ctx.beginPath();
    ctx.arc(220, 360, 130, 0, Math.PI * 2);
    ctx.strokeStyle = paper.ink;
    ctx.lineWidth = 6;
    ctx.stroke();
    quoteX = 680;
    quoteMax = 620;
    quoteTop = 560;
    paintStamp(ctx, paper, 860, 1200);
  } else {
    paintStamp(ctx, paper, pick([240, 820]), 1180);
    quoteTop = 480;
  }

  ctx.fillStyle = paper.mute;
  ctx.font = "600 26px Manrope, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(speaker.toUpperCase(), quoteX, quoteTop - 48);

  const quoted = "«" + text + "»";
  let size = text.length > 90 ? 40 : text.length > 50 ? 48 : 56;
  let lines: string[] = [];
  for (; size >= 28; size -= 2) {
    ctx.font = fontTpl.replace("{s}", String(size));
    lines = wrapLines(ctx, quoted, quoteMax);
    if (lines.length <= 8) break;
  }
  ctx.fillStyle = paper.ink;
  ctx.textAlign = "center";
  let y = quoteTop;
  const step = size + 16;
  for (const row of lines.slice(0, 8)) {
    ctx.fillText(row, quoteX, y);
    y += step;
  }

  ctx.fillStyle = paper.mute;
  ctx.font = "600 24px Manrope, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("Жизнь Юрца", layout === 2 ? 140 : 92, 1324);
}

export async function sharePostcard(opts: { text: string; speaker: string; speakerId: string }) {
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1440;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Нет холста");
  const ch = getCharacter(opts.speakerId);
  const photo = ch?.photo?.split("?")[0] || "";
  const img = await new Promise<HTMLImageElement | null>((resolve) => {
    if (!photo) {
      resolve(null);
      return;
    }
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = () => resolve(null);
    el.src = photo;
  });
  paintCard(ctx, img, opts.text, opts.speaker);

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
