import { useCallback, useSyncExternalStore } from "react";
import { matchPaid } from "@/lib/secret-gate";

const KEY = "yurec-license";
const CELEBRATE = "yurec-celebrate";

let cache: boolean | undefined;
const listeners = new Set<() => void>();

function emit() {
  for (const fn of listeners) fn();
}

function readPaid(): boolean {
  if (cache !== undefined) return cache;
  try {
    cache = localStorage.getItem(KEY) === "1";
  } catch {
    cache = false;
  }
  return cache;
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

function later(fn: () => void) {
  window.setTimeout(() => {
    try {
      fn();
    } catch {
      /* ignore */
    }
  }, 0);
}

export function unlockPaid(input: string): boolean {
  const ok = matchPaid(input);
  if (!ok) return false;
  cache = true;
  try {
    localStorage.setItem(KEY, "1");
    localStorage.setItem(CELEBRATE, "1");
  } catch {
    /* ignore */
  }
  // Не размонтировать поле ввода в том же тике, что и keydown/input —
  // на Android WebView это нативный краш.
  later(emit);
  return true;
}

export function lockPaid() {
  cache = false;
  try {
    localStorage.removeItem(KEY);
    localStorage.removeItem(CELEBRATE);
    localStorage.removeItem("yurec-dev");
  } catch {
    /* ignore */
  }
  later(() => {
    emit();
    try {
      window.dispatchEvent(new Event("yurec-license-changed"));
      window.dispatchEvent(new Event("yurec-dev-changed"));
    } catch {
      /* ignore */
    }
  });
}

export function consumeCelebrate(): boolean {
  try {
    if (localStorage.getItem(CELEBRATE) === "1") {
      localStorage.removeItem(CELEBRATE);
      return true;
    }
  } catch {
    /* ignore */
  }
  return false;
}

export function grantPaidSilent() {
  cache = true;
  try {
    localStorage.setItem(KEY, "1");
  } catch {
    /* ignore */
  }
  later(emit);
}

const getServerPaid = () => false;

export function usePaid() {
  const paid = useSyncExternalStore(subscribe, readPaid, getServerPaid);
  const unlock = useCallback((value: string) => unlockPaid(value), []);
  const lock = useCallback(() => lockPaid(), []);
  return { paid, unlock, lock };
}
