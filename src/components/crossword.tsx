import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  buildCrosswordGrid,
  cellKey,
  fillStoreKey,
  getCrossword,
  secretStoreKey,
  type CrosswordData,
  type CrosswordWord,
} from "@/data/crossword";
import { recordEnding, resetGameProgress, useGameProgress } from "@/lib/use-game";
import { openZoom } from "@/lib/zoom";
import { cn } from "@/lib/utils";
import { playFireworks } from "@/components/fireworks";
import {
  clearCrosswordTimer,
  crosswordFlavor,
  finishCrosswordTimer,
  readCrosswordLast,
  startCrosswordTimer,
} from "@/lib/game-stats";

import { matchCheat } from "@/lib/secret-gate";

const LEGACY_FILL = "yurec-crossword:fill";
const LEGACY_SECRET = "yurec-crossword:secret";
const KB = ["ЙЦУКЕНГШЩЗХ", "ФЫВАПРОЛДЖЭ", "ЯЧСМИТЬБЮЁ"];

type Fill = Record<string, string>;

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

function migrateLegacy(id: string) {
  if (id !== "crossword") return;
  try {
    if (!localStorage.getItem(fillStoreKey(id))) {
      const old = localStorage.getItem(LEGACY_FILL);
      if (old) localStorage.setItem(fillStoreKey(id), old);
    }
    if (!localStorage.getItem(secretStoreKey(id))) {
      const old = localStorage.getItem(LEGACY_SECRET);
      if (old) localStorage.setItem(secretStoreKey(id), old);
    }
  } catch {
    /* ignore */
  }
}

function emptySecret(data: CrosswordData) {
  return Array.from({ length: data.secret.length }, () => "");
}

function nextCell(r: number, c: number, dir: "across" | "down", grid: ReturnType<typeof buildCrosswordGrid>) {
  if (dir === "across") {
    if (grid[r]?.[c + 1]) return { r, c: c + 1 };
  } else if (grid[r + 1]?.[c]) return { r: r + 1, c };
  return { r, c };
}

function wordsAt(data: CrosswordData, r: number, c: number) {
  return data.words.filter((w) => {
    if (w.dir === "across") return w.r === r && c >= w.c && c < w.c + w.answer.length;
    return w.c === c && r >= w.r && r < w.r + w.answer.length;
  });
}

function wordFilled(w: CrosswordWord, fill: Fill) {
  return w.answer.split("").every((_, i) => {
    const r = w.dir === "down" ? w.r + i : w.r;
    const c = w.dir === "across" ? w.c + i : w.c;
    return fill[cellKey(r, c)] === w.answer[i];
  });
}

function goldLetters(data: CrosswordData, fill: Fill) {
  const letters = data.keys.map((k) => fill[cellKey(k.r, k.c)] || "");
  if (letters.some((ch) => !ch)) return null;
  return letters.slice().sort((a, b) => a.localeCompare(b, "ru"));
}

function wipeCrosswordStorage(id: string) {
  try {
    localStorage.removeItem(fillStoreKey(id));
    localStorage.removeItem(secretStoreKey(id));
    clearCrosswordTimer(id);
    if (id === "crossword") {
      localStorage.removeItem(LEGACY_FILL);
      localStorage.removeItem(LEGACY_SECRET);
    }
  } catch {
    /* ignore */
  }
  resetGameProgress(id);
}

export function CrosswordPage({ id }: { id: string }) {
  const data = getCrossword(id);
  const { endings } = useGameProgress(id);
  const solved = Boolean(data && endings.includes(data.endId));
  const [phase, setPhase] = useState<"title" | "play" | "win">(solved ? "win" : "title");
  const [wipe, setWipe] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    migrateLegacy(id);
    setPhase(solved ? "win" : "title");
    setWipe(false);
    setTick((n) => n + 1);
  }, [id, solved]);

  if (!data) {
    return (
      <main className="px-4 py-10 text-center">
        <p className="text-sm text-muted">Кроссворд потерялся на Шотмана.</p>
        <Link to="/game" className="mt-4 inline-flex h-12 items-center rounded-xl bg-elevated px-4 text-sm">
          К играм
        </Link>
      </main>
    );
  }

  const puzzle = data;

  function begin() {
    startCrosswordTimer(puzzle.id, false);
    setPhase("play");
    window.scrollTo(0, 0);
  }

  function onWin() {
    finishCrosswordTimer(puzzle.id);
    playFireworks();
    recordEnding(puzzle.id, puzzle.endId);
    setPhase("win");
    window.scrollTo(0, 0);
  }

  function wipeAll() {
    wipeCrosswordStorage(puzzle.id);
    setWipe(false);
    setTick((n) => n + 1);
    setPhase("title");
  }

  const wipeModal = wipe ? (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-void/80 px-6" role="dialog" aria-modal="true">
      <div className="w-full max-w-[340px] rounded-2xl bg-surface p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.08)]">
        <p className="text-center font-sans text-[15px] font-semibold">Сбросить кроссворд?</p>
        <p className="mt-2 text-center text-[13px] leading-relaxed text-muted">
          Буквы, золотое слово и отметка «разгадан» этого кроссворда сотрутся.
        </p>
        <div className="mt-4 flex gap-2">
          <button type="button" onClick={() => setWipe(false)} className="h-11 flex-1 rounded-xl bg-off text-sm font-medium text-off-fg">
            Отмена
          </button>
          <button type="button" onClick={wipeAll} className="h-11 flex-1 rounded-xl bg-danger text-sm text-danger-fg">
            Сбросить
          </button>
        </div>
      </div>
    </div>
  ) : null;

  if (phase === "win") {
    return (
      <main className="px-4 pt-4 pb-10">
        <Link to="/game/crosswords" className="inline-flex items-center gap-1 text-[11px] font-medium tracking-wide text-muted uppercase">
          <ArrowLeft className="size-3.5" />
          Кроссворды
        </Link>
        <p className="mt-3 text-[11px] font-medium tracking-[0.16em] text-gold uppercase">Разгадан</p>
        <h2 className="mt-1 font-sans text-2xl font-semibold leading-tight">{data.secret}</h2>
        <p className="mt-3 font-serif text-[16px] leading-relaxed text-muted">{data.winText}</p>
        {readCrosswordLast(data.id) != null ? (
          <>
            <div className="mt-4 h-px bg-border" role="separator" />
            <p className="mt-3 font-serif text-[15px] italic leading-relaxed text-muted">
              {crosswordFlavor(readCrosswordLast(data.id) as number)}
            </p>
          </>
        ) : null}
        <button
          type="button"
          onClick={() => {
            setPhase("play");
            window.scrollTo(0, 0);
          }}
          className="mt-6 grid h-12 w-full place-items-center rounded-xl bg-hero text-sm font-medium text-hero-fg"
        >
          Вернуться к кроссворду
        </button>
        <Link
          to="/game"
          className="mt-2 grid h-12 w-full place-items-center rounded-xl bg-danger text-sm font-medium text-danger-fg"
        >
          Выйти из игры
        </Link>
      </main>
    );
  }

  if (phase === "title") {
    return (
      <main className="px-4 wide:px-6 pt-4 pb-10">
        <Link to="/game/crosswords" className="inline-flex items-center gap-1 text-[11px] font-medium tracking-wide text-muted uppercase">
          <ArrowLeft className="size-3.5" />
          Кроссворды
        </Link>
        <button
          type="button"
          onClick={() => openZoom(data.cover)}
          className="relative mt-4 block aspect-video w-full overflow-hidden rounded-2xl bg-elevated"
          aria-label="Открыть обложку кроссворда"
        >
          <img src={data.cover} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" decoding="async" />
        </button>
        <h2 className="mt-4 font-sans text-2xl font-semibold leading-tight">{data.title}</h2>
        <p className="mt-3 font-serif text-[16px] leading-relaxed text-muted">{data.pitch}</p>
        <button
          type="button"
          onClick={begin}
          className="mt-6 grid h-12 w-full place-items-center rounded-xl bg-hero text-sm font-medium text-hero-fg"
        >
          {solved ? "Открыть сетку" : "Разгадывать"}
        </button>
        <button
          type="button"
          onClick={() => setWipe(true)}
          className="mt-2 grid h-12 w-full place-items-center rounded-xl bg-danger text-sm font-medium text-danger-fg"
        >
          Сбросить кроссворд
        </button>
        {wipeModal}
      </main>
    );
  }

  return (
    <>
      <CrosswordPlay key={`${data.id}-${tick}`} data={data} onWin={onWin} onWipe={() => setWipe(true)} />
      {wipeModal}
    </>
  );
}

function CrosswordPlay({
  data,
  onWin,
  onWipe,
}: {
  data: CrosswordData;
  onWin: () => void;
  onWipe: () => void;
}) {
  const fillKey = fillStoreKey(data.id);
  const secretKey = secretStoreKey(data.id);
  const grid = useMemo(() => buildCrosswordGrid(data), [data]);
  const [fill, setFill] = useState<Fill>(() => readJson<Fill>(fillKey, {}));
  const [secret, setSecret] = useState(() => {
    const raw = readJson<string[]>(secretKey, emptySecret(data));
    return raw.length === data.secret.length ? raw : emptySecret(data);
  });
  const first = useMemo(() => {
    for (let r = 0; r < data.rows; r++) {
      for (let c = 0; c < data.cols; c++) {
        if (grid[r][c]) return { r, c };
      }
    }
    return { r: 0, c: 0 };
  }, [grid, data.rows, data.cols]);
  const [sel, setSel] = useState<{ r: number; c: number } | null>(first);
  const [dir, setDir] = useState<"across" | "down">("across");
  const [err, setErr] = useState("");
  const [cheat, setCheat] = useState(false);
  const [cheatVal, setCheatVal] = useState("");
  const [cheatErr, setCheatErr] = useState(false);
  const secretRefs = useRef<(HTMLInputElement | null)[]>([]);

  const cellCount = grid.flat().filter(Boolean).length;
  const filledOk = grid.every((row, r) =>
    row.every((cell, c) => !cell || fill[cellKey(r, c)] === cell.ch),
  );
  const filledN = grid.reduce(
    (n, row, r) => n + row.reduce((m, cell, c) => m + (cell && fill[cellKey(r, c)] ? 1 : 0), 0),
    0,
  );

  function pickDir(r: number, c: number, prefer?: "across" | "down") {
    const hits = wordsAt(data, r, c);
    if (prefer && hits.some((w) => w.dir === prefer)) return prefer;
    const starts = hits.filter((w) => w.r === r && w.c === c);
    if (starts.length === 1) return starts[0].dir;
    if (starts.length > 1) {
      const down = starts.find((w) => w.dir === "down");
      if (down) return "down";
    }
    if (hits.some((w) => w.dir === dir)) return dir;
    return hits[0]?.dir || "across";
  }

  function selectCell(r: number, c: number) {
    if (sel?.r === r && sel?.c === c) {
      const hits = wordsAt(data, r, c);
      if (hits.length > 1) setDir(dir === "across" ? "down" : "across");
      return;
    }
    setDir(pickDir(r, c));
    setSel({ r, c });
  }

  function put(letter: string) {
    if (!sel) return;
    const cell = grid[sel.r]?.[sel.c];
    if (!cell) return;
    const next = { ...fill, [cellKey(sel.r, sel.c)]: letter };
    setFill(next);
    writeJson(fillKey, next);
    setErr("");
    setSel(nextCell(sel.r, sel.c, dir, grid));
  }

  function backspace() {
    if (!sel) return;
    const k = cellKey(sel.r, sel.c);
    const next = { ...fill };
    if (next[k]) {
      delete next[k];
      setFill(next);
      writeJson(fillKey, next);
      return;
    }
    const prev =
      dir === "across"
        ? grid[sel.r]?.[sel.c - 1]
          ? { r: sel.r, c: sel.c - 1 }
          : sel
        : grid[sel.r - 1]?.[sel.c]
          ? { r: sel.r - 1, c: sel.c }
          : sel;
    const pk = cellKey(prev.r, prev.c);
    delete next[pk];
    setFill(next);
    writeJson(fillKey, next);
    setSel(prev);
  }

  function jumpWord(w: CrosswordWord) {
    setDir(w.dir);
    for (let i = 0; i < w.answer.length; i++) {
      const r = w.dir === "down" ? w.r + i : w.r;
      const c = w.dir === "across" ? w.c + i : w.c;
      if (!fill[cellKey(r, c)]) {
        setSel({ r, c });
        return;
      }
    }
    setSel({ r: w.r, c: w.c });
  }

  function setSecretAt(i: number, ch: string) {
    const next = secret.slice();
    next[i] = ch;
    setSecret(next);
    writeJson(secretKey, next);
    setErr("");
    if (ch && i < data.secret.length - 1) {
      secretRefs.current[i + 1]?.focus();
    }
  }

  function submit() {
    if (!filledOk) {
      setErr("Сначала сетка на 100%. Гоша не принимает черновики.");
      return;
    }
    if (secret.join("") !== data.secret) {
      let msg = "Золотое слово не то. Ворон смотрит. Переложи буквы.";
      if (/ё/i.test(data.secret)) {
        msg += " Буквы «е» и «ё» — разные. Попробуй верную.";
      }
      setErr(msg);
      return;
    }
    onWin();
  }

  function applyCheat() {
    if (!matchCheat(cheatVal)) {
      setCheatErr(true);
      return;
    }
    const next: Fill = {};
    for (let r = 0; r < grid.length; r++) {
      for (let c = 0; c < grid[r].length; c++) {
        const cell = grid[r][c];
        if (cell) next[cellKey(r, c)] = cell.ch;
      }
    }
    setFill(next);
    writeJson(fillKey, next);
    setCheat(false);
    setCheatVal("");
    setErr("");
    playFireworks();
  }

  const across = data.words.filter((w) => w.dir === "across");
  const down = data.words.filter((w) => w.dir === "down");
  const gold = goldLetters(data, fill);

  return (
    <main className="px-4 pt-4 pb-10">
      <Link to="/game/crosswords" className="inline-flex items-center gap-1 text-[11px] font-medium tracking-wide text-muted uppercase">
        <ArrowLeft className="size-3.5" />
        Кроссворды
      </Link>
      <h2 className="mt-3 font-sans text-xl font-semibold leading-tight">{data.title}</h2>
      <p className="mt-1 text-[11px] tabular-nums text-subtle">
        клеток {filledN} / {cellCount}
      </p>

      <div className="xwrap mt-4">
      <div
        className={cn("xgrid", data.cols >= 12 && "xgrid-dense")}
        style={{ gridTemplateColumns: `repeat(${data.cols}, minmax(0, 1fr))` }}
      >
        {grid.map((row, r) =>
          row.map((cell, c) => {
            if (!cell) return <span key={`${r}-${c}`} className="xcell xcell-dead" />;
            const k = cellKey(r, c);
            const active = sel?.r === r && sel?.c === c;
            const done = wordsAt(data, r, c).some((w) => wordFilled(w, fill));
            return (
              <button
                key={k}
                type="button"
                onClick={() => selectCell(r, c)}
                className={cn(
                  "xcell",
                  cell.key && "xcell-key",
                  done && "xcell-ok",
                  active && "xcell-on",
                  fill[k] && fill[k] !== cell.ch && "xcell-bad",
                )}
              >
                {cell.n ? <span className="xnum">{cell.n}</span> : null}
                {fill[k] || ""}
              </button>
            );
          }),
        )}
      </div>
      </div>

      <div className="xkb mt-4">
        {KB.map((row, ri) => (
          <div key={row} className="xkb-row">
            {row.split("").map((ch) => (
              <button
                key={ch}
                type="button"
                className="xkb-key"
                onPointerDown={(e) => {
                  const el = e.currentTarget;
                  el.classList.add("xkb-hit");
                  window.setTimeout(() => el.classList.remove("xkb-hit"), 140);
                }}
                onClick={() => put(ch)}
              >
                {ch}
              </button>
            ))}
            {ri === KB.length - 1 ? (
              <button
                type="button"
                className="xkb-key xkb-bs"
                aria-label="Стереть"
                onPointerDown={(e) => {
                  const el = e.currentTarget;
                  el.classList.add("xkb-hit");
                  window.setTimeout(() => el.classList.remove("xkb-hit"), 140);
                }}
                onClick={backspace}
              >
                ⌫
              </button>
            ) : null}
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-4 wide:grid-cols-2">
        <ClueList title="По горизонтали" words={across} fill={fill} onJump={jumpWord} />
        <ClueList title="По вертикали" words={down} fill={fill} onJump={jumpWord} />
      </div>

      <section className="mt-6 rounded-2xl bg-surface p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.08)]">
        <p className="text-[11px] font-medium tracking-[0.14em] text-gold uppercase">Золотое слово</p>
        <p className="mt-2 font-serif text-[14px] leading-relaxed text-muted">{data.secretHint}</p>
        <p className="mt-2 text-center text-[14px] leading-relaxed text-muted" data-testid="gold-letters">
          Буквы из золотых клеток:
        </p>
        <p className="mt-1 text-center">
          {gold ? (
            <span className="inline-block text-[18px] font-bold tracking-[0.14em] text-gold">
              {gold.join(" · ")}
            </span>
          ) : (
            <span className="text-[13px] text-subtle">откроются, когда заполнишь золото</span>
          )}
        </p>
        <div className="xslots">
          {secret.map((ch, i) => (
            <input
              key={i}
              ref={(el) => {
                secretRefs.current[i] = el;
              }}
              value={ch}
              maxLength={1}
              onChange={(e) => setSecretAt(i, e.target.value.toUpperCase().slice(0, 1))}
              onKeyDown={(e) => {
                if (e.key === "Backspace" && !secret[i] && i > 0) {
                  secretRefs.current[i - 1]?.focus();
                }
              }}
              className="xslot"
              aria-label={`Буква ${i + 1} золотого слова`}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={submit}
          className="mt-4 grid h-12 w-full place-items-center rounded-xl bg-hero text-sm font-medium text-hero-fg"
        >
          {data.submitLabel || "Каркнуть"}
        </button>
        {err ? <p className="mt-2 text-center text-[12px] text-danger">{err}</p> : null}
      </section>

      <button
        type="button"
        onClick={() => {
          setCheat(true);
          setCheatVal("");
          setCheatErr(false);
        }}
        className="mt-3 grid h-12 w-full place-items-center rounded-xl bg-tg text-sm font-medium text-tg-fg"
      >
        Чит-код
      </button>
      <button
        type="button"
        onClick={onWipe}
        className="mt-2 grid h-12 w-full place-items-center rounded-xl bg-danger text-sm font-medium text-danger-fg"
      >
        Сбросить кроссворд
      </button>

      {cheat ? (
        <div
          className="fixed inset-0 z-[80] grid place-items-center bg-void/80 px-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cheat-title"
        >
          <form
            className="w-full max-w-[340px] rounded-2xl bg-surface p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.08)]"
            onSubmit={(e) => {
              e.preventDefault();
              applyCheat();
            }}
          >
            <p id="cheat-title" className="text-center font-sans text-[15px] font-semibold leading-snug">
              Чит-код: введите слово
            </p>
            <input
              autoFocus
              value={cheatVal}
              onChange={(e) => {
                setCheatVal(e.target.value);
                setCheatErr(false);
              }}
              className="mt-4 h-12 w-full rounded-xl bg-elevated px-3 text-center text-sm text-fg shadow-[0_0_0_1px_rgba(255,255,255,0.06)] focus:outline-2 focus:outline-offset-2 focus:outline-accent"
              placeholder="код"
              autoComplete="off"
            />
            {cheatErr ? (
              <p className="mt-2 text-center text-[12px] text-danger">Неверный код.</p>
            ) : (
              <p className="mt-2 text-center text-[12px] leading-relaxed text-subtle">
                Сил на сетку не хватает? Можно схитрить и взломать кроссворд. После кода все слова
                откроются — останется разгадать золотое слово. Чит-кода на золото нет. Гоша смотрит,
                но молчит.
              </p>
            )}
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setCheat(false)}
                className="h-11 flex-1 rounded-xl bg-elevated text-sm font-medium"
              >
                Отмена
              </button>
              <button type="submit" className="h-11 flex-1 rounded-xl bg-yt text-sm font-medium text-yt-fg">
                Открыть
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </main>
  );
}

function ClueList({
  title,
  words,
  fill,
  onJump,
}: {
  title: string;
  words: CrosswordWord[];
  fill: Fill;
  onJump: (w: CrosswordWord) => void;
}) {
  return (
    <div>
      <p className="text-[11px] font-medium tracking-[0.14em] text-muted uppercase">{title}</p>
      <ul className="mt-2 space-y-2">
        {words.map((w) => {
          const done = w.answer.split("").every((_, i) => {
            const r = w.dir === "down" ? w.r + i : w.r;
            const c = w.dir === "across" ? w.c + i : w.c;
            return fill[cellKey(r, c)] === w.answer[i];
          });
          return (
            <li key={`${w.n}-${w.dir}`}>
              <button
                type="button"
                onClick={() => onJump(w)}
                className={cn("w-full text-left text-[13px] leading-snug", done ? "text-gold" : "text-fg")}
              >
                <span className="tabular-nums text-subtle">{w.n}.</span> {w.clue}{" "}
                <span className="text-subtle">({w.answer.length})</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
