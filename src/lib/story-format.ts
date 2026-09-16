export function foldFind(s: string) {
  return s.toLowerCase().replaceAll("ё", "е").replaceAll("Ё", "е");
}

export function findSpans(text: string, q: string): [number, number][] {
  const fq = foldFind(q.trim());
  if (!fq) return [];
  const ft = foldFind(text);
  const out: [number, number][] = [];
  let i = 0;
  while (i <= ft.length - fq.length) {
    const p = ft.indexOf(fq, i);
    if (p < 0) break;
    out.push([p, p + fq.length]);
    i = p + fq.length;
  }
  return out;
}

const PLACES = [
  "строительный гипермаркет «Олимпик»",
  "строительного гипермаркета «Олимпик»",
  "строительный магазин «Олимпик»",
  "строительного магазина «Олимпик»",
  "строймага «Олимпик»",
  "строймаге «Олимпик»",
  "улица Шотмана",
  "улице Шотмана",
  "улицы Шотмана",
  "улицу Шотмана",
  "переулок Челиева",
  "переулке Челиева",
  "переулка Челиева",
  "Искровский проспект",
  "Искровском проспекте",
  "Искровского проспекта",
  "Невский район",
  "Невском районе",
  "Невского района",
  "Санкт-Петербург",
  "Центр занятости",
  "Центре занятости",
  "Центра занятости",
  "Красного & Белого",
  "Красное & Белое",
  "ларёк Анжелы",
  "ларьке Анжелы",
  "ларька Анжелы",
  "шавермечная",
  "шавермечную",
  "шавермечной",
  "Максидоме",
  "Максидома",
  "Максидом",
  "Пятёрочке",
  "Пятёрочки",
  "Пятёрочку",
  "Пятёрочка",
  "«Олимпик»",
  '"Олимпик"',
  "Олимпика",
  "Олимпике",
  "Олимпик",
  "Дикси",
  "МФЦ",
  "«Лента»",
  '"Лента"',
  "«Магнит»",
  '"Магнит"',
  "Магните",
  "Шотмана",
  "Челиева",
  "Ленты",
].sort((a, b) => b.length - a.length);

const LETTER = /[A-Za-zА-Яа-яЁё0-9]/;

function letterAt(s: string, i: number) {
  if (i < 0 || i >= s.length) return false;
  return LETTER.test(s[i]);
}

function collectRanges(text: string, needles: string[]): [number, number][] {
  const used = new Uint8Array(text.length);
  const out: [number, number][] = [];
  for (const needle of needles) {
    let i = 0;
    while (i <= text.length - needle.length) {
      const p = text.indexOf(needle, i);
      if (p < 0) break;
      let ok = !letterAt(text, p - 1) && !letterAt(text, p + needle.length);
      if (ok) {
        for (let k = p; k < p + needle.length; k++) {
          if (used[k]) {
            ok = false;
            break;
          }
        }
      }
      if (ok) {
        for (let k = p; k < p + needle.length; k++) used[k] = 1;
        out.push([p, p + needle.length]);
      }
      i = p + 1;
    }
  }
  out.sort((a, b) => a[0] - b[0]);
  return out;
}

function findQuotes(text: string): [number, number][] {
  const out: [number, number][] = [];
  const re = /«[^»]{1,500}»|"[^"]{1,500}"/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m[0].length >= 3) out.push([m.index, m.index + m[0].length]);
  }
  return out;
}

const SCENE_HEAD =
  /^(Санкт-Петербург|Петербург,|\d{4} год|Январ|Феврал|Март |Март:|Апрел|Май \d|Июн|Июл|Август|Сентябр|Октябр|Ноябр|Декабр|Раннее |Поздн|Глубокая ночь|Ночь |Утро |Вечер|День |Через |Спустя |На следующий|Лебединый трип|Максидом как|Финал сцены|Шутка|Эпилог:|Версия \d|Мысли Юрца|Одноразовый анекдот|Рабочие будни|Условия работы|Туалет и еда|Разговоры с Женей|Любовь в пещерном|Середина декабря|Ноябрь-декабрь|ЧЕРНОВИК|📰|Склад |Погрузочная зона|Строительный гипермаркет)/;

export function isSceneHead(p: string) {
  const s = p.trim();
  if (!s || s.includes("\n") || s.length > 92 || s.length < 4 || s.startsWith("—")) return false;
  if (/сказала|хмыкнула|вопит/.test(s)) return false;
  if (SCENE_HEAD.test(s)) return true;
  if (/^(Январ|Феврал|Март|Апрел|Май|Июн|Июл|Август|Сентябр|Октябр|Ноябр|Декабр).{0,40}: /.test(s) && s.length < 85) {
    return true;
  }
  if (/^\d{4} год: /.test(s)) return true;
  return false;
}

export type RichPart = {
  text: string;
  italic: boolean;
  bold: boolean;
  hit: boolean;
  current: boolean;
  find?: number;
};

export function richParts(text: string, query: string, from: number, current: number): RichPart[] {
  const marks = findSpans(text, query);
  const quotes = findQuotes(text);
  const places = collectRanges(text, PLACES);
  const bounds = new Set<number>([0, text.length]);
  for (const [a, b] of marks) {
    bounds.add(a);
    bounds.add(b);
  }
  for (const [a, b] of quotes) {
    bounds.add(a);
    bounds.add(b);
  }
  for (const [a, b] of places) {
    bounds.add(a);
    bounds.add(b);
  }
  const pts = [...bounds].sort((a, b) => a - b);
  const parts: RichPart[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i];
    const b = pts[i + 1];
    if (a >= b) continue;
    const slice = text.slice(a, b);
    if (!slice) continue;
    const italic = quotes.some(([x, y]) => a >= x && b <= y);
    const bold = places.some(([x, y]) => a >= x && b <= y);
    let mi = -1;
    for (let k = 0; k < marks.length; k++) {
      if (a >= marks[k][0] && b <= marks[k][1]) {
        mi = k;
        break;
      }
    }
    parts.push({
      text: slice,
      italic,
      bold,
      hit: mi >= 0,
      current: mi >= 0 && from + mi === current,
      find: mi >= 0 ? from + mi : undefined,
    });
  }
  return parts;
}
