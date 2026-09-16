import { useCallback, useSyncExternalStore } from "react";

const KEY = "yurec-game-order";
const FACTORY = ["quest", "crosswords", "av", "ark", "svoya"] as const;
export type GameHubId = (typeof FACTORY)[number];

const listeners = new Set<() => void>();
let cache: string[] | undefined;

function emit() {
  cache = undefined;
  for (const fn of listeners) fn();
  try {
    window.dispatchEvent(new Event("yurec-game-order"));
  } catch {
    /* ignore */
  }
}

function readSaved(): string[] {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : null;
    if (Array.isArray(parsed)) {
      cache = parsed.filter((x): x is string => typeof x === "string");
      return cache;
    }
  } catch {
    /* ignore */
  }
  cache = [];
  return cache;
}

function mergeOrder(saved: string[], factory: readonly string[]): string[] {
  const factorySet = new Set(factory);
  const seen = new Set<string>();
  const kept: string[] = [];
  for (const id of saved) {
    if (factorySet.has(id) && !seen.has(id)) {
      kept.push(id);
      seen.add(id);
    }
  }
  for (const id of factory) {
    if (!seen.has(id)) kept.push(id);
  }
  return kept;
}

export function orderedGameIds(): GameHubId[] {
  const saved = readSaved();
  return mergeOrder(saved, FACTORY) as GameHubId[];
}

export function setGameOrder(ids: string[]) {
  const next = mergeOrder(ids, FACTORY);
  const same = FACTORY.length === next.length && FACTORY.every((id, i) => id === next[i]);
  try {
    if (same) localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
  cache = same ? [] : next;
  emit();
}

export function resetGameOrder() {
  cache = [];
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
  emit();
}

export function hasCustomGameOrder(): boolean {
  const saved = readSaved();
  if (!saved.length) return false;
  const merged = mergeOrder(saved, FACTORY);
  return merged.some((id, i) => id !== FACTORY[i]);
}

export function useGameOrder() {
  const stamp = useSyncExternalStore(
    (fn) => {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    () => JSON.stringify(orderedGameIds()) + (hasCustomGameOrder() ? "|1" : "|0"),
    () => FACTORY.join(","),
  );
  const ids = orderedGameIds();
  const custom = hasCustomGameOrder();
  const reset = useCallback(() => resetGameOrder(), []);
  const set = useCallback((next: string[]) => setGameOrder(next), []);
  return { ids, custom, reset, set, stamp };
}
