import quotesJson from "./quotes.json";

export type QuoteClip = {
  file: string;
  src: string;
  speaker: string;
  title: string;
};

/** Автор — всё до « - » в имени файла. После тире — название нарезки. */
function parseQuoteFile(file: string) {
  const base = file.replace(/\.mp3$/i, "");
  const dash = base.indexOf(" - ");
  if (dash === -1) return { speaker: base.trim(), title: "" };
  return {
    speaker: base.slice(0, dash).trim(),
    title: base.slice(dash + 3).trim(),
  };
}

export const QUOTES: QuoteClip[] = (quotesJson as { file: string; src: string }[]).map((q) => ({
  file: q.file,
  src: q.src,
  ...parseQuoteFile(q.file),
}));

export function shuffleQuoteOrder(count: number, avoidFirst?: number) {
  const ids = Array.from({ length: count }, (_, i) => i);
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = ids[i];
    ids[i] = ids[j];
    ids[j] = tmp;
  }
  if (avoidFirst != null && ids.length > 1 && ids[0] === avoidFirst) {
    const tmp = ids[0];
    ids[0] = ids[1];
    ids[1] = tmp;
  }
  return ids;
}

export function formatQuoteTime(sec: number) {
  if (!Number.isFinite(sec) || sec < 0) return "0:00";
  const s = Math.floor(sec);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return m + ":" + String(r).padStart(2, "0");
}
