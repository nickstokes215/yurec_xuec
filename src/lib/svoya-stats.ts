const RUN_KEY = "yurec-svoya-run";
const USED_KEY = "yurec-svoya-used";
const HALL_KEY = "yurec-svoya-hall";
const PLAYS_KEY = "yurec-svoya-plays";

export type SvoyaHall = { name: string; score: number; at: number };

export function emitSvoya() {
  try {
    window.dispatchEvent(new Event("yurec-svoya"));
    window.dispatchEvent(new Event("yurec-progress"));
  } catch {
    /* ignore */
  }
}

export function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function readHall(): SvoyaHall[] {
  const list = readJson<unknown>(HALL_KEY, []);
  if (!Array.isArray(list)) return [];
  return list
    .filter((x): x is SvoyaHall => !!x && typeof x === "object" && typeof (x as SvoyaHall).score === "number")
    .sort((a, b) => b.score - a.score || a.at - b.at)
    .slice(0, 5);
}

export function bestScore(): number {
  return readHall()[0]?.score ?? 0;
}

export function playsCount(): number {
  try {
    return Number(localStorage.getItem(PLAYS_KEY) || "0") || 0;
  } catch {
    return 0;
  }
}

export function wipeSvoya() {
  try {
    localStorage.removeItem(RUN_KEY);
    localStorage.removeItem(USED_KEY);
    localStorage.removeItem(HALL_KEY);
    localStorage.removeItem(PLAYS_KEY);
  } catch {
    /* ignore */
  }
  emitSvoya();
}

export { RUN_KEY, USED_KEY, HALL_KEY, PLAYS_KEY };
