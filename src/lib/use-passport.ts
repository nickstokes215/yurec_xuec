import { stories } from "@/data/catalog";
import { CROSSWORDS } from "@/data/crossword";
import { LEVELS, AV_CHAIN, ARK_CHAIN } from "@/data/game";
import { bestScore as svoyaBest, playsCount as svoyaPlays } from "@/lib/svoya-stats";
import { ACH_TOTAL } from "@/data/achievements";
import { formatSpan } from "@/lib/game-stats";

const QUEST_IDS = ["day", "olimpik", "tsar", "mirage", "dinner"] as const;
const AV_LABEL: Record<string, string> = {
  povar: "Повар",
  lysy: "Лысый хер",
  yasher: "Бабка-ящер",
  batya: "Батя",
  sveta: "Светлана",
  kostya: "Костя",
};

function slugs(key: string): string[] {
  try {
    const raw = JSON.parse(localStorage.getItem(key) || "[]") as unknown;
    return Array.isArray(raw) ? raw.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function endings(id: string): string[] {
  if (id === "day") {
    try {
      if (!localStorage.getItem("yurec-game-endings:day")) {
        const old = localStorage.getItem("yurec-game-endings");
        if (old) localStorage.setItem("yurec-game-endings:day", old);
      }
    } catch {
      /* ignore */
    }
  }
  return slugs(`yurec-game-endings:${id}`);
}

function wins(key: string): Record<string, number> {
  try {
    const raw = JSON.parse(localStorage.getItem(key) || "{}") as unknown;
    return raw && typeof raw === "object" ? (raw as Record<string, number>) : {};
  } catch {
    return {};
  }
}

type AvRow = { w?: number; l?: number; best?: number | null };
type AvStats = {
  bestStreak?: number;
  [id: string]: AvRow | number | undefined;
};

function avStats(): AvStats {
  try {
    const raw = JSON.parse(localStorage.getItem("yurec-av-stats") || "{}") as unknown;
    return raw && typeof raw === "object" ? (raw as AvStats) : {};
  } catch {
    return {};
  }
}

function arkStats(): Record<string, { w?: number; l?: number; best?: number | null }> {
  try {
    const raw = JSON.parse(localStorage.getItem("yurec-ark-stats") || "{}") as unknown;
    return raw && typeof raw === "object" ? (raw as Record<string, { w?: number; l?: number; best?: number | null }>) : {};
  } catch {
    return {};
  }
}

export type PassportRow = { k: string; v: string; gold?: boolean };

export type PassportData = {
  rows: PassportRow[];
  lines: string[];
};

export function collectPassport(): PassportData {
  const read = new Set(slugs("yurec-read"));
  const ep = stories.filter((s) => s.kind === "episode");
  const vis = stories.filter((s) => s.kind === "visit");
  const song = stories.filter((s) => s.kind === "song");
  const sms = stories.filter((s) => s.kind === "sms");
  const epN = ep.filter((s) => read.has(s.slug)).length;
  const visN = vis.filter((s) => read.has(s.slug)).length;
  const songN = song.filter((s) => read.has(s.slug)).length;
  const smsN = sms.filter((s) => read.has(s.slug)).length;

  const questDone = QUEST_IDS.filter((id) => endings(id).length > 0).length;
  const questEnds = QUEST_IDS.reduce((n, id) => n + endings(id).length, 0);
  const questMax = LEVELS.reduce((n, l) => n + l.endings.length, 0);

  const cwN = CROSSWORDS.filter((cw) => endings(cw.id).length > 0).length;

  const av = wins("yurec-av-wins");
  const avN = AV_CHAIN.filter((id) => Number(av[id]) > 0).length;
  const ast = avStats();
  let svetaBest: number | null = null;
  const sv = ast.sveta;
  if (sv && typeof sv === "object" && typeof sv.best === "number" && sv.best > 0) svetaBest = sv.best;
  let avBest: { id: string; ms: number } | null = null;
  for (const id of AV_CHAIN) {
    const row = ast[id];
    const b = row && typeof row === "object" && typeof row.best === "number" ? row.best : null;
    if (b != null && (avBest == null || b < avBest.ms)) avBest = { id, ms: b };
  }

  const ark = wins("yurec-ark-wins");
  const arkN = ARK_CHAIN.filter((id) => Number(ark[id]) > 0).length;
  const kst = arkStats();
  let arkBest: number | null = null;
  for (const id of ARK_CHAIN) {
    const b = kst[id]?.best;
    if (typeof b === "number" && (arkBest == null || b < arkBest)) arkBest = b;
  }

  let achN = 0;
  try {
    const raw = JSON.parse(localStorage.getItem("yurec-achievements") || "{}") as Record<string, unknown>;
    achN = Object.keys(raw).filter((k) => raw[k]).length;
  } catch {
    achN = 0;
  }

  let paid = false;
  let dev = false;
  try {
    paid = localStorage.getItem("yurec-license") === "1";
    dev = localStorage.getItem("yurec-dev") === "1";
  } catch {
    /* ignore */
  }

  const rows: PassportRow[] = [
    { k: "Серии", v: `${epN} / ${ep.length}`, gold: epN === ep.length && ep.length > 0 },
    { k: "Песни", v: `${songN} / ${song.length}` },
    { k: "Визиты", v: `${visN} / ${vis.length}` },
    { k: "Бонусы", v: `${smsN} / ${sms.length}` },
    { k: "Квест", v: `уровней ${questDone} / ${QUEST_IDS.length}` },
    { k: "Концовки квеста", v: `${questEnds} / ${questMax}` },
    { k: "Кроссворды", v: `${cwN} / ${CROSSWORDS.length}`, gold: cwN === CROSSWORDS.length },
    { k: "Помойкобол", v: `${avN} / ${AV_CHAIN.length}`, gold: avN === AV_CHAIN.length },
    { k: "Алконоид", v: `${arkN} / ${ARK_CHAIN.length}`, gold: arkN === ARK_CHAIN.length },
    { k: "Юрца игра", v: svoyaPlays() ? `рекорд ${svoyaBest()}` : "ещё не играл", gold: svoyaBest() >= 15000 },
    { k: "Зашквары двора", v: `${achN} / ${ACH_TOTAL}`, gold: achN >= ACH_TOTAL },
    { k: "Лицензия", v: dev ? "Разработчик" : paid ? "Приобретена" : "Гость двора", gold: paid || dev },
  ];

  const lines: string[] = [];
  if (svetaBest != null) lines.push(`Быстрее всего уделал Светку — ${formatSpan(svetaBest)}.`);
  if (avBest && avBest.id !== "sveta") {
    lines.push(`Рекорд Помойкобола: ${AV_LABEL[avBest.id] || avBest.id} за ${formatSpan(avBest.ms)}.`);
  }
  if (arkBest != null) lines.push(`Алконоид, лучший заход — ${formatSpan(arkBest)}.`);
  const svBest = svoyaBest();
  if (svBest > 0) lines.push(`Юрца игра, лучший счёт — ${svBest}.`);
  const streak = typeof ast.bestStreak === "number" ? ast.bestStreak : 0;
  if (streak > 1) lines.push(`Максимальная серия побед в Помойкоболе — ${streak}.`);
  if (!lines.length) lines.push("Двор ещё ничего не запомнил. Читай, бей, разгадывай.");

  return { rows, lines };
}
