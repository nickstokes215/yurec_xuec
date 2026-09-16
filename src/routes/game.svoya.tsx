import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { catTitle, ensureSvoya, svoyaReady } from "@/data/svoya";
import { SVOYA_COVER, SVOYA_HUB_BLURB, SVOYA_PITCH, SVOYA_RULES, SVOYA_TITLE } from "@/data/svoya-meta";
import { playFireworks } from "@/components/fireworks";
import { playRain } from "@/components/rain";
import { isSoundOn, isVibrateOn } from "@/lib/use-settings";
import { openZoom } from "@/lib/zoom";
import { cn } from "@/lib/utils";
import {
  advanceRound,
  answerCell,
  bestScore,
  bumpPlays,
  clearRun,
  currentRound,
  dealRun,
  playsCount,
  qualifies,
  readHall,
  readRun,
  roundOpen,
  setFinalBet,
  submitHall,
  svoyaById,
  wipeSvoya,
  cellOrd,
  type SvoyaRun,
} from "@/lib/svoya-store";

export const Route = createFileRoute("/game/svoya")({ component: SvoyaPage });

type Screen = "hub" | "board" | "q" | "gap" | "bet" | "fin" | "hall" | "rules";

function subscribe(fn: () => void) {
  window.addEventListener("yurec-svoya", fn);
  window.addEventListener("storage", fn);
  return () => {
    window.removeEventListener("yurec-svoya", fn);
    window.removeEventListener("storage", fn);
  };
}

function beep(ok: boolean) {
  if (!isSoundOn()) return;
  try {
    const AC = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "square";
    o.frequency.value = ok ? 880 : 180;
    g.gain.value = 0.05;
    o.connect(g);
    g.connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + (ok ? 0.09 : 0.16));
    window.setTimeout(() => {
      try {
        void ctx.close();
      } catch {
        /* ignore */
      }
    }, 200);
  } catch {
    /* ignore */
  }
}

function vibe(ok: boolean) {
  try {
    if (isVibrateOn()) navigator.vibrate?.(ok ? 18 : [40, 30, 40]);
  } catch {
    /* ignore */
  }
}

function SvoyaPage() {
  const stamp = useSyncExternalStore(subscribe, () => JSON.stringify({ r: readRun(), h: readHall(), p: playsCount() }), () => "");
  const snap = useMemo(() => {
    try {
      return JSON.parse(stamp || "{}") as { r?: SvoyaRun | null; p?: number };
    } catch {
      return {};
    }
  }, [stamp]);
  const run = stamp ? snap.r ?? null : null;
  const hall = readHall();
  const round = currentRound(run);
  const [screen, setScreen] = useState<Screen>("hub");
  const [qid, setQid] = useState<string | null>(null);
  const [picked, setPicked] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [wipeAsk, setWipeAsk] = useState(false);
  const [newAsk, setNewAsk] = useState(false);
  const [named, setNamed] = useState(false);
  const [bet, setBet] = useState(0);
  const [finFx, setFinFx] = useState(false);
  const [packOn, setPackOn] = useState(() => svoyaReady());
  const [packErr, setPackErr] = useState(false);
  const q = qid ? svoyaById(qid) : undefined;
  const openCell = q && run && run.round !== 4 ? round?.cells.find((c) => c.qid === q.id) : undefined;

  useEffect(() => {
    let live = true;
    void ensureSvoya()
      .then(() => {
        if (live) setPackOn(true);
      })
      .catch(() => {
        if (live) setPackErr(true);
      });
    return () => {
      live = false;
    };
  }, []);

  useEffect(() => {
    if (screen !== "fin" || !run?.ended || finFx) return;
    setFinFx(true);
    if (run.score > 0) playFireworks();
    else playRain();
  }, [screen, run?.ended, run?.score, finFx]);

  function startNew() {
    if (!packOn) return;
    setNewAsk(false);
    setNamed(false);
    setPicked(null);
    setQid(null);
    setFinFx(false);
    setBet(0);
    if (!dealRun()) return;
    setScreen("board");
  }

  function continueRun() {
    setNamed(false);
    setPicked(null);
    setQid(null);
    const cur = readRun();
    if (!cur) {
      startNew();
      return;
    }
    if (cur.ended) {
      setScreen("fin");
      return;
    }
    if (cur.round === 4 && cur.final && !cur.final.done) {
      setBet(cur.final.bet);
      setScreen("bet");
      return;
    }
    if (roundOpen(cur)) setScreen("board");
    else setScreen("gap");
  }

  function openQ(id: string) {
    const cell = currentRound()?.cells.find((c) => c.qid === id);
    if (!cell || cell.done) return;
    setQid(id);
    setPicked(null);
    setScreen("q");
  }

  function pickAns(i: number) {
    if (picked != null || !qid) return;
    const res = answerCell(qid, i);
    if (!res) return;
    setPicked(i);
    beep(res.correct);
    vibe(res.correct);
  }

  function afterQ() {
    const cur = readRun();
    setQid(null);
    setPicked(null);
    if (!cur) {
      setScreen("hub");
      return;
    }
    if (cur.ended) {
      bumpPlays();
      setScreen("fin");
      return;
    }
    if (cur.round === 4) {
      setScreen("bet");
      return;
    }
    if (!roundOpen(cur)) setScreen("gap");
    else setScreen("board");
  }

  function goNextRound() {
    const next = advanceRound();
    if (!next) return;
    if (next.ended) {
      bumpPlays();
      setScreen("fin");
      return;
    }
    if (next.round === 4) {
      setBet(0);
      setScreen("bet");
      return;
    }
    setScreen("board");
  }

  const vals = round?.values || [100, 200, 300, 400, 500];

  return (
    <main className="svoya-page">
      <Link to="/game" className="av-back">
        <ArrowLeft className="size-3.5" />
        Игры
      </Link>

      {screen === "hub" ? (
        <div className="svoya-hub">
          <button type="button" className="svoya-cover" onClick={() => openZoom(SVOYA_COVER)} aria-label="Открыть обложку">
            <img src={SVOYA_COVER} alt="" />
          </button>
          <p className="svoya-kicker">Игры двора</p>
          <h2>{SVOYA_TITLE}</h2>
          <p className="svoya-blurb">{SVOYA_HUB_BLURB}</p>
          {SVOYA_PITCH.map((t) => (
            <p key={t} className="svoya-pitch">
              {t}
            </p>
          ))}
          <p className="svoya-scoreline">
            рекорд {stamp ? bestScore() : 0} · партий {stamp ? (snap.p ?? 0) : 0}
          </p>
          {packErr ? <p className="svoya-pitch">Колода не встала. Зайди на хаб ещё раз.</p> : null}
          {run && !run.ended ? (
            <button type="button" className="svoya-btn gold" onClick={continueRun}>
              Продолжить
            </button>
          ) : run && run.ended ? (
            <button type="button" className="svoya-btn gold" onClick={() => setScreen("fin")}>
              Итог партии
            </button>
          ) : null}
          {run ? (
            <button
              type="button"
              className="svoya-btn hero"
              disabled={!packOn}
              onClick={() => {
                if (!newAsk) {
                  setNewAsk(true);
                  return;
                }
                startNew();
              }}
            >
              {newAsk ? "Точно сначала? Партия сгорит" : "Начать заново"}
            </button>
          ) : (
            <button type="button" className="svoya-btn gold" disabled={!packOn} onClick={startNew}>
              {packOn ? "Играть" : "Колода грузится…"}
            </button>
          )}
          <button type="button" className="svoya-btn tg" onClick={() => setScreen("hall")}>
            Таблица рекордов
          </button>
          <button type="button" className="svoya-btn off" onClick={() => setScreen("rules")}>
            Правила
          </button>
          <button
            type="button"
            className="svoya-btn danger"
            onClick={() => {
              if (!wipeAsk) {
                setWipeAsk(true);
                return;
              }
              wipeSvoya();
              setWipeAsk(false);
              playRain();
            }}
          >
            {wipeAsk ? "Точно обнулить статистику?" : "Сбросить статистику"}
          </button>
        </div>
      ) : null}

      {screen === "board" && run && round && run.round <= 3 ? (
        <div className="svoya-play">
          <div className="svoya-top">
            <p className="svoya-kicker">
              Раунд {run.round} из 3 · счёт {run.score}
            </p>
            <p className="svoya-mini">
              {round.cells.filter((c) => c.done).length} / {round.cells.length} · верно {run.right} · мимо {run.wrong}
            </p>
          </div>
          <div className="svoya-grid" data-cols={round.cats.length}>
            {round.cats.map((cat) => (
              <div key={cat} className="svoya-col">
                <div className="svoya-cat">{catTitle(cat)}</div>
                {vals.map((v, i) => {
                  const cell = round.cells.find((c) => c.cat === cat && c.t === i + 1);
                  if (!cell) return null;
                  return (
                    <button
                      key={cell.qid}
                      type="button"
                      className={cn("svoya-cell", cell.done && (cell.ok ? "ok" : "bad"))}
                      disabled={!!cell.done}
                      onClick={() => openQ(cell.qid)}
                    >
                      {cell.done ? (cell.ok ? "✓" : "✗") : v}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {screen === "gap" && run ? (
        <div className="svoya-hub">
          <p className="svoya-kicker">Раунд {Math.min(run.round, 3)} сыгран</p>
          <h2>{run.score}</h2>
          <p className="svoya-blurb">верно {run.right} · мимо {run.wrong}</p>
          {run.round >= 3 && run.score <= 0 ? (
            <p className="svoya-pitch">Ноль или минус. Финала не будет — Юрец уже в баке.</p>
          ) : run.round >= 3 ? (
            <p className="svoya-pitch">Финал. Одна тема, одна ставка, один вопрос.</p>
          ) : (
            <p className="svoya-pitch">Дальше темы новые и ценники злее.</p>
          )}
          <button type="button" className="svoya-btn gold" onClick={goNextRound}>
            {run.round >= 3 ? (run.score <= 0 ? "К итогу" : "На финал") : "Следующий раунд"}
          </button>
        </div>
      ) : null}

      {screen === "bet" && run?.final ? (
        <div className="svoya-hub">
          <p className="svoya-kicker">Финал · счёт {run.score}</p>
          <h2>{catTitle(run.final.cat)}</h2>
          <p className="svoya-pitch">Тема открыта. Ставка — не больше баланса. Потом один вопрос, дорогой как пятая ячейка.</p>
          <div className="svoya-name">
            <input
              type="number"
              min={0}
              max={Math.max(0, run.score)}
              value={bet}
              onChange={(e) => setBet(Math.max(0, Math.min(Math.max(0, run.score), Number(e.target.value) || 0)))}
            />
            <button type="button" className="svoya-btn" onClick={() => setBet(Math.max(0, run.score))}>
              Ва-банк {Math.max(0, run.score)}
            </button>
            <button
              type="button"
              className="svoya-btn gold"
              onClick={() => {
                setFinalBet(bet);
                setQid(run.final!.qid);
                setPicked(null);
                setScreen("q");
              }}
            >
              Поставить {bet} и смотреть вопрос
            </button>
          </div>
        </div>
      ) : null}

      {screen === "q" && q ? (
        <div className="svoya-q">
          <p className="svoya-kicker">
            {catTitle(q.cat)}
            {run?.round === 4 && run.final ? ` · ставка ${run.final.bet}` : ""}
            {openCell ? ` · ${openCell.v}` : ""}
          </p>
          <p className="svoya-ask">{q.q}</p>
          <div className="svoya-answers">
            {cellOrd(q.id, run).map((ai) => {
              const opt = q.a[ai] || "";
              const show = picked != null;
              const good = ai === q.ok;
              const mine = ai === picked;
              return (
                <button
                  key={`${opt}-${ai}`}
                  type="button"
                  className={cn("svoya-ans", show && good && "ok", show && mine && !good && "bad")}
                  disabled={picked != null}
                  onClick={() => pickAns(ai)}
                >
                  {opt}
                </button>
              );
            })}
          </div>
          {picked != null ? (
            <button type="button" className="svoya-btn gold" onClick={afterQ}>
              Дальше
            </button>
          ) : null}
        </div>
      ) : null}

      {screen === "fin" && run ? (
        <div className="svoya-hub">
          <p className="svoya-kicker">{run.score > 0 ? "Плюс двора" : "Минус двора"}</p>
          <h2>{run.score}</h2>
          <p className="svoya-blurb">
            верно {run.right} · мимо {run.wrong}
            {run.skippedFinal ? " · финал не дали" : ""}
          </p>
          <p className="svoya-pitch">{run.story || ""}</p>
          {qualifies(run.score) && !named ? (
            <form
              className="svoya-name"
              onSubmit={(e) => {
                e.preventDefault();
                submitHall(name, run.score);
                setNamed(true);
                clearRun();
                setScreen("hall");
              }}
            >
              <p className="svoya-pitch">Ты влез в таблицу. Как подписать стыд?</p>
              <input value={name} onChange={(e) => setName(e.target.value)} maxLength={16} placeholder="Юрец" />
              <button type="submit" className="svoya-btn gold">
                Вписать
              </button>
            </form>
          ) : (
            <button
              type="button"
              className="svoya-btn gold"
              onClick={() => {
                clearRun();
                setScreen("hall");
              }}
            >
              К таблице
            </button>
          )}
          <button type="button" className="svoya-btn" onClick={startNew}>
            Ещё круг
          </button>
        </div>
      ) : null}

      {screen === "hall" ? (
        <div className="svoya-hub">
          <p className="svoya-kicker">Стыд двора</p>
          <h2>Таблица</h2>
          {hall.length ? (
            <ol className="svoya-hall">
              {hall.map((h, i) => (
                <li key={`${h.at}-${h.name}`}>
                  <span>
                    {i + 1}. {h.name}
                  </span>
                  <b>{h.score}</b>
                </li>
              ))}
            </ol>
          ) : (
            <p className="svoya-pitch">Пока пусто. Первый, кто доиграет, станет царём сетки.</p>
          )}
          <button type="button" className="svoya-btn gold" onClick={() => setScreen("hub")}>
            Назад
          </button>
        </div>
      ) : null}

      {screen === "rules" ? (
        <div className="svoya-hub">
          <p className="svoya-kicker">Регламент</p>
          <h2>Правила</h2>
          {SVOYA_RULES.map((t) => (
            <p key={t} className="svoya-pitch">
              {t}
            </p>
          ))}
          <button type="button" className="svoya-btn gold" onClick={() => setScreen("hub")}>
            Назад
          </button>
        </div>
      ) : null}
    </main>
  );
}
