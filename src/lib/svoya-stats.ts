const RUN_KEY = "yurec-svoya-run";
const USED_KEY = "yurec-svoya-used";
const HALL_KEY = "yurec-svoya-hall";
const PLAYS_KEY = "yurec-svoya-plays";
const FEATHER_KEY = "yurec-svoya-feathers";
const HALL_CAP = 10;
const PRIZE_IDS = ["shotman", "gosha", "sveta", "lysy", "batya"] as const;
export type SvoyaPrizeId = (typeof PRIZE_IDS)[number];

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
    .slice(0, HALL_CAP);
}

export function readFeathers(): SvoyaPrizeId[] {
  const list = readJson<unknown>(FEATHER_KEY, []);
  if (!Array.isArray(list)) return [];
  return PRIZE_IDS.filter((id) => list.includes(id));
}

export function isMaster(): boolean {
  return readFeathers().length >= PRIZE_IDS.length;
}

export function rememberFeather(id: string) {
  if (!PRIZE_IDS.includes(id as SvoyaPrizeId)) return;
  const cur = readFeathers();
  if (cur.includes(id as SvoyaPrizeId)) return;
  try {
    localStorage.setItem(FEATHER_KEY, JSON.stringify(cur.concat(id as SvoyaPrizeId)));
  } catch {
    /* ignore */
  }
  emitSvoya();
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
    localStorage.removeItem(FEATHER_KEY);
  } catch {
    /* ignore */
  }
  emitSvoya();
}

export { RUN_KEY, USED_KEY, HALL_KEY, PLAYS_KEY, FEATHER_KEY, HALL_CAP };
