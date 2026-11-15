import { useSyncExternalStore } from "react";

/** Размер и стиль текста рассказа. Те же ключи, что в www/app.js. */
export const FONT_KEY = "yurec-font";
const SRC_KEY = "yurec-font-src";
const FACE_KEY = "yurec-font-face";
export const FONT_MIN = 8;
export const FONT_MAX = 32;
export const FONT_DEFAULT = 19;

export type FontSource = "slider" | "keys" | "reset";

export const FONT_FACES = [
  { id: "default", label: "Стандартный", stack: '"Noto Serif", Georgia, serif' },
  { id: "system", label: "Системный", stack: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif' },
  { id: "roboto", label: "Roboto", stack: 'Roboto, "Noto Sans", Arial, sans-serif' },
  { id: "arial", label: "Arial", stack: "Arial, Helvetica, sans-serif" },
  { id: "georgia", label: "Georgia", stack: "Georgia, serif" },
  { id: "times", label: "Times", stack: '"Times New Roman", Times, serif' },
  { id: "verdana", label: "Verdana", stack: "Verdana, Geneva, sans-serif" },
  { id: "trebuchet", label: "Trebuchet", stack: '"Trebuchet MS", sans-serif' },
  { id: "courier", label: "Courier", stack: '"Courier New", Courier, monospace' },
  { id: "palatino", label: "Palatino", stack: 'Palatino, "Palatino Linotype", "Book Antiqua", serif' },
] as const;

export type FontFaceId = (typeof FONT_FACES)[number]["id"];

const listeners = new Set<() => void>();
let size = FONT_DEFAULT;
let source: FontSource = "reset";
let face: FontFaceId = "default";

function clamp(n: number) {
  if (!Number.isFinite(n)) return FONT_DEFAULT;
  return Math.max(FONT_MIN, Math.min(FONT_MAX, Math.round(n)));
}

export function fontFaceById(id?: string) {
  return FONT_FACES.find((f) => f.id === id) || FONT_FACES[0];
}

function readStored() {
  try {
    const n = Number(localStorage.getItem(FONT_KEY));
    size = n >= FONT_MIN && n <= FONT_MAX ? Math.round(n) : FONT_DEFAULT;
    const s = localStorage.getItem(SRC_KEY);
    source = s === "slider" || s === "keys" || s === "reset" ? s : "reset";
    face = fontFaceById(localStorage.getItem(FACE_KEY) || "").id;
  } catch {
    size = FONT_DEFAULT;
    source = "reset";
    face = "default";
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

export function setReaderFace(id: string) {
  face = fontFaceById(id).id;
  try {
    localStorage.setItem(FACE_KEY, face);
  } catch {
    /* память закрыта */
  }
  emit();
}

export function useReaderFont() {
  const value = useSyncExternalStore(subscribe, () => size, () => FONT_DEFAULT);
  const src = useSyncExternalStore(subscribe, () => source, () => "reset" as FontSource);
  const faceId = useSyncExternalStore(subscribe, () => face, () => "default" as FontFaceId);
  return { size: value, source: src, face: faceId };
}