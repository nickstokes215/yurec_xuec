import { useCallback, useSyncExternalStore } from "react";
import { charactersForGroup, type Character } from "@/data/catalog";

const KEY = "yurec-char-order";
const listeners = new Set<() => void>();
let cache: Record<string, string[]> | undefined;

function emit() {
  cache = undefined;
  for (const fn of listeners) fn();
  try {
    window.dispatchEvent(new Event("yurec-char-order"));
  } catch {
    /* ignore */
  }
}

function readAll(): Record<string, string[]> {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : {};
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      const out: Record<string, string[]> = {};
      for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
        if (Array.isArray(v)) out[k] = v.filter((x): x is string => typeof x === "string");
      }
      cache = out;
      return out;
    }
  } catch {
    /* ignore */
  }
  cache = {};
  return cache;
}

function writeAll(map: Record<string, string[]>) {
  cache = map;
  try {
    if (Object.keys(map).length === 0) localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
  emit();
}

export function mergeCharOrder(saved: string[] | undefined, factory: string[]): string[] {
  const factorySet = new Set(factory);
  const seen = new Set<string>();
  const kept: string[] = [];
  if (saved) {
    for (const id of saved) {
      if (factorySet.has(id) && !seen.has(id)) {
        kept.push(id);
        seen.add(id);
      }
    }
  }
  const result = kept.slice();
  for (let i = 0; i < factory.length; i++) {
    const id = factory[i];
    if (seen.has(id)) continue;
    let insertAt = result.length;
    for (let j = i + 1; j < factory.length; j++) {
      const idx = result.indexOf(factory[j]);
      if (idx !== -1) {
        insertAt = idx;
        break;
      }
    }
    result.splice(insertAt, 0, id);
    seen.add(id);
  }
  return result;
}

export function orderedCharacters(group: string): Character[] {
  const factory = charactersForGroup(group);
  const saved = readAll()[group];
  if (!saved || !saved.length) return factory;
  const map = new Map(factory.map((c) => [c.id, c]));
  return mergeCharOrder(saved, factory.map((c) => c.id))
    .map((id) => map.get(id))
    .filter((c): c is Character => Boolean(c));
}

export function setGroupOrder(group: string, ids: string[]) {
  const all = { ...readAll() };
  all[group] = ids.slice();
  writeAll(all);
}

export function resetCharOrder() {
  cache = {};
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
  emit();
}

export function useCharOrder() {
  const stamp = useSyncExternalStore(
    (fn) => {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    () => JSON.stringify(readAll()),
    () => "",
  );
  const custom = stamp !== "{}" && stamp !== "";
  const reset = useCallback(() => resetCharOrder(), []);
  return { custom, reset, stamp };
}
