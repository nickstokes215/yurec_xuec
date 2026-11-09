import { useCallback, useSyncExternalStore } from "react";
import { ACHIEVEMENTS, type Achievement } from "@/data/achievements";
import { stories } from "@/data/catalog";
import { CROSSWORDS } from "@/data/crossword";
import { AV_CHAIN, ARK_CHAIN } from "@/data/game";
import { playsCount } from "@/lib/svoya-stats";
import { isYardHoliday } from "@/lib/yard-life";

const KEY = "yurec-achievements";
const EGG_KEY = "yurec-egg";
const META_KEY = "yurec-ach-meta";
const PEEK_KEY = "yurec-ach-peek";
const QUEST_IDS = ["day", "olimpik", "tsar", "mirage", "dinner"] as const;

const listeners = new Set<() => void>();
let cache: Record<string, number> | undefined;
let metaCache: AchMeta | undefined;

type AchMeta = {
  f: Record<string, number>;
  quotes: number;
  chars: Record<string, number>;
  seen: string[];
  replay: Record<string, number>;
};

type AchBase = {
  v: 1;
  read: string[];
  books: string[];
  av: Record<string, number>;
  ark: Record<string, number>;
  ends: Record<string, string[]>;
  plays: number;
  loss: number;
  egg: boolean;
  paid: boolean;
  theme: string;
  icon: string;
  sound: string;
  chat: boolean;
};

const BASE_KEY = "yurec-ach-base";
const HOLD_KEY = "yurec-ach-hold";

function emit() {
  for (const fn of listeners) fn();
}

function pingProgress() {
  try {
    window.dispatchEvent(new Event("yurec-progress"));
  } catch {
    /* ignore */
  }
}

function readStore(): Record<string, number> {
  if (cache) return cache;
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "{}") as unknown;
    cache = raw && typeof raw === "object" ? (raw as Record<string, number>) : {};
  } catch {
    cache = {};
  }
  return cache;
}

function writeStore(next: Record<string, number>) {
  cache = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
  emit();
}

function emptyMeta(): AchMeta {
  return { f: {}, quotes: 0, chars: {}, seen: [], replay: {} };
}

function readMeta(): AchMeta {
  if (metaCache) return metaCache;
  try {
    const raw = JSON.parse(localStorage.getItem(META_KEY) || "{}") as Partial<AchMeta>;
    metaCache = {
      f: raw.f && typeof raw.f === "object" ? raw.f : {},
      quotes: Number(raw.quotes) || 0,
      chars: raw.chars && typeof raw.chars === "object" ? raw.chars : {},
      seen: Array.isArray(raw.seen) ? raw.seen.filter((x): x is string => typeof x === "string") : [],
      replay: raw.replay && typeof raw.replay === "object" ? raw.replay : {},
    };
  } catch {
    metaCache = emptyMeta();
  }
  return metaCache;
}

function writeMeta(next: AchMeta) {
  metaCache = next;
  try {
    localStorage.setItem(META_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

export function noteFlag(id: string) {
  const m = readMeta();
  if (m.f[id]) {
    evaluateAchievements();
    return;
  }
  m.f = { ...m.f, [id]: Date.now() };
  writeMeta(m);
  evaluateAchievements();
}

export function noteQuotePlay() {
  const m = readMeta();
  m.quotes = (m.quotes || 0) + 1;
  writeMeta(m);
  evaluateAchievements();
}

export function noteCharOpen(id: string) {
  if (!id) return;
  const m = readMeta();
  if (!m.chars[id]) m.chars = { ...m.chars, [id]: Date.now() };
  writeMeta(m);
  evaluateAchievements();
}

function normPath(path: string) {
  const p = (path || "/").split("?")[0] || "/";
  if (p.length > 1 && p.endsWith("/")) return p.slice(0, -1);
  return p;
}

export function noteVisit(path: string) {
  const p = normPath(path);
  try {
    const hold = sessionStorage.getItem(HOLD_KEY) || "";
    if (hold && hold === p) return;
    if (hold) sessionStorage.removeItem(HOLD_KEY);
  } catch {
    /* ignore */
  }
  if (p === "/characters/map" || p.startsWith("/characters/map/")) noteFlag("map");
  else if (p === "/citats" || p.startsWith("/citats/")) noteFlag("citats");
  else if (p === "/settings" || p.startsWith("/settings/")) noteFlag("settings");
  else if (p === "/passport" || p.startsWith("/passport/")) noteFlag("passport");
  else if (p === "/donate" || p.startsWith("/donate/")) noteFlag("donate");
  else if (p === "/changelog" || p.startsWith("/changelog/")) noteFlag("journal");
  else if (p === "/offline" || p.startsWith("/offline/")) noteFlag("offline");
  else if (p === "/zashkvary" || p.startsWith("/zashkvary/")) noteFlag("zash");
  else if (p.startsWith("/press/") || p === "/videos/press" || p.startsWith("/videos/press")) noteFlag("press");
  else if (p.startsWith("/characters/") && p !== "/characters/" && p !== "/characters") {
    const id = decodeURIComponent(p.slice("/characters/".length).split("/")[0] || "");
    if (id && id !== "map") noteCharOpen(id);
  }
}

function readSlugs(key: string): string[] {
  try {
    const raw = JSON.parse(localStorage.getItem(key) || "[]") as unknown;
    return Array.isArray(raw) ? raw.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function endingsRaw(id: string): string[] {
  if (id === "day") {
    try {
      if (!localStorage.getItem("yurec-game-endings:day")) {
        const old = localStorage.getItem("yurec-game-endings");
        if (old) localStorage.setItem("yurec-game-endings:day", old);
      }
    } catch {
      /* ignore */
    }
  }
  return readSlugs(`yurec-game-endings:${id}`);
}

function readBase(): AchBase | null {
  try {
    const raw = JSON.parse(localStorage.getItem(BASE_KEY) || "null") as AchBase | null;
    if (!raw || raw.v !== 1) return null;
    return raw;
  } catch {
    return null;
  }
}

function endingsOf(id: string): string[] {
  const cur = endingsRaw(id);
  const base = readBase();
  if (!base) return cur;
  const prev = new Set((base.ends && base.ends[id]) || []);
  const fresh = cur.filter((s) => !prev.has(s));
  const extra = Number(readMeta().replay[id] || 0);
  for (let i = 0; i < extra; i++) fresh.push("~" + i);
  return fresh;
}

function liveWins(key: string, prev: Record<string, number> | undefined): Record<string, number> {
  const cur = winsOf(key);
  if (!prev) return cur;
  const out: Record<string, number> = {};
  for (const id of Object.keys(cur)) {
    const d = Number(cur[id]) - Number(prev[id] || 0);
    if (d > 0) out[id] = d;
  }
  return out;
}

function lossCount(): number {
  let n = 0;
  try {
    const av = JSON.parse(localStorage.getItem("yurec-av-stats") || "{}") as Record<string, { l?: number }>;
    const ark = JSON.parse(localStorage.getItem("yurec-ark-stats") || "{}") as Record<string, { l?: number }>;
    for (const row of Object.values(av)) n += Number(row && row.l) || 0;
    for (const row of Object.values(ark)) n += Number(row && row.l) || 0;
  } catch {
    /* ignore */
  }
  return n;
}

/** Повтор уже известной концовки после продажи медалей. */
export function noteReplay(bucket: string) {
  if (!bucket || !readBase()) return;
  const m = readMeta();
  m.replay = { ...m.replay, [bucket]: (Number(m.replay[bucket]) || 0) + 1 };
  writeMeta(m);
  evaluateAchievements();
}

/** Рассказ открыт заново. Старая полка в зачёт не идёт. */
export function noteSeen(slug: string) {
  if (!slug || !readBase()) return;
  const m = readMeta();
  if (m.seen.includes(slug)) return;
  m.seen = m.seen.concat(slug);
  writeMeta(m);
  evaluateAchievements();
}

/** Жест, который уже был до продажи: тема, яйцо, ключ. */
export function noteRedo(id: string) {
  if (!id || !readBase()) return;
  noteFlag(id);
}

function winsOf(key: string): Record<string, number> {
  try {
    const raw = JSON.parse(localStorage.getItem(key) || "{}") as unknown;
    return raw && typeof raw === "object" ? (raw as Record<string, number>) : {};
  } catch {
    return {};
  }
}

function eggOn() {
  try {
    return localStorage.getItem(EGG_KEY) === "1";
  } catch {
    return false;
  }
}

function flag(id: string) {
  return Boolean(readMeta().f[id]);
}

function lostAny(): boolean {
  try {
    const av = JSON.parse(localStorage.getItem("yurec-av-stats") || "{}") as Record<string, { l?: number }>;
    const ark = JSON.parse(localStorage.getItem("yurec-ark-stats") || "{}") as Record<string, { l?: number }>;
    for (const row of Object.values(av)) if (row && typeof row === "object" && Number(row.l) > 0) return true;
    for (const row of Object.values(ark)) if (row && typeof row === "object" && Number(row.l) > 0) return true;
  } catch {
    /* ignore */
  }
  return false;
}

function chatHasUser(): boolean {
  try {
    const raw = localStorage.getItem("yurec-ai-log") || sessionStorage.getItem("yurec-ai-log") || "[]";
    const arr = JSON.parse(raw) as { role?: string }[];
    return Array.isArray(arr) && arr.some((m) => m && m.role === "user");
  } catch {
    return false;
  }
}

function qualified(id: string): boolean {
  const base = readBase();
  const meta = readMeta();
  const read = new Set(base ? meta.seen : readSlugs("yurec-read"));
  const av = liveWins("yurec-av-wins", base ? base.av : undefined);
  const ark = liveWins("yurec-ark-wins", base ? base.ark : undefined);
  switch (id) {
    case "rjumka":
      return read.size >= 1;
    case "pyat":
      return read.size >= 5;
    case "desyat":
      return read.size >= 10;
    case "polka":
      return read.size >= 25;
    case "serii":
      return stories.filter((s) => s.kind === "episode").every((s) => read.has(s.slug));
    case "vizity":
      return stories.filter((s) => s.kind === "visit").every((s) => read.has(s.slug));
    case "kvest":
      return QUEST_IDS.some((qid) => endingsOf(qid).length > 0);
    case "revel":
      return endingsOf("crossword").length > 0;
    case "kiosk":
      return CROSSWORDS.every((cw) => endingsOf(cw.id).length > 0);
    case "povar":
      return Number(av[AV_CHAIN[0]]) > 0;
    case "sveta":
      return Number(av.sveta) > 0;
    case "zerkalo":
      return Number(av.kostya) > 0;
    case "alk":
      return ARK_CHAIN.some((lid) => Number(ark[lid]) > 0);
    case "drob":
      return Number(ark.batya) > 0;
    case "pesni": {
      const list = stories.filter((s) => s.kind === "song");
      return list.length > 0 && list.every((s) => read.has(s.slug));
    }
    case "bonus": {
      const list = stories.filter((s) => s.kind === "sms");
      return list.length > 0 && list.every((s) => read.has(s.slug));
    }
    case "kniga":
      return stories.length > 0 && stories.every((s) => read.has(s.slug));
    case "questall":
      return QUEST_IDS.every((qid) => endingsOf(qid).length > 0);
    case "yasher":
      return Number(av.yasher) > 0;
    case "fsb":
      return Number(av.batya) > 0;
    case "avall":
      return AV_CHAIN.every((xid) => Number(av[xid]) > 0);
    case "arkall":
      return ARK_CHAIN.every((xid) => Number(ark[xid]) > 0);
    case "zhilet":
      if (base) return flag("relic");
      try {
        return localStorage.getItem("yurec-license") === "1" || localStorage.getItem("yurec-dev") === "1";
      } catch {
        return false;
      }
    case "groza":
      if (base) return flag("reegg");
      return eggOn();
    case "karta":
      return flag("map");
    case "golos":
      return meta.quotes >= 1;
    case "hor":
      return meta.quotes >= 10;
    case "citata":
      return flag("citats");
    case "zakladka": {
      const books = readSlugs("yurec-bookmarks");
      if (!base) return books.length >= 1;
      const prev = new Set(base.books);
      return books.some((s) => !prev.has(s));
    }
    case "geroi":
      return Object.keys(meta.chars).length >= 5;
    case "sosed":
      return Boolean(meta.chars.sosed);
    case "nlo_vid":
      return Boolean(meta.chars.nlo);
    case "granata":
      return Boolean(meta.chars.granata);
    case "lupy":
      return flag("zoom");
    case "gazeta":
      return flag("press");
    case "passport":
      return flag("passport");
    case "zhurnal":
      return flag("journal");
    case "nastroika":
      return flag("settings");
    case "tema":
      return flag("theme");
    case "chernota":
      if (base) return flag("reblack");
      try {
        return localStorage.getItem("yurec-theme") === "black";
      } catch {
        return false;
      }
    case "uzhas":
      if (base) return flag("rehorror");
      try {
        return localStorage.getItem("yurec-app-icon") === "horror";
      } catch {
        return false;
      }
    case "tikhii":
      if (base) return flag("requiet");
      try {
        return localStorage.getItem("yurec-sound") === "0";
      } catch {
        return false;
      }
    case "spravka":
      return flag("backup");
    case "chatok":
      if (base) return flag("chat");
      return flag("chat") || chatHasUser();
    case "donate":
      return flag("donate");
    case "offlayn":
      return flag("offline");
    case "noch": {
      const h = new Date().getHours();
      if (h >= 0 && h < 5) {
        if (!meta.f.noch) {
          meta.f = { ...meta.f, noch: Date.now() };
          writeMeta(meta);
        }
        return true;
      }
      return flag("noch");
    }
    case "sezon": {
      if (isYardHoliday()) {
        const m = readMeta();
        if (!m.f.sezon) {
          m.f = { ...m.f, sezon: Date.now() };
          writeMeta(m);
        }
        return true;
      }
      return flag("sezon");
    }
    case "dvornik":
      return flag("zash");
    case "ekskurs":
      return flag("tour");
    case "proigral":
      if (base) return lossCount() > base.loss;
      return lostAny();
    case "svoya":
      try {
        if (base) return playsCount() > base.plays;
        return playsCount() >= 1;
      } catch {
        return false;
      }
    default:
      return false;
  }
}

export function isAchPeek(): boolean {
  try {
    return sessionStorage.getItem(PEEK_KEY) === "1";
  } catch {
    return false;
  }
}

export function setAchPeek(on: boolean) {
  try {
    if (on) sessionStorage.setItem(PEEK_KEY, "1");
    else sessionStorage.removeItem(PEEK_KEY);
  } catch {
    /* ignore */
  }
  emit();
  pingProgress();
}

export function isAchieved(id: string) {
  if (isAchPeek()) return true;
  return Boolean(readStore()[id]);
}

export function achievedCount() {
  if (isAchPeek()) return ACHIEVEMENTS.length;
  const store = readStore();
  return ACHIEVEMENTS.reduce((n, a) => n + (store[a.id] ? 1 : 0), 0);
}

export function achievedAt(id: string) {
  const t = readStore()[id];
  if (typeof t === "number" && t > 0) return t;
  return 0;
}

export function markEgg() {
  try {
    localStorage.setItem(EGG_KEY, "1");
  } catch {
    /* ignore */
  }
  if (readBase()) noteRedo("reegg");
  else {
    pingProgress();
    evaluateAchievements();
  }
}

function numMap(key: string): Record<string, number> {
  const raw = winsOf(key);
  const out: Record<string, number> = {};
  for (const id of Object.keys(raw)) out[id] = Number(raw[id]) || 0;
  return out;
}

/** Продажа всего списка. Старые дела остаются, медали за них не возвращаются. */
export function wipeAchievements() {
  const ends: Record<string, string[]> = {};
  const buckets = ["day", "olimpik", "tsar", "mirage", "dinner", "crossword", ...CROSSWORDS.map((c) => c.id)];
  for (const id of buckets) ends[id] = endingsRaw(id);
  let theme = "";
  let icon = "";
  let sound = "";
  let paid = false;
  try {
    theme = localStorage.getItem("yurec-theme") || "";
    icon = localStorage.getItem("yurec-app-icon") || "";
    sound = localStorage.getItem("yurec-sound") || "";
    paid = localStorage.getItem("yurec-license") === "1" || localStorage.getItem("yurec-dev") === "1";
  } catch {
    /* ignore */
  }
  const base: AchBase = {
    v: 1,
    read: readSlugs("yurec-read"),
    books: readSlugs("yurec-bookmarks"),
    av: numMap("yurec-av-wins"),
    ark: numMap("yurec-ark-wins"),
    ends,
    plays: playsCount(),
    loss: lossCount(),
    egg: eggOn(),
    paid,
    theme,
    icon,
    sound,
    chat: chatHasUser() || Boolean(readMeta().f.chat),
  };
  try {
    localStorage.setItem(BASE_KEY, JSON.stringify(base));
    localStorage.setItem(KEY, "{}");
    localStorage.setItem(META_KEY, JSON.stringify(emptyMeta()));
  } catch {
    /* ignore */
  }
  cache = {};
  metaCache = emptyMeta();
  try {
    sessionStorage.setItem(HOLD_KEY, normPath(window.location.pathname));
    sessionStorage.removeItem(PEEK_KEY);
  } catch {
    /* ignore */
  }
  emit();
  pingProgress();
}

export function evaluateAchievements(): Achievement[] {
  const store = { ...readStore() };
  const fresh: Achievement[] = [];
  for (const a of ACHIEVEMENTS) {
    if (store[a.id]) continue;
    if (!qualified(a.id)) continue;
    store[a.id] = Date.now();
    fresh.push(a);
  }
  if (!fresh.length) return [];
  writeStore(store);
  try {
    window.dispatchEvent(new CustomEvent("yurec-ach-unlock", { detail: fresh }));
  } catch {
    /* ignore */
  }
  return fresh;
}

export function useAchievements() {
  const stamp = useSyncExternalStore(
    (fn) => {
      listeners.add(fn);
      return () => {
        listeners.delete(fn);
      };
    },
    () => {
      const s = readStore();
      const peek = isAchPeek() ? "1" : "0";
      return peek + "|" + ACHIEVEMENTS.map((a) => `${a.id}:${s[a.id] || 0}`).join("|");
    },
    () => "",
  );
  const opened = useCallback((id: string) => isAchieved(id), [stamp]);
  const when = useCallback((id: string) => achievedAt(id), [stamp]);
  return { opened, when, count: achievedCount(), stamp };
}
