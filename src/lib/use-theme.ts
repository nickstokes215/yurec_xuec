import { useCallback, useEffect, useSyncExternalStore } from "react";

export type ThemeChoice = "light" | "dark" | "black" | "system";
export type ThemeResolved = "light" | "dark" | "black";

const KEY = "yurec-theme";
const listeners = new Set<() => void>();
let cache: ThemeChoice | undefined;

function emit() {
  for (const fn of listeners) fn();
}

function readChoice(): ThemeChoice {
  if (cache) return cache;
  try {
    const v = localStorage.getItem(KEY);
    if (v === "light" || v === "dark" || v === "black" || v === "system") cache = v;
    else cache = "dark";
  } catch {
    cache = "dark";
  }
  return cache;
}

export function resolveTheme(choice: ThemeChoice = readChoice()): ThemeResolved {
  if (choice === "system") {
    try {
      return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
    } catch {
      return "dark";
    }
  }
  return choice;
}

export function applyTheme(choice?: ThemeChoice) {
  const resolved = resolveTheme(choice ?? readChoice());
  const root = document.documentElement;
  root.setAttribute("data-theme", resolved);
  root.style.colorScheme = resolved === "light" ? "light" : "dark";
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute("content", resolved === "light" ? "#e7dfd0" : resolved === "black" ? "#000000" : "#0b0b0c");
  }
}

export function setTheme(next: ThemeChoice) {
  cache = next;
  try {
    localStorage.setItem(KEY, next);
  } catch {
    /* ignore */
  }
  applyTheme(next);
  emit();
}

export function cycleLightDark() {
  const now = resolveTheme();
  setTheme(now === "light" ? "dark" : "light");
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function useTheme() {
  const choice = useSyncExternalStore(subscribe, readChoice, () => "dark" as ThemeChoice);
  const resolved = resolveTheme(choice);
  useEffect(() => {
    applyTheme(choice);
    if (choice !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: light)");
    const on = () => applyTheme("system");
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [choice]);
  const set = useCallback((v: ThemeChoice) => setTheme(v), []);
  const cycle = useCallback(() => cycleLightDark(), []);
  return { choice, resolved, set, cycle };
}
