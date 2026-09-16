import citatsJson from "./citats.json";

export type Citat = {
  id: string;
  text: string;
  speaker: string;
  speakerId: string;
  slug: string;
};

export const CITATS: Citat[] = citatsJson as Citat[];
export const CITATS_COVER = "/covers/citats.jpg?v=1.53.8";
export const CITATS_PITCH =
  "Сто пятьдесят зашкварных фраз двора. Ранние серии, поздние, песни. Нажми цитату — откроется рассказ, откуда ор.";

let sessionCitat: Citat | null = null;

export function citatOfDay(_now = Date.now()): Citat {
  if (sessionCitat) return sessionCitat;
  let last = "";
  try {
    last = localStorage.getItem("yurec-citat-last") || "";
  } catch {
    last = "";
  }
  const pool = CITATS.filter((c) => c.id !== last);
  const src = pool.length ? pool : CITATS;
  sessionCitat = src[Math.floor(Math.random() * src.length)]!;
  try {
    localStorage.setItem("yurec-citat-last", sessionCitat.id);
  } catch {
    /* ignore */
  }
  return sessionCitat;
}
