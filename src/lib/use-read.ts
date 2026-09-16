import { useSyncExternalStore } from "react";

const KEY = "yurec-read";
const SKIP = "yurec-read-skip";

const listeners = new Set<() => void>();

function emit() {
  for (const fn of listeners) fn();
  try {
    window.dispatchEvent(new Event("yurec-progress"));
  } catch {
    /* ignore */
  }
}

function readArr(key: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function writeArr(key: string, list: string[]) {
  try {
    localStorage.setItem(key, JSON.stringify(list));
  } catch {
    /* ignore */
  }
}

export function isStoryRead(slug: string): boolean {
  return readArr(KEY).includes(slug);
}

export function canAutoMark(slug: string): boolean {
  return !readArr(SKIP).includes(slug);
}

export function markStoryRead(slug: string) {
  if (!slug) return;
  const read = readArr(KEY);
  const skip = readArr(SKIP).filter((s) => s !== slug);
  writeArr(SKIP, skip);
  if (!read.includes(slug)) writeArr(KEY, [slug, ...read]);
  emit();
}

export function unmarkStoryRead(slug: string) {
  if (!slug) return;
  writeArr(KEY, readArr(KEY).filter((s) => s !== slug));
  const skip = readArr(SKIP);
  if (!skip.includes(slug)) writeArr(SKIP, [slug, ...skip]);
  emit();
}

export function toggleStoryRead(slug: string): boolean {
  if (isStoryRead(slug)) {
    unmarkStoryRead(slug);
    return false;
  }
  markStoryRead(slug);
  return true;
}

export function clearAllRead() {
  writeArr(KEY, []);
  writeArr(SKIP, []);
  emit();
}

export function readCount() {
  return readArr(KEY).length;
}

export function useReadCount() {
  return useSyncExternalStore(
    (fn) => {
      listeners.add(fn);
      return () => {
        listeners.delete(fn);
      };
    },
    readCount,
    () => 0,
  );
}

export function useStoryRead(slug: string) {
  return useSyncExternalStore(
    (fn) => {
      listeners.add(fn);
      return () => {
        listeners.delete(fn);
      };
    },
    () => isStoryRead(slug),
    () => false,
  );
}
