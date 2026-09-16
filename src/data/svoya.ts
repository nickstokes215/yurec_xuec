export type SvoyaQ = {
  id: string;
  cat: string;
  t: number;
  q: string;
  a: string[];
  ok: number;
};

export type SvoyaCat = { id: string; title: string };

type Raw = {
  categories?: SvoyaCat[];
  roundValues?: number[][];
  questions: [string, string, number, string, string[], number][] | SvoyaQ[];
};

export const SVOYA_CATS: SvoyaCat[] = [
  { id: "shotman", title: "ШОТМАН" },
  { id: "treshka", title: "ТРЁШКА" },
  { id: "olimpik", title: "ОЛИМПИК" },
  { id: "maxidom", title: "МАКСИДОМ" },
  { id: "sveta", title: "СВЕТКА" },
  { id: "batya", title: "БАТЯ" },
  { id: "zina", title: "ЗИНАИДА" },
  { id: "gosha", title: "ГОША" },
  { id: "kostya", title: "КОСТЯ" },
  { id: "tolik", title: "ТОЛИК" },
  { id: "fly", title: "FLY" },
  { id: "sensor", title: "СЕНСОР" },
  { id: "gazeta", title: "ГАЗЕТА" },
  { id: "shaverma", title: "ШАВЕРМА" },
  { id: "vodka", title: "ВОДКА" },
  { id: "srok", title: "ПРОСРОЧКА" },
  { id: "kupola", title: "КУПОЛА" },
  { id: "nlo", title: "НЛО" },
  { id: "arsenal", title: "АРСЕНАЛ" },
  { id: "apteka", title: "АПТЕКА" },
  { id: "bonch", title: "БОНЧ" },
  { id: "gosuslugi", title: "ГОСУСЛУГИ" },
  { id: "pomoyka", title: "ПОМОЙКА" },
  { id: "lysy", title: "ЛЫСЫЙ" },
  { id: "canon", title: "КАНОН" },
];

export const ROUND_VALS: number[][] = [
  [100, 200, 300, 400, 500],
  [200, 400, 600, 800, 1000],
  [300, 600, 900, 1200, 1500],
];

export const ROUND_CATS = [3, 4, 5] as const;

function unpack(row: Raw["questions"][number]): SvoyaQ {
  if (Array.isArray(row)) {
    return { id: row[0], cat: row[1], t: row[2], q: row[3], a: row[4], ok: row[5] };
  }
  return row;
}

const ID_MAP = new Map<string, SvoyaQ>();
const TIER_MAP = new Map<string, SvoyaQ[]>();
let loaded = false;
let inflight: Promise<void> | null = null;

function index(list: SvoyaQ[]) {
  ID_MAP.clear();
  TIER_MAP.clear();
  for (const q of list) {
    ID_MAP.set(q.id, q);
    const k = `${q.cat}:${q.t}`;
    const arr = TIER_MAP.get(k);
    if (arr) arr.push(q);
    else TIER_MAP.set(k, [q]);
  }
  loaded = true;
}

export function svoyaReady() {
  return loaded;
}

export function ensureSvoya(): Promise<void> {
  if (loaded) return Promise.resolve();
  if (typeof window === "undefined") return Promise.resolve();
  if (inflight) return inflight;
  inflight = fetch("/game/svoya-q.json")
    .then((r) => {
      if (!r.ok) throw new Error("svoya pack");
      return r.json() as Promise<Raw>;
    })
    .then((d) => {
      index((d.questions || []).map(unpack));
    })
    .catch((err) => {
      inflight = null;
      throw err;
    });
  return inflight;
}

export function svoyaById(id: string): SvoyaQ | undefined {
  return ID_MAP.get(id);
}

export function svoyaPool(cat: string, tier: number): SvoyaQ[] {
  return TIER_MAP.get(`${cat}:${tier}`) || [];
}

export function catTitle(id: string): string {
  return SVOYA_CATS.find((c) => c.id === id)?.title || id;
}
