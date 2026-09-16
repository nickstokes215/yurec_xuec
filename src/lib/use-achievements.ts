import { useCallback, useSyncExternalStore } from "react";
import { ACHIEVEMENTS, type Achievement } from "@/data/achievements";
import { stories } from "@/data/catalog";
import { CROSSWORDS } from "@/data/crossword";
import { AV_CHAIN, ARK_CHAIN } from "@/data/game";

const KEY = "yurec-achievements";
const EGG_KEY = "yurec-egg";
const QUEST_IDS = ["day", "olimpik", "tsar", "mirage", "dinner"] as const;

const listeners = new Set<() => void>();
let cache: Record<string, number> | undefined;

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

function readSlugs(key: string): string[] {
  try {
    const raw = JSON.parse(localStorage.getItem(key) || "[]") as unknown;
    return Array.isArray(raw) ? raw.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function endingsOf(id: string): string[] {
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

function qualified(id: string): boolean {
  const read = new Set(readSlugs("yurec-read"));
  const av = winsOf("yurec-av-wins");
  const ark = winsOf("yurec-ark-wins");
  switch (id) {
    case "rjumka":
      return read.size >= 1;
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
    case "questall":
      return QUEST_IDS.every((qid) => endingsOf(qid).length > 0);
    case "yasher":
      return Number(av.yasher) > 0;
    case "fsb":
      return Number(av.batya) > 0;
    case "avall":
      return AV_CHAIN.every((id) => Number(av[id]) > 0);
    case "arkall":
      return ARK_CHAIN.every((id) => Number(ark[id]) > 0);
    case "zhilet":
      try {
        return localStorage.getItem("yurec-license") === "1" || localStorage.getItem("yurec-dev") === "1";
      } catch {
        return false;
      }
    case "groza":
      return eggOn();
    default:
      return false;
  }
}

export function isAchieved(id: string) {
  return Boolean(readStore()[id]);
}

export function achievedCount() {
  const store = readStore();
  return ACHIEVEMENTS.reduce((n, a) => n + (store[a.id] ? 1 : 0), 0);
}

export function achievedAt(id: string) {
  const t = readStore()[id];
  return typeof t === "number" && t > 0 ? t : 0;
}

export function markEgg() {
  try {
    localStorage.setItem(EGG_KEY, "1");
  } catch {
    /* ignore */
  }
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
      return ACHIEVEMENTS.map((a) => `${a.id}:${s[a.id] || 0}`).join("|");
    },
    () => "",
  );
  const opened = useCallback((id: string) => isAchieved(id), [stamp]);
  const when = useCallback((id: string) => achievedAt(id), [stamp]);
  return { opened, when, count: achievedCount(), stamp };
}
