import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { catTitle, ensureSvoya, svoyaReady } from "@/data/svoya";
import { SVOYA_COVER, SVOYA_HUB_BLURB, SVOYA_PITCH, SVOYA_PRIZE_LOSE, SVOYA_PRIZES, SVOYA_RULES, SVOYA_TITLE, svoyaPrize, svoyaPrizeSrc, type SvoyaPrizeId } from "@/data/svoya-meta";
import { playFireworks } from "@/components/fireworks";
import { playRain } from "@/components/rain";
import { isSoundOn, isVibrateOn } from "@/lib/use-settings";
import { isMaster, readFeathers } from "@/lib/svoya-stats";
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
  forfeitRun,
  playsCount,
  qualifies,
  readHall,
  readRun,
  roundOpen,
  setAuctionBet,
  setFinalBet,
  submitHall,
  svoyaById,
  wipeSvoya,
  cellOrd,
  type SvoyaRun,
} from "@/lib/svoya-store";

export const Route = createFileRoute("/game/svoya")({ component: SvoyaPage });

type Screen = "hub" | "board" | "q" | "gap" | "bet" | "auc" | "fin" | "hall" | "fame" | "aim" | "rules";

function lastOf(run: SvoyaRun | null) {
  if (!run) return 3;
  return run.last || (run.v === 4 ? 2 : 3);
}

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

function spiceNoise(kind: "cat" | "auc") {
  if (!isSoundOn()) return;
  try {
    const AC = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    const notes = kind === "cat" ? [520, 340, 760] : [140, 90];
    notes.forEach((freq, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = kind === "cat" ? "triangle" : "square";
      o.frequency.value = freq;
      g.gain.value = 0.06;
      o.connect(g);
      g.connect(ctx.destination);
      const t = ctx.currentTime + i * 0.22;
      o.start(t);
      o.stop(t + 0.18);
    });
    window.setTimeout(() => {
      try {
        void ctx.close();
      } catch {
        /* ignore */
      }
    }, 1200);
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
  const [giveAsk, setGiveAsk] = useState(false);
  const [packOn, setPackOn] = useState(() => svoyaReady());
  const [packErr, setPackErr] = useState(false);
  const [spice, setSpice] = useState<null | "cat" | "auc">(null);
  const spiceTimer = useMemo(() => ({ id: 0 }), []);
  const master = isMaster();
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
    if (run.score > 0 && !run.forfeit) playFireworks();
    else playRain();
  }, [screen, run?.ended, run?.score, finFx]);

  function begin(aim: SvoyaPrizeId | "random") {
    if (!packOn || !dealRun(aim)) return;
    setNewAsk(false);
    setNamed(false);
    setPicked(null);
    setQid(null);
    setFinFx(false);
    setGiveAsk(false);
    setBet(0);
    setSpice(null);
    setScreen("board");
  }

  function continueRun() {
    setNamed(false);
    setPicked(null);
    setQid(null);
    const cur = readRun();
    if (!cur) {
      setScreen("aim");
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
    setGiveAsk(false);
    const spicy = cell.kind === "cat" || (cell.kind === "auc" && cell.bet == null);
    if (spicy && cell.kind) {
      const kind = cell.kind;
      setSpice(kind);
      spiceNoise(kind);
      window.clearTimeout(spiceTimer.id);
      spiceTimer.id = window.setTimeout(() => {
        setSpice(null);
        if (kind === "auc") {
          setBet(cell.v);
          setScreen("auc");
        } else setScreen("q");
      }, 1700);
      return;
    }
    setScreen("q");
  }

  function giveUp() {
    if (!giveAsk) {
      setGiveAsk(true);
      return;
    }
    const next = forfeitRun();
    setGiveAsk(false);
    setQid(null);
    setPicked(null);
    setFinFx(false);
    if (next) setScreen("fin");
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
    setGiveAsk(false);
    if (!cur) {
      setScreen("hub");
      return;
    }
    if (cur.ended) {
      if (!cur.forfeit) bumpPlays();
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
    setGiveAsk(false);
    if (!next) return;
    if (next.ended) {
      if (!next.forfeit) bumpPlays();
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
    <main className={cn("svoya-page", master && "is-master")}>
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
                setScreen("aim");
              }}
            >
              {newAsk ? "Точно сначала? Партия сгорит" : "Начать заново"}
            </button>
          ) : (
            <button type="button" className="svoya-btn gold" disabled={!packOn} onClick={() => setScreen("aim")}>
              {packOn ? "Играть" : "Колода грузится…"}
            </button>
          )}
          <button type="button" className="svoya-btn tg" onClick={() => setScreen("hall")}>
            Таблица рекордов
          </button>
          <button type="button" className="svoya-btn gold" onClick={() => setScreen("fame")}>
            Зал славы
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
              Раунд {run.round} из {lastOf(run)} · счёт {run.score}
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
                  const cell = round.cells.find((c) => c.cat === cat && (c.row ?? c.t - 1) === i);
                  if (!cell) return null;
                  const face = cell.done
                    ? cell.ok
                      ? "✓"
                      : "✗"
                    : master && cell.kind === "cat"
                      ? "кот"
                      : master && cell.kind === "auc"
                        ? "аук"
                        : v;
                  return (
                    <button
                      key={cell.qid}
                      type="button"
                      className={cn(
                        "svoya-cell",
                        cell.done && (cell.ok ? "ok" : "bad"),
                        master && !cell.done && cell.kind === "cat" && "cat",
                        master && !cell.done && cell.kind === "auc" && "auc",
                      )}
                      disabled={!!cell.done}
                      onClick={() => openQ(cell.qid)}
                    >
                      {face}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
          <button type="button" className={cn("svoya-give", giveAsk && "is-ask")} onClick={giveUp}>
            {giveAsk ? "Точно сдаться?" : "сдаюсь"}
          </button>
        </div>
      ) : null}

      {screen === "gap" && run ? (
        <div className="svoya-hub">
          <p className="svoya-kicker">Раунд {Math.min(run.round, lastOf(run))} сыгран</p>
          <h2>{run.score}</h2>
          <p className="svoya-blurb">верно {run.right} · мимо {run.wrong}</p>
          {run.note ? <p className="svoya-pitch">{run.note}</p> : null}
          {run.round >= lastOf(run) && run.score <= 0 ? (
            <p className="svoya-pitch">Ноль или минус. Финала не будет, перо останется в серванте.</p>
          ) : run.round >= lastOf(run) ? (
            <p className="svoya-pitch">Финал. Одна тема, одна ставка. На кону одно из пяти перьев.</p>
          ) : (
            <p className="svoya-pitch">Дальше темы новые. Где кот и аукцион — узнаешь, когда вскроешь.</p>
          )}
          <button type="button" className="svoya-btn gold" onClick={goNextRound}>
            {run.round >= lastOf(run) ? (run.score <= 0 ? "К итогу" : "На финал") : "Следующий раунд"}
          </button>
          <button type="button" className={cn("svoya-give", giveAsk && "is-ask")} onClick={giveUp}>
            {giveAsk ? "Точно сдаться?" : "сдаюсь"}
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
                setGiveAsk(false);
                setScreen("q");
              }}
            >
              Поставить {bet} и смотреть вопрос
            </button>
          </div>
          <button type="button" className={cn("svoya-give", giveAsk && "is-ask")} onClick={giveUp}>
            {giveAsk ? "Точно сдаться?" : "сдаюсь"}
          </button>
        </div>
      ) : null}

      {screen === "auc" && run && openCell?.kind === "auc" ? (
        <div className="svoya-hub">
          <p className="svoya-kicker">Аукцион · счёт {run.score}</p>
          <h2>{catTitle(openCell.cat)}</h2>
          <p className="svoya-pitch">
            Номинал {openCell.v}. Ставь от него и до {Math.max(openCell.v, run.score)}. Вопрос ещё закрыт.
          </p>
          <div className="svoya-name">
            <input
              type="number"
              min={openCell.v}
              max={Math.max(openCell.v, run.score)}
              value={bet}
              onChange={(e) =>
                setBet(Math.max(openCell.v, Math.min(Math.max(openCell.v, run.score), Number(e.target.value) || openCell.v)))
              }
            />
            <button type="button" className="svoya-btn" onClick={() => setBet(Math.max(openCell.v, run.score))}>
              Ва-банк {Math.max(openCell.v, run.score)}
            </button>
            <button
              type="button"
              className="svoya-btn gold"
              onClick={() => {
                setAuctionBet(openCell.qid, bet);
                setPicked(null);
                setGiveAsk(false);
                setScreen("q");
              }}
            >
              Поставить {Math.max(openCell.v, Math.min(Math.max(openCell.v, run.score), bet))} и вскрыть
            </button>
          </div>
          <button type="button" className={cn("svoya-give", giveAsk && "is-ask")} onClick={giveUp}>
            {giveAsk ? "Точно сдаться?" : "сдаюсь"}
          </button>
        </div>
      ) : null}

      {screen === "q" && q ? (
        <div className="svoya-q">
          <p className="svoya-kicker">
            {catTitle(openCell?.stolen || q.cat)}
            {run?.round === 4 && run.final ? ` · ставка ${run.final.bet}` : ""}
            {openCell?.kind === "auc" ? ` · ставка ${openCell.bet ?? openCell.v}` : openCell ? ` · ${openCell.v}` : ""}
          </p>
          {openCell?.bark ? <p className="svoya-bark">{openCell.bark}</p> : null}
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
          ) : (
            <button type="button" className={cn("svoya-give", giveAsk && "is-ask")} onClick={giveUp}>
              {giveAsk ? "Точно сдаться?" : "сдаюсь"}
            </button>
          )}
        </div>
      ) : null}

      {screen === "fin" && run ? (
        <div className="svoya-hub">
          <p className="svoya-kicker">{run.forfeit ? "Сдался" : run.score > 0 ? "Плюс двора" : "Минус двора"}</p>
          <h2>{run.forfeit ? "Поражение" : run.score}</h2>
          {run.prize && run.score > 0 && !run.forfeit ? (
            <button type="button" className="svoya-prize" onClick={() => openZoom(svoyaPrizeSrc(run.prize))} aria-label="Открыть перо">
              <img src={svoyaPrizeSrc(run.prize)} alt={svoyaPrize(run.prize).title} />
            </button>
          ) : null}
          <p className="svoya-blurb">
            {run.forfeit
              ? "розыгрыш закрыт · в книгу рекордов не пишется"
              : `верно ${run.right} · мимо ${run.wrong}${run.skippedFinal ? " · финал не дали" : ""}`}
          </p>
          {!run.forfeit ? (
            <p className="svoya-pitch">
              {run.score > 0 && run.prize
                ? `${svoyaPrize(run.prize).title}. ${svoyaPrize(run.prize).line}`
                : SVOYA_PRIZE_LOSE}
            </p>
          ) : null}
          <p className="svoya-pitch">{run.story || ""}</p>
          {!run.forfeit && qualifies(run.score) && !named ? (
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
                setScreen(run.forfeit ? "hub" : "hall");
              }}
            >
              {run.forfeit ? "На хаб" : "К таблице"}
            </button>
          )}
          <button type="button" className="svoya-btn" onClick={() => setScreen("aim")}>
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

      {screen === "aim" ? (
        <div className="svoya-hub">
          <p className="svoya-kicker">Сервант</p>
          <h2>За какое перо сегодня</h2>
          <p className="svoya-pitch">Пять перьев или случайное. Выигрыш в плюсе отдаст именно его.</p>
          {SVOYA_PRIZES.map((p) => (
            <button key={p.id} type="button" className="svoya-aim" disabled={!packOn} onClick={() => begin(p.id)}>
              <img src={svoyaPrizeSrc(p.id)} alt="" />
              <span>{p.title}</span>
            </button>
          ))}
          <button type="button" className="svoya-btn gold" disabled={!packOn} onClick={() => begin("random")}>
            Рандом
          </button>
          <button type="button" className="svoya-btn" onClick={() => setScreen("hub")}>
            Назад
          </button>
        </div>
      ) : null}

      {screen === "fame" ? (
        <div className="svoya-hub">
          <p className="svoya-kicker">{master ? "Магистр" : "Сервант"}</p>
          <h2>Зал славы</h2>
          <p className="svoya-pitch">
            {master
              ? "Все перья твои. Кот и аукцион подписаны, форма золотая, как у магистра в телеке."
              : "Тёмные ещё в серванте. Собери все пять — и клетки кота с аукционом перестанут прятаться."}
          </p>
          <div className="svoya-fame-grid">
            {SVOYA_PRIZES.map((p) => {
              const on = readFeathers().includes(p.id);
              return (
                <button
                  key={p.id}
                  type="button"
                  className={cn("svoya-fame", !on && "is-dim")}
                  disabled={!on}
                  onClick={() => openZoom(svoyaPrizeSrc(p.id))}
                >
                  <img src={svoyaPrizeSrc(p.id)} alt="" />
                  <span>{on ? p.title : "ещё в серванте"}</span>
                </button>
              );
            })}
          </div>
          <button type="button" className="svoya-btn gold" onClick={() => setScreen("hub")}>
            Назад
          </button>
        </div>
      ) : null}

      {spice ? (
        <div className={cn("svoya-spice", spice)} role="status">
          <b>{spice === "cat" ? "Кот в мешке" : "Аукцион"}</b>
          <span>{spice === "cat" ? "Тема чужая. Цена двойная." : "Ставка от номинала. Вопрос ещё закрыт."}</span>
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
