import data from "./crossword.json";

export type CrosswordKey = { r: number; c: number };

export type CrosswordWord = {
  n: number;
  dir: "across" | "down";
  r: number;
  c: number;
  answer: string;
  clue: string;
};

export type CrosswordData = {
  id: string;
  shortTitle: string;
  title: string;
  kicker: string;
  cover: string;
  pitch: string;
  rows: number;
  cols: number;
  secret: string;
  endId: string;
  secretHint: string;
  winText: string;
  submitLabel: string;
  keys: CrosswordKey[];
  words: CrosswordWord[];
};

export const CROSSWORDS = data as CrosswordData[];

export function getCrossword(id: string) {
  return CROSSWORDS.find((c) => c.id === id);
}

export type GridCell = {
  ch: string;
  n?: number;
  key: boolean;
};

export function isKeyCell(data: CrosswordData, r: number, c: number) {
  return data.keys.some((k) => k.r === r && k.c === c);
}

export function buildCrosswordGrid(data: CrosswordData) {
  const g: (GridCell | null)[][] = Array.from({ length: data.rows }, () =>
    Array.from({ length: data.cols }, () => null),
  );
  for (const w of data.words) {
    for (let i = 0; i < w.answer.length; i++) {
      const r = w.dir === "down" ? w.r + i : w.r;
      const c = w.dir === "across" ? w.c + i : w.c;
      const prev = g[r][c];
      g[r][c] = {
        ch: w.answer[i],
        n: i === 0 ? w.n : prev?.n,
        key: isKeyCell(data, r, c),
      };
    }
  }
  return g;
}

export function cellKey(r: number, c: number) {
  return `${r},${c}`;
}

export function fillStoreKey(id: string) {
  return `yurec-cw:v2:${id}:fill`;
}

export function secretStoreKey(id: string) {
  return `yurec-cw:${id}:secret`;
}
