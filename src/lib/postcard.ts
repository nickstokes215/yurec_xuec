import { getCharacter } from "@/data/catalog";

export type PostFont = "random" | "serif" | "mono" | "script" | "sans" | "book";
export type PostText = "day" | "custom";
export type PostImage = "speaker" | "yurec" | "custom" | "none";
export type PostFormat = "jpg" | "png";
export type PostPaperId = "random" | "night" | "chalk" | "news" | "rain" | "rust" | "fridge" | "soviet" | "lino";
export type PostPattern = "random" | "stars" | "dust" | "lines" | "rain" | "blots" | "bars" | "sun" | "grid" | "quiet";

export type PostcardPrefs = {
  on: boolean;
  font: PostFont;
  textMode: PostText;
  customText: string;
  image: PostImage;
  customImage: string;
  format: PostFormat;
  path: string;
  paper: PostPaperId;
  pattern: PostPattern;
  roll: number;
};

const KEY = "yurec-postcard";

export const POST_FONTS: { id: PostFont; label: string }[] = [
  { id: "random", label: "Случайный" },
  { id: "serif", label: "Антиква" },
  { id: "book", label: "Книжный" },
  { id: "script", label: "Рукопись" },
  { id: "mono", label: "Машинопись" },
  { id: "sans", label: "Гротеск" },
];

export const POST_PAPERS: { id: PostPaperId; label: string }[] = [
  { id: "random", label: "Случайный" },
  { id: "night", label: "Ночь" },
  { id: "chalk", label: "Мел" },
  { id: "news", label: "Газета" },
  { id: "rain", label: "Дождь" },
  { id: "rust", label: "Ржавчина" },
  { id: "fridge", label: "Холодильник" },
  { id: "soviet", label: "Советский" },
  { id: "lino", label: "Линолеум" },
];

export const POST_PATTERNS: { id: PostPattern; label: string }[] = [
  { id: "random", label: "Случайный" },
  { id: "stars", label: "Звёзды" },
  { id: "dust", label: "Пыль" },
  { id: "lines", label: "Линейка" },
  { id: "rain", label: "Дождь" },
  { id: "blots", label: "Пятна" },
  { id: "bars", label: "Полосы" },
  { id: "sun", label: "Солнце" },
  { id: "grid", label: "Клетка" },
  { id: "quiet", label: "Тихо" },
];

type Paper = { id: string; a: string; b: string; ink: string; mute: string; stamp: string };

const PAPERS: Paper[] = [
  { id: "night", a: "#14110c", b: "#3a2a16", ink: "#f6f0e4", mute: "#e8c547", stamp: "#c43b6e" },
  { id: "chalk", a: "#1a2618", b: "#31422c", ink: "#e7f0d8", mute: "#d5e4c4", stamp: "#e8c547" },
  { id: "news", a: "#f4ead6", b: "#e2d0ae", ink: "#241910", mute: "#7a2e2e", stamp: "#9a3030" },
  { id: "rain", a: "#0d2233", b: "#1c4664", ink: "#e8f4fb", mute: "#9ad4ea", stamp: "#e8c547" },
  { id: "rust", a: "#3b2214", b: "#8a4b28", ink: "#fff4e8", mute: "#f0c27a", stamp: "#1a120c" },
  { id: "fridge", a: "#d7eef3", b: "#8fb9c6", ink: "#102830", mute: "#14586e", stamp: "#c43b6e" },
  { id: "soviet", a: "#6d1c28", b: "#2c0c12", ink: "#f8e7c4", mute: "#f0d78c", stamp: "#f4efe4" },
  { id: "lino", a: "#241c16", b: "#4a3a28", ink: "#f4efe4", mute: "#c9a227", stamp: "#c43b6e" },
  { id: "night", a: "#12101a", b: "#2c2640", ink: "#f4efe8", mute: "#d8c6f2", stamp: "#e8c547" },
  { id: "rain", a: "#10211c", b: "#0c1412", ink: "#e7f3ec", mute: "#b7d7c4", stamp: "#c9a227" },
];

const FONT_TPL: Record<Exclude<PostFont, "random">, string> = {
  serif: "italic {s}px Georgia, 'Times New Roman', serif",
  mono: "{s}px 'Courier New', ui-monospace, monospace",
  script: "{s}px 'Segoe Print', 'Comic Sans MS', cursive",
  sans: "700 {s}px Manrope, ui-sans-serif, sans-serif",
  book: "italic 600 {s}px Palatino, Georgia, serif",
};

const PATTERNS: Exclude<PostPattern, "random">[] = ["stars", "dust", "lines", "rain", "blots", "bars", "sun", "grid", "quiet"];

export function defaultPostcard(): PostcardPrefs {
  return {
    on: true,
    font: "random",
    textMode: "day",
    customText: "",
    image: "speaker",
    customImage: "",
    format: "jpg",
    path: "Yurec_Xuec",
    paper: "random",
    pattern: "random",
    roll: 1,
  };
}

export function cleanPostPath(raw: string) {
  let s = String(raw || "").replace(/\\/g, "/").trim().replace(/^\/+/, "").replace(/\.\./g, "");
  s = s.replace(/[^0-9A-Za-zА-Яа-яЁё _./-]/g, "").replace(/\/+/g, "/").replace(/\/$/, "");
  s = s.slice(0, 80).trim();
  return s || "Yurec_Xuec";
}

export function readPostcard(): PostcardPrefs {
  const d = defaultPostcard();
  try {
    const o = JSON.parse(localStorage.getItem(KEY) || "null") as Partial<PostcardPrefs> | null;
    if (!o || typeof o !== "object") return d;
    if (o.on === false) d.on = false;
    if (POST_FONTS.some((x) => x.id === o.font)) d.font = o.font as PostFont;
    if (o.textMode === "custom" || o.textMode === "day") d.textMode = o.textMode;
    if (typeof o.customText === "string") d.customText = o.customText.slice(0, 280);
    if (o.image === "speaker" || o.image === "yurec" || o.image === "custom" || o.image === "none") d.image = o.image;
    if (typeof o.customImage === "string" && o.customImage.startsWith("data:image/")) d.customImage = o.customImage;
    if (o.format === "png" || o.format === "jpg") d.format = o.format;
    if (typeof o.path === "string") d.path = cleanPostPath(o.path);
    if (POST_PAPERS.some((x) => x.id === o.paper)) d.paper = o.paper as PostPaperId;
    if (POST_PATTERNS.some((x) => x.id === o.pattern)) d.pattern = o.pattern as PostPattern;
    if (typeof o.roll === "number" && o.roll > 0) d.roll = Math.floor(o.roll);
  } catch {
    /* ignore */
  }
  return d;
}

export function writePostcard(patch: Partial<PostcardPrefs>) {
  const next = { ...readPostcard(), ...patch };
  next.path = cleanPostPath(next.path);
  next.customText = String(next.customText || "").slice(0, 280);
  if (!next.customImage.startsWith("data:image/")) next.customImage = "";
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    next.customImage = "";
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }
  return next;
}

export function postcardFolder(prefs = readPostcard()) {
  return "Pictures/" + cleanPostPath(prefs.path);
}

function rngOf(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s = (Math.imul(1664525, s) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function one<T>(list: readonly T[], rng: () => number): T {
  return list[Math.floor(rng() * list.length)]!;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

function wrapLines(ctx: CanvasRenderingContext2D, text: string, max: number) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  function pushChunks(word: string) {
    if (ctx.measureText(word).width <= max) {
      lines.push(word);
      return;
    }
    let cur = "";
    for (const ch of word) {
      const next = cur + ch;
      if (ctx.measureText(next).width > max && cur) {
        lines.push(cur);
        cur = ch;
      } else cur = next;
    }
    if (cur) lines.push(cur);
  }
  for (const w of words) {
    const tryLine = line ? line + " " + w : w;
    if (ctx.measureText(tryLine).width <= max) {
      line = tryLine;
      continue;
    }
    if (line) lines.push(line);
    if (ctx.measureText(w).width <= max) line = w;
    else {
      line = "";
      pushChunks(w);
    }
  }
  if (line) lines.push(line);
  return lines.length ? lines : [text];
}

function paintPattern(ctx: CanvasRenderingContext2D, name: string, ink: string, rng: () => number) {
  ctx.save();
  if (name === "stars") {
    ctx.fillStyle = ink;
    for (let i = 0; i < 42; i++) {
      ctx.globalAlpha = 0.18 + rng() * 0.45;
      const x = 30 + rng() * 1020;
      const y = 30 + rng() * 1380;
      ctx.fillRect(x, y, 2, 9);
      ctx.fillRect(x - 3.5, y + 3.5, 9, 2);
    }
  } else if (name === "dust") {
    ctx.fillStyle = ink;
    for (let i = 0; i < 160; i++) {
      ctx.globalAlpha = 0.05 + rng() * 0.16;
      ctx.beginPath();
      ctx.arc(rng() * 1080, rng() * 1440, 1 + rng() * 2.6, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (name === "lines") {
    ctx.strokeStyle = ink;
    ctx.globalAlpha = 0.14;
    ctx.lineWidth = 1;
    for (let y = 90; y < 1380; y += 34) {
      ctx.beginPath();
      ctx.moveTo(80, y);
      ctx.lineTo(1000, y);
      ctx.stroke();
    }
  } else if (name === "rain") {
    ctx.strokeStyle = ink;
    ctx.globalAlpha = 0.22;
    ctx.lineWidth = 2;
    for (let i = 0; i < 64; i++) {
      const x = rng() * 1080;
      const y = rng() * 1440;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - 16, y + 42);
      ctx.stroke();
    }
  } else if (name === "blots") {
    ctx.fillStyle = ink;
    for (let i = 0; i < 10; i++) {
      ctx.globalAlpha = 0.06 + rng() * 0.08;
      ctx.beginPath();
      ctx.arc(rng() * 1080, rng() * 1440, 24 + rng() * 80, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (name === "bars") {
    ctx.fillStyle = ink;
    ctx.globalAlpha = 0.08;
    for (let i = 0; i < 7; i++) ctx.fillRect(0, rng() * 1440, 1080, 6 + rng() * 16);
  } else if (name === "sun") {
    ctx.fillStyle = ink;
    ctx.globalAlpha = 0.12;
    ctx.beginPath();
    ctx.arc(860, 240, 170, 0, Math.PI * 2);
    ctx.fill();
  } else if (name === "grid") {
    ctx.strokeStyle = ink;
    ctx.globalAlpha = 0.1;
    ctx.lineWidth = 2;
    for (let i = -6; i < 16; i++) {
      ctx.beginPath();
      ctx.moveTo(i * 100, 0);
      ctx.lineTo(i * 100 + 640, 1440);
      ctx.moveTo(i * 100, 1440);
      ctx.lineTo(i * 100 + 640, 0);
      ctx.stroke();
    }
  }
  ctx.restore();
}

function cover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, w: number, h: number) {
  const s = Math.max(w / img.width, h / img.height);
  const dw = img.width * s;
  const dh = img.height * s;
  ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
}

export function paintPostcard(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement | null,
  text: string,
  speaker: string,
  prefs: PostcardPrefs,
  seed: number,
) {
  const rng = rngOf(seed);
  const pool = prefs.paper === "random" ? PAPERS : PAPERS.filter((p) => p.id === prefs.paper);
  const paper = one(pool.length ? pool : PAPERS, rng);
  const pattern = prefs.pattern === "random" ? one(PATTERNS, rng) : prefs.pattern;
  const fontKey = prefs.font === "random" ? one(["serif", "book", "script", "mono", "sans"] as const, rng) : prefs.font;
  const fontTpl = FONT_TPL[fontKey];
  const ang = rng() * Math.PI * 2;
  const g = ctx.createLinearGradient(540 - Math.cos(ang) * 800, 720 - Math.sin(ang) * 900, 540 + Math.cos(ang) * 800, 720 + Math.sin(ang) * 900);
  g.addColorStop(0, paper.a);
  g.addColorStop(1, paper.b);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 1080, 1440);
  paintPattern(ctx, pattern, paper.ink, rng);
  const vig = ctx.createRadialGradient(540, 700, 380, 540, 720, 980);
  vig.addColorStop(0, "rgba(0,0,0,0)");
  vig.addColorStop(1, "rgba(0,0,0,0.22)");
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, 1080, 1440);

  ctx.strokeStyle = paper.mute;
  ctx.lineWidth = 8;
  ctx.strokeRect(40, 40, 1000, 1360);
  if (rng() < 0.55) {
    ctx.lineWidth = 2;
    ctx.strokeRect(58, 58, 964, 1324);
  }

  const photoX = 120;
  const photoW = 840;
  const photoY = 168;
  const photoH = 500;
  const hasImg = !!img;

  if (hasImg && img) {
    ctx.save();
    roundRect(ctx, photoX, photoY, photoW, photoH, 28);
    ctx.clip();
    cover(ctx, img, photoX, photoY, photoW, photoH);
    ctx.restore();
    ctx.strokeStyle = paper.mute;
    ctx.lineWidth = 8;
    roundRect(ctx, photoX, photoY, photoW, photoH, 28);
    ctx.stroke();
  }

  ctx.save();
  ctx.translate(hasImg ? 900 : 880, hasImg ? 230 : 250);
  ctx.rotate(-0.18 + rng() * 0.28);
  ctx.beginPath();
  ctx.arc(0, 0, 78, 0, Math.PI * 2);
  ctx.strokeStyle = paper.stamp;
  ctx.lineWidth = 6;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, 64, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = paper.stamp;
  ctx.textAlign = "center";
  ctx.font = "700 22px Manrope, sans-serif";
  ctx.fillText("ШОТМАН", 0, 4);
  ctx.font = "600 13px Manrope, sans-serif";
  ctx.fillText(one(["НЕВСКИЙ", "ДВОР", "ОРЁТ", "147", String(new Date().getFullYear())], rng), 0, 24);
  ctx.restore();

  const zoneTop = hasImg ? 760 : 300;
  const zoneH = hasImg ? 500 : 900;
  const maxW = 840;
  const quoted = "«" + String(text || "").trim() + "»";
  const maxSize = hasImg ? 72 : 96;
  const minSize = 32;
  let size = maxSize;
  let lines = [quoted];
  let step = size + 12;
  for (size = maxSize; size >= minSize; size -= 2) {
    ctx.font = fontTpl.replace("{s}", String(size));
    lines = wrapLines(ctx, quoted, maxW);
    step = Math.round(size * 1.28);
    if (lines.length <= 7 && lines.length * step <= zoneH - 36) break;
  }
  const block = lines.length * step;
  const plateH = Math.min(zoneH, Math.max(block + 88, hasImg ? 340 : block + 72));
  const plateY = hasImg ? zoneTop : zoneTop + Math.max(0, (zoneH - plateH) / 2);
  ctx.save();
  ctx.globalAlpha = 0.82;
  ctx.fillStyle = paper.a;
  roundRect(ctx, photoX, plateY, photoW, plateH, 28);
  ctx.fill();
  ctx.restore();
  ctx.strokeStyle = paper.mute;
  ctx.globalAlpha = 0.55;
  ctx.lineWidth = 2;
  roundRect(ctx, photoX, plateY, photoW, plateH, 28);
  ctx.stroke();
  ctx.globalAlpha = 1;

  ctx.save();
  roundRect(ctx, photoX, plateY, photoW, plateH, 28);
  ctx.clip();
  ctx.fillStyle = paper.mute;
  ctx.textAlign = "center";
  ctx.font = "600 26px Manrope, sans-serif";
  const who = String(speaker || "Юрец").toUpperCase();
  ctx.fillText(who, 540, plateY + 48);

  ctx.fillStyle = paper.ink;
  ctx.font = fontTpl.replace("{s}", String(size));
  const textTop = plateY + 48 + Math.max(28, (plateH - 48 - block) / 2) + size;
  const textBottom = plateY + plateH - 16;
  lines.forEach((row, i) => {
    const y = textTop + i * step;
    if (y > textBottom) return;
    ctx.fillText(row, 540, y);
  });
  ctx.restore();

  ctx.fillStyle = paper.mute;
  ctx.font = "600 22px Manrope, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("Жизнь Юрца", 96, 1368);
}

function loadImg(src: string | null) {
  return new Promise<HTMLImageElement | null>((resolve) => {
    if (!src) {
      resolve(null);
      return;
    }
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = () => resolve(null);
    el.src = src;
  });
}

export function postcardImageSrc(prefs: PostcardPrefs, speakerId: string) {
  if (prefs.image === "none") return null;
  if (prefs.image === "custom") return prefs.customImage || null;
  if (prefs.image === "yurec") return getCharacter("yurec")?.photo || null;
  return getCharacter(speakerId)?.photo || getCharacter("yurec")?.photo || null;
}

export function postcardBody(prefs: PostcardPrefs, dayText: string) {
  if (prefs.textMode === "custom" && prefs.customText.trim()) return prefs.customText.trim();
  return dayText;
}

export async function shrinkPostcardFile(file: File) {
  const data = await file.arrayBuffer();
  const blob = new Blob([data]);
  const url = URL.createObjectURL(blob);
  try {
    const img = await loadImg(url);
    if (!img) return "";
    const max = 720;
    const s = Math.min(1, max / Math.max(img.width, img.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(img.width * s));
    canvas.height = Math.max(1, Math.round(img.height * s));
    const ctx = canvas.getContext("2d");
    if (!ctx) return "";
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.82);
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function drawPostcardPreview(canvas: HTMLCanvasElement, prefs: PostcardPrefs, sample: { text: string; speaker: string; speakerId: string }) {
  canvas.width = 1080;
  canvas.height = 1440;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const img = await loadImg(postcardImageSrc(prefs, sample.speakerId));
  paintPostcard(ctx, img, postcardBody(prefs, sample.text), sample.speaker, prefs, prefs.roll * 10007 + 3);
}

export async function sharePostcard(opts: { text: string; speaker: string; speakerId: string }) {
  const prefs = readPostcard();
  if (!prefs.on) return { how: "off" as const, folder: postcardFolder(prefs) };
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1440;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Нет холста");
  const body = postcardBody(prefs, opts.text);
  const img = await loadImg(postcardImageSrc(prefs, opts.speakerId));
  paintPostcard(ctx, img, body, opts.speaker, prefs, (Date.now() ^ (prefs.roll * 997)) >>> 0);
  const mime = prefs.format === "png" ? "image/png" : "image/jpeg";
  const ext = prefs.format === "png" ? "png" : "jpg";
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, mime, prefs.format === "png" ? undefined : 0.92));
  if (!blob) throw new Error("Пустая открытка");
  const b64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || "").split(",")[1] || "");
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
  const folder = postcardFolder(prefs);
  const meta = JSON.stringify({ folder: cleanPostPath(prefs.path), ext, mime });
  const native = (window as Window & { YurecNative?: { savePostcard?: (data: string, meta?: string) => string } }).YurecNative;
  let saved = false;
  if (native && typeof native.savePostcard === "function") {
    try {
      saved = native.savePostcard(b64, meta) === "ok";
    } catch {
      try {
        saved = native.savePostcard(b64) === "ok";
      } catch {
        saved = false;
      }
    }
  }
  const file = new File([blob], "shotman-otkrytka." + ext, { type: mime });
  const nav = navigator as Navigator & { canShare?: (data: ShareData) => boolean };
  let shared = false;
  if (!saved && nav.canShare && nav.canShare({ files: [file] }) && navigator.share) {
    try {
      await navigator.share({ files: [file], title: "Открытка со Шотмана", text: body });
      shared = true;
    } catch (e) {
      const name = e instanceof Error ? e.name : "";
      if (name !== "AbortError" && !saved) throw e;
    }
  }
  if (saved) return { how: "gallery" as const, folder };
  if (shared) return { how: "shared" as const, folder };
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "shotman-otkrytka." + ext;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 2000);
  return { how: "file" as const, folder };
}
