const KEY = "yurec-tour";
const listeners = new Set<() => void>();

function emit() {
  for (const fn of listeners) fn();
}

export function tourSeen(): boolean {
  try {
    return localStorage.getItem(KEY) === "1";
  } catch {
    return true;
  }
}

export function markTourSeen() {
  try {
    localStorage.setItem(KEY, "1");
  } catch {
    /* ignore */
  }
  emit();
}

export function shouldAutoTour(): boolean {
  if (tourSeen()) return false;
  try {
    const last = localStorage.getItem("yurec-last");
    if (last) return false;
    const read = JSON.parse(localStorage.getItem("yurec-read") || "[]") as unknown;
    if (Array.isArray(read) && read.length) return false;
    const av = localStorage.getItem("yurec-av-wins");
    if (av && av !== "{}") return false;
    const license = localStorage.getItem("yurec-license");
    if (license === "1") return false;
  } catch {
    return false;
  }
  return true;
}

export function startTour() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
  emit();
  try {
    window.dispatchEvent(new Event("yurec-tour-start"));
  } catch {
    /* ignore */
  }
}

export function useTourSeen() {
  return tourSeen();
}
