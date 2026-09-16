import { CROSSWORDS } from "@/data/crossword";
import { type GameSave } from "@/data/game";
import { clearCrosswordTimer, clearQuestTimer } from "@/lib/game-stats";
import { useCallback, useMemo, useSyncExternalStore } from "react";

const LEGACY_SAVE = "yurec-game-save";
const LEGACY_END = "yurec-game-endings";

function saveKey(id: string) {
  return `yurec-game-save:${id}`;
}
function endKey(id: string) {
  return `yurec-game-endings:${id}`;
}

const QUEST_IDS = ["day", "olimpik", "tsar", "mirage", "dinner"] as const;
const GAME_IDS = [...QUEST_IDS, ...CROSSWORDS.map((c) => c.id)];

const saveCache: Record<string, GameSave | null | undefined> = {};
const endingsCache: Record<string, string[] | undefined> = {};
const listeners = new Set<() => void>();

function emit() {
  for (const fn of listeners) fn();
  try {
    window.dispatchEvent(new Event("yurec-endings"));
    window.dispatchEvent(new Event("yurec-progress"));
  } catch {
    /* ignore */
  }
}

function migrateDay() {
  try {
    if (!localStorage.getItem(saveKey("day"))) {
      const old = localStorage.getItem(LEGACY_SAVE);
      if (old) localStorage.setItem(saveKey("day"), old);
    }
    if (!localStorage.getItem(endKey("day"))) {
      const old = localStorage.getItem(LEGACY_END);
      if (old) localStorage.setItem(endKey("day"), old);
    }
  } catch {
    /* ignore */
  }
}

function readSave(id: string): GameSave | null {
  if (id === "day") migrateDay();
  if (saveCache[id] !== undefined) return saveCache[id] ?? null;
  try {
    const raw = JSON.parse(localStorage.getItem(saveKey(id)) || "null");
    if (raw && typeof raw.node === "string" && raw.stats) {
      saveCache[id] = {
        node: raw.node,
        stats: raw.stats,
        steps: Number(raw.steps) || 0,
      };
      return saveCache[id] ?? null;
    }
  } catch {
    /* ignore */
  }
  saveCache[id] = null;
  return null;
}

const EMPTY_ENDS: string[] = [];

function readEndings(id: string): string[] {
  if (id === "day") migrateDay();
  if (endingsCache[id] !== undefined) return endingsCache[id] as string[];
  try {
    const raw = JSON.parse(localStorage.getItem(endKey(id)) || "[]");
    endingsCache[id] = Array.isArray(raw) ? raw.filter((x) => typeof x === "string") : [];
  } catch {
    endingsCache[id] = [];
  }
  return endingsCache[id] as string[];
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function writeGameSave(id: string, save: GameSave | null) {
  saveCache[id] = save;
  try {
    if (save) localStorage.setItem(saveKey(id), JSON.stringify(save));
    else localStorage.removeItem(saveKey(id));
  } catch {
    /* ignore */
  }
  emit();
}

export function recordEnding(id: string, endId: string) {
  const cur = readEndings(id);
  if (cur.includes(endId)) return;
  endingsCache[id] = cur.concat(endId);
  try {
    localStorage.setItem(endKey(id), JSON.stringify(endingsCache[id]));
  } catch {
    /* ignore */
  }
  emit();
}

export function unlockAllEndings(id: string, ids: string[]) {
  endingsCache[id] = Array.from(new Set(ids));
  try {
    localStorage.setItem(endKey(id), JSON.stringify(endingsCache[id]));
  } catch {
    /* ignore */
  }
  emit();
}

export function resetGameProgress(id?: string) {
  const ids = id ? [id] : [...GAME_IDS];
  for (const n of ids) {
    saveCache[n] = null;
    endingsCache[n] = [];
    try {
      localStorage.removeItem(saveKey(n));
      localStorage.removeItem(endKey(n));
      clearQuestTimer(n);
      clearCrosswordTimer(n);
      if (n === "day") {
        localStorage.removeItem(LEGACY_SAVE);
        localStorage.removeItem(LEGACY_END);
      }
      if (n.startsWith("crossword")) {
        localStorage.removeItem(`yurec-cw:${n}:fill`);
        localStorage.removeItem(`yurec-cw:${n}:secret`);
        localStorage.removeItem(`yurec-cw:v2:${n}:fill`);
        localStorage.removeItem(`yurec-cw:v2:${n}:secret`);
        if (n === "crossword") {
          localStorage.removeItem("yurec-crossword:fill");
          localStorage.removeItem("yurec-crossword:secret");
        }
      }
    } catch {
      /* ignore */
    }
  }
  emit();
}

export function useGameProgress(levelId: string) {
  const save = useSyncExternalStore(
    subscribe,
    () => readSave(levelId),
    () => null,
  );
  const endings = useSyncExternalStore(
    subscribe,
    () => readEndings(levelId),
    () => EMPTY_ENDS,
  );
  const clear = useCallback(() => writeGameSave(levelId, null), [levelId]);
  const reset = useCallback(() => resetGameProgress(levelId), [levelId]);
  return { save, endings, clear, reset };
}

let endingsStamp = "";
function readAllEndingsStamp() {
  const next = GAME_IDS.map((id) => `${id}:${readEndings(id).join(",")}`).join("|");
  if (next === endingsStamp) return endingsStamp;
  endingsStamp = next;
  return endingsStamp;
}

export function useAllEndings(): Record<string, string[]> {
  const stamp = useSyncExternalStore(subscribe, readAllEndingsStamp, () => "");
  return useMemo(() => {
    const out: Record<string, string[]> = {};
    for (const id of GAME_IDS) out[id] = readEndings(id);
    return out;
  }, [stamp]);
}
