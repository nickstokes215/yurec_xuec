import { ROUND_CATS, ROUND_VALS, SVOYA_CATS, svoyaById, svoyaPool, svoyaReady, type SvoyaQ } from "@/data/svoya";
import { svoyaStory } from "@/data/svoya-meta";
import {
  emitSvoya,
  readHall,
  readJson,
  HALL_KEY,
  PLAYS_KEY,
  RUN_KEY,
  USED_KEY,
  type SvoyaHall,
} from "@/lib/svoya-stats";

export type SvoyaCell = {
  cat: string;
  t: number;
  v: number;
  qid: string;
  ord?: number[];
  done?: boolean;
  ok?: boolean;
};

export type SvoyaRound = {
  n: number;
  cats: string[];
  cells: SvoyaCell[];
  values: number[];
};

export type SvoyaFinal = {
  cat: string;
  qid: string;
  bet: number;
  ord?: number[];
  done?: boolean;
  ok?: boolean;
};

export type SvoyaRun = {
  v: 3;
  round: number;
  score: number;
  right: number;
  wrong: number;
  started: number;
  usedCats: string[];
  rounds: SvoyaRound[];
  final?: SvoyaFinal | null;
  skippedFinal?: boolean;
  story?: string;
  ended?: boolean;
};

export type { SvoyaHall };
export { readHall, bestScore, playsCount, wipeSvoya } from "@/lib/svoya-stats";
export { svoyaById };

function shuffle<T>(list: T[]): T[] {
  const out = list.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

function shuffleOrd(): number[] {
  return shuffle([0, 1, 2, 3]);
}

function readUsed(): string[] {
  const list = readJson<unknown>(USED_KEY, []);
  return Array.isArray(list) ? list.filter((x): x is string => typeof x === "string") : [];
}

function writeUsed(ids: string[]) {
  try {
    localStorage.setItem(USED_KEY, JSON.stringify(ids.slice(-10000)));
  } catch {
    /* ignore */
  }
}

function pickQ(cat: string, tier: number, used: Set<string>, bag: string[]): string {
  const pool = svoyaPool(cat, tier);
  const free = pool.filter((q) => !used.has(q.id));
  const pickFrom = free.length ? free : pool.slice();
  if (!free.length && bag.length) {
    const pos = new Map(bag.map((id, i) => [id, i]));
    pickFrom.sort((a, b) => (pos.get(a.id) ?? -1) - (pos.get(b.id) ?? -1));
    const pick = pickFrom[0];
    if (pick) {
      used.add(pick.id);
      bag.push(pick.id);
      return pick.id;
    }
  }
  const pick = pickFrom[Math.floor(Math.random() * pickFrom.length)] || pool[0];
  if (!pick) return `${cat}:${tier}:00`;
  used.add(pick.id);
  bag.push(pick.id);
  return pick.id;
}

export function readRun(): SvoyaRun | null {
  const run = readJson<SvoyaRun | null>(RUN_KEY, null);
  if (!run || run.v !== 3 || !Array.isArray(run.rounds)) return null;
  return run;
}

export function writeRun(run: SvoyaRun | null) {
  try {
    if (!run) localStorage.removeItem(RUN_KEY);
    else localStorage.setItem(RUN_KEY, JSON.stringify(run));
  } catch {
    /* ignore */
  }
  emitSvoya();
}

export function currentRound(run = readRun()): SvoyaRound | null {
  if (!run) return null;
  if (run.round < 1 || run.round > 3) return run.rounds[run.rounds.length - 1] || null;
  return run.rounds[run.round - 1] || null;
}

export function roundOpen(run = readRun()): boolean {
  const r = currentRound(run);
  return !!r && r.cells.some((c) => !c.done);
}

function dealRound(n: number, usedCats: string[], used: Set<string>, bag: string[]): SvoyaRound {
  const values = ROUND_VALS[n - 1] || ROUND_VALS[0]!;
  const nCats = ROUND_CATS[n - 1] || 5;
  const left = SVOYA_CATS.map((c) => c.id).filter((id) => !usedCats.includes(id));
  const pool = left.length >= nCats ? left : SVOYA_CATS.map((c) => c.id);
  const cats = shuffle(pool).slice(0, nCats);
  const cells: SvoyaCell[] = [];
  for (const cat of cats) {
    for (let t = 1; t <= 5; t++) {
      cells.push({ cat, t, v: values[t - 1] || t * 100, qid: pickQ(cat, t, used, bag), ord: shuffleOrd() });
    }
  }
  return { n, cats, cells, values };
}

export function dealRun(): SvoyaRun | null {
  if (!svoyaReady()) return null;
  const used = new Set(readUsed());
  const bag = [...readUsed()];
  const r1 = dealRound(1, [], used, bag);
  writeUsed(bag);
  const run: SvoyaRun = {
    v: 3,
    round: 1,
    score: 0,
    right: 0,
    wrong: 0,
    started: Date.now(),
    usedCats: r1.cats.slice(),
    rounds: [r1],
    final: null,
  };
  writeRun(run);
  return run;
}

export function advanceRound(): SvoyaRun | null {
  const run = readRun();
  if (!run) return null;
  const cur = currentRound(run);
  if (!cur || cur.cells.some((c) => !c.done)) return run;
  if (run.round === 3) {
    if (run.score <= 0) {
      run.skippedFinal = true;
      run.ended = true;
      run.story = svoyaStory(run.score, run.started + run.score);
      writeRun(run);
      return run;
    }
    const used = new Set(readUsed());
    const bag = [...readUsed()];
    const left = SVOYA_CATS.map((c) => c.id).filter((id) => !run.usedCats.includes(id));
    const cat = (left.length ? shuffle(left) : shuffle(SVOYA_CATS.map((c) => c.id)))[0]!;
    run.final = { cat, qid: pickQ(cat, 5, used, bag), bet: 0, ord: shuffleOrd() };
    run.round = 4;
    writeUsed(bag);
    writeRun(run);
    return run;
  }
  if (run.round < 3) {
    const used = new Set(readUsed());
    const bag = [...readUsed()];
    const next = dealRound(run.round + 1, run.usedCats, used, bag);
    run.rounds.push(next);
    run.usedCats = run.usedCats.concat(next.cats);
    run.round += 1;
    writeUsed(bag);
    writeRun(run);
  }
  return run;
}

export function answerCell(qid: string, pick: number): { run: SvoyaRun; q: SvoyaQ; correct: boolean; delta: number } | null {
  const run = readRun();
  const q = svoyaById(qid);
  if (!run || !q) return null;
  if (run.round === 4 && run.final && run.final.qid === qid) {
    if (run.final.done) return { run, q, correct: false, delta: 0 };
    const correct = pick === q.ok;
    const bet = Math.max(0, Math.min(run.final.bet, Math.max(0, run.score)));
    const delta = correct ? bet : -bet;
    run.final.done = true;
    run.final.ok = correct;
    run.score += delta;
    if (correct) run.right += 1;
    else run.wrong += 1;
    run.ended = true;
    run.story = svoyaStory(run.score, run.started + run.score);
    writeRun(run);
    return { run, q, correct, delta };
  }
  const round = currentRound(run);
  const cell = round?.cells.find((c) => c.qid === qid);
  if (!cell || cell.done) return { run, q, correct: false, delta: 0 };
  const correct = pick === q.ok;
  cell.done = true;
  cell.ok = correct;
  const delta = correct ? cell.v : -cell.v;
  run.score += delta;
  if (correct) run.right += 1;
  else run.wrong += 1;
  writeRun(run);
  return { run, q, correct, delta };
}

export function setFinalBet(bet: number): SvoyaRun | null {
  const run = readRun();
  if (!run?.final || run.final.done) return run;
  const max = Math.max(0, run.score);
  run.final.bet = Math.max(0, Math.min(max, Math.floor(bet) || 0));
  writeRun(run);
  return run;
}

export function qualifies(score: number): boolean {
  const hall = readHall();
  if (hall.length < 5) return true;
  return score > (hall[hall.length - 1]?.score ?? -Infinity);
}

export function submitHall(name: string, score: number): SvoyaHall[] {
  const hall = readHall();
  hall.push({ name: (name || "Юрец").trim().slice(0, 16) || "Юрец", score, at: Date.now() });
  hall.sort((a, b) => b.score - a.score || a.at - b.at);
  const next = hall.slice(0, 5);
  try {
    localStorage.setItem(HALL_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
  emitSvoya();
  return next;
}

export function bumpPlays() {
  try {
    const n = Number(localStorage.getItem(PLAYS_KEY) || "0") + 1;
    localStorage.setItem(PLAYS_KEY, String(n));
  } catch {
    /* ignore */
  }
  emitSvoya();
}

export function clearRun() {
  writeRun(null);
}

export function cellOrd(qid: string, run = readRun()): number[] {
  if (!run) return [0, 1, 2, 3];
  if (run.round === 4 && run.final?.qid === qid) return run.final.ord || [0, 1, 2, 3];
  const cell = currentRound(run)?.cells.find((c) => c.qid === qid);
  return cell?.ord || [0, 1, 2, 3];
}
