import { useSyncExternalStore } from "react";

/** Размер текста рассказа. Тот же ключ, что в www/app.js. */
export const FONT_KEY = "yurec-font";
const SRC_KEY = "yurec-font-src";
export const FONT_MIN = 8;
export const FONT_MAX = 32;
export const FONT_DEFAULT = 19;

export type FontSource = "slider" | "keys" | "reset";

const listeners = new Set<() => void>();
let size = FONT_DEFAULT;
let source: FontSource = "reset";

function clamp(n: number) {
  if (!Number.isFinite(n)) return FONT_DEFAULT;
  return Math.max(FONT_MIN, Math.min(FONT_MAX, Math.round(n)));
}

function readStored() {
  try {
    const n = Number(localStorage.getItem(FONT_KEY));
    size = n >= FONT_MIN && n <= FONT_MAX ? Math.round(n) : FONT_DEFAULT;
    const s = localStorage.getItem(SRC_KEY);
    source = s === "slider" || s === "keys" || s === "reset" ? s : "reset";
  } catch {
    size = FONT_DEFAULT;
    source = "reset";
  }
}

readStored();

function emit() {
  for (const fn of listeners) fn();
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function setReaderFont(n: number, src: FontSource) {
  size = src === "reset" ? FONT_DEFAULT : clamp(n);
  source = src;
  try {
    localStorage.setItem(FONT_KEY, String(size));
    localStorage.setItem(SRC_KEY, src);
  } catch {
    /* память закрыта */
  }
  emit();
}

export function useReaderFont() {
  const value = useSyncExternalStore(subscribe, () => size, () => FONT_DEFAULT);
  const src = useSyncExternalStore(subscribe, () => source, () => "reset" as FontSource);
  return { size: value, source: src };
}
