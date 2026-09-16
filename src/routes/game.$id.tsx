import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  applyDelta,
  endingMeta,
  endingNode,
  freshStats,
  getLevel,
  getNode,
  meetsNeed,
  needHint,
  RANK_TONE,
  verdictFor,
  type GameSave,
  type GameScript,
  type GameStats,
} from "@/data/game";
import { CrosswordPage } from "@/components/crossword";
import { getCrossword } from "@/data/crossword";
import { recordEnding, resetGameProgress, unlockAllEndings, useGameProgress, writeGameSave } from "@/lib/use-game";
import { cn } from "@/lib/utils";
import { playFireworks } from "@/components/fireworks";
import { clearQuestTimer, finishQuestTimer, questFlavor, startQuestTimer } from "@/lib/game-stats";
import { matchCheat } from "@/lib/secret-gate";

export const Route = createFileRoute("/game/$id")({ component: GameLevelPage });

type Phase = "title" | "play" | "end";

function GameLevelPage() {
  const { id } = Route.useParams();
  if (getCrossword(id)) return <CrosswordPage id={id} />;
  const script = getLevel(id);

  if (!script) {
    return (
      <main className="px-4 wide:px-6 py-10 text-center">
        <p className="text-sm text-muted">Такого уровня нет.</p>
        <Link to="/game" className="mt-4 inline-flex h-12 items-center rounded-xl bg-elevated px-4 text-sm">
          К играм
        </Link>
      </main>
    );
  }

  return <LevelPlay script={script} />;
}

function LevelPlay({ script }: { script: GameScript }) {
  const { save, endings } = useGameProgress(script.id);
  const [phase, setPhase] = useState<Phase>("title");
  const [nodeId, setNodeId] = useState(script.start);
  const [stats, setStats] = useState<GameStats>(() => freshStats(script));
  const [steps, setSteps] = useState(0);
  const [tick, setTick] = useState(0);
  const [runMs, setRunMs] = useState<number | null>(null);

  const node = getNode(script, nodeId);
  const endId = node?.end;
  const end = endId ? endingMeta(script, endId) : undefined;

  useEffect(() => {
    setPhase("title");
    setNodeId(script.start);
    setStats(freshStats(script));
    setSteps(0);
  }, [script]);

  useEffect(() => {
    if (phase === "end" && endId) recordEnding(script.id, endId);
  }, [phase, endId, script.id]);

  function begin(from?: GameSave | null) {
    if (from) {
      setNodeId(from.node);
      setStats(from.stats);
      setSteps(from.steps);
      startQuestTimer(script.id, false);
    } else {
      setNodeId(script.start);
      setStats(freshStats(script));
      setSteps(0);
      writeGameSave(script.id, null);
      startQuestTimer(script.id, true);
    }
    setRunMs(null);
    setPhase("play");
    setTick((n) => n + 1);
    window.scrollTo(0, 0);
  }

  function choose(to: string, delta?: GameStats) {
    const nextStats = applyDelta(stats, delta);
    const nextNode = getNode(script, to);
    const nextSteps = steps + 1;
    setStats(nextStats);
    setNodeId(to);
    setSteps(nextSteps);
    setTick((n) => n + 1);
    window.scrollTo(0, 0);
    if (nextNode?.end) {
      writeGameSave(script.id, null);
      setRunMs(finishQuestTimer(script.id));
      setPhase("end");
    } else {
      writeGameSave(script.id, { node: to, stats: nextStats, steps: nextSteps });
    }
  }

  if (!node) {
    return (
      <main className="px-4 wide:px-6 py-10 text-center">
        <p className="text-sm text-muted">Сцена потерялась на Шотмана.</p>
        <Button className="mt-4" onClick={() => begin()}>
          Начать заново
        </Button>
      </main>
    );
  }

  if (phase === "title") {
    return <TitleScreen script={script} save={save} endings={endings} onStart={begin} />;
  }

  if (phase === "end" && end) {
    return (
      <EndingScreen
        script={script}
        title={node.title}
        text={node.text}
        endId={end.id}
        rank={end.rank}
        stats={stats}
        steps={steps}
        endings={endings}
        runMs={runMs}
        onAgain={() => begin()}
        onMenu={() => setPhase("title")}
      />
    );
  }

  return (
    <PlayScreen
      key={tick}
      script={script}
      title={node.title}
      text={node.text}
      stats={stats}
      steps={steps}
      choices={node.choices ?? []}
      onChoose={choose}
    />
  );
}

function TitleScreen({
  script,
  save,
  endings,
  onStart,
}: {
  script: GameScript;
  save: GameSave | null;
  endings: string[];
  onStart: (from?: GameSave | null) => void;
}) {
  const [wipe, setWipe] = useState(false);
  const [cheat, setCheat] = useState(false);
  const [cheatVal, setCheatVal] = useState("");
  const [cheatErr, setCheatErr] = useState(false);
  const [readEnd, setReadEnd] = useState<string | null>(null);
  const readNode = readEnd ? endingNode(script, readEnd) : undefined;
  const readMeta = readEnd ? endingMeta(script, readEnd) : undefined;

  return (
    <main className="px-4 wide:px-6 pt-4 pb-10">
      <Link
        to="/game/quest"
        className="inline-flex items-center gap-1 text-[11px] font-medium tracking-wide text-muted uppercase"
      >
        <ArrowLeft className="size-3.5" />
        Квест
      </Link>
      <p className="mt-3 text-[11px] font-medium tracking-[0.16em] text-muted uppercase">
        {script.kicker}
      </p>
      <h2 className="mt-1 font-sans text-2xl font-semibold leading-tight">{script.title}</h2>
      <p className="mt-3 font-serif text-[16px] leading-relaxed text-muted">{script.pitch}</p>

      <div className="mt-5 flex flex-col gap-2">
        {save && (
          <Button
            onClick={() => onStart(save)}
            className="h-12 w-full rounded-xl bg-hero text-hero-fg hover:opacity-90"
          >
            Продолжить · шаг {save.steps}
          </Button>
        )}
        <Button
          variant={save ? "subtle" : "primary"}
          onClick={() => onStart()}
          className={
            save
              ? "h-12 w-full rounded-xl"
              : "h-12 w-full rounded-xl bg-hero text-hero-fg hover:opacity-90"
          }
        >
          {save ? "Начать заново" : "Начать"}
        </Button>
      </div>

      <section className="mt-8">
        <div className="flex items-end justify-between gap-3">
          <h3 className="font-sans text-sm font-semibold">Концовки</h3>
          <p className="text-[11px] tabular-nums text-subtle">
            {endings.length} / {script.endings.length}
          </p>
        </div>
        <ul className="mt-3 board">
          {script.endings.map((e) => {
            const open = endings.includes(e.id);
            return (
              <li key={e.id}>
                <button
                  type="button"
                  disabled={!open}
                  onClick={() => open && setReadEnd(e.id)}
                  className={cn(
                    "flex w-full items-center justify-between gap-3 rounded-xl px-4 py-3 text-left shadow-[0_0_0_1px_rgba(255,255,255,0.06)]",
                    open ? RANK_TONE[e.rank] || "bg-surface" : "bg-surface",
                    open ? "cursor-pointer" : "cursor-default",
                  )}
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium underline-offset-2" style={open ? { textDecoration: "underline" } : undefined}>
                      {open ? e.title : "Ещё не открыта"}
                    </p>
                    <p className={cn("text-[11px] tracking-wide uppercase", open ? "opacity-80" : "text-subtle")}>
                      {open ? e.rank : "скрыта"}
                    </p>
                  </div>
                  <span className={cn("size-2 shrink-0 rounded-full", open ? "bg-current" : "bg-border")} />
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <div className="mt-8 mb-4 h-px bg-border" role="separator" />

      <button
        type="button"
        onClick={() => {
          setCheat(true);
          setCheatVal("");
          setCheatErr(false);
        }}
        className="h-12 w-full rounded-xl bg-tg text-sm font-medium text-tg-fg"
      >
        Чит-код
      </button>
      <button
        type="button"
        onClick={() => setWipe(true)}
        className="mt-2 h-12 w-full rounded-xl bg-danger text-sm font-medium text-danger-fg"
      >
        Сбросить прогресс уровня
      </button>

      <p className="mt-8 font-serif text-sm leading-relaxed text-subtle whitespace-pre-wrap">
        {`В этой версии доступны несколько первых серий с оригинальным сюжетом. Кое-где ветки могут идти нелинейно, потому что... ну, это же Юрец. Логика здесь отдыхает.
Играйте!
Возможны баги.
Возможны очень сильные баги.
Возможно, игра сама начнёт пить ревэл и каркать РЕВЭЛ.`}
      </p>

      {readNode && readMeta ? (
        <div
          className="fixed inset-0 z-[80] grid place-items-center bg-void/80 px-6"
          role="dialog"
          aria-modal="true"
          onClick={(e) => e.target === e.currentTarget && setReadEnd(null)}
        >
          <div className="max-h-[80vh] w-full max-w-[380px] overflow-y-auto rounded-2xl bg-surface p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.08)]">
            <p className="text-center text-[11px] font-medium tracking-[0.14em] text-muted uppercase">
              Финал · {readMeta.rank}
            </p>
            <p className="mt-2 text-center font-sans text-[18px] font-semibold leading-snug">{readNode.title}</p>
            <p className="mt-3 font-serif text-[15px] leading-relaxed text-muted whitespace-pre-wrap">{readNode.text}</p>
            <button
              type="button"
              onClick={() => setReadEnd(null)}
              className="mt-4 h-11 w-full rounded-xl bg-elevated text-sm font-medium"
            >
              Закрыть
            </button>
          </div>
        </div>
      ) : null}
      {wipe ? (
        <div
          className="fixed inset-0 z-[80] grid place-items-center bg-void/80 px-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="wipe-title"
        >
          <div className="w-full max-w-[340px] rounded-2xl bg-surface p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.08)]">
            <p id="wipe-title" className="text-center font-sans text-[15px] font-semibold leading-snug">
              Сбросить прогресс уровня?
            </p>
            <p className="mt-2 text-center text-[13px] leading-relaxed text-muted">
              Сохранение и открытые концовки этого конкретного уровня будут удалены.
            </p>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setWipe(false)}
                className="h-11 flex-1 rounded-xl bg-off text-sm font-medium text-off-fg"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={() => {
                  resetGameProgress(script.id);
                  clearQuestTimer(script.id);
                  setWipe(false);
                }}
                className="h-11 flex-1 rounded-xl bg-danger text-sm font-medium text-danger-fg"
              >
                Сбросить
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {cheat ? (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-void/80 px-6" role="dialog" aria-modal="true">
          <form
            className="w-full max-w-[340px] rounded-2xl bg-surface p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.08)]"
            onSubmit={(e) => {
              e.preventDefault();
              if (!matchCheat(cheatVal)) {
                setCheatErr(true);
                return;
              }
              unlockAllEndings(
                script.id,
                script.endings.map((x) => x.id),
              );
              setCheat(false);
              setCheatVal("");
              playFireworks();
            }}
          >
            <p className="text-center font-sans text-[15px] font-semibold leading-snug">Чит-код: введите слово</p>
            <input
              autoFocus
              value={cheatVal}
              onChange={(e) => {
                setCheatVal(e.target.value);
                setCheatErr(false);
              }}
              className="mt-4 h-12 w-full rounded-xl bg-elevated px-3 text-center text-sm text-fg shadow-[0_0_0_1px_rgba(255,255,255,0.06)]"
              placeholder="код"
              autoComplete="off"
            />
            {cheatErr ? (
              <p className="mt-2 text-center text-[12px] text-danger">Неверный код.</p>
            ) : (
              <p className="mt-2 text-center text-[12px] leading-relaxed text-subtle">
                Концовки не идут? Можно схитрить. После кода откроются все концовки этого уровня. Юрец орёт, что так и
                задумано.
              </p>
            )}
            <div className="mt-4 flex gap-2">
              <button type="button" onClick={() => setCheat(false)} className="h-11 flex-1 rounded-xl bg-elevated text-sm">
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

function PlayScreen({
  script,
  title,
  text,
  stats,
  steps,
  choices,
  onChoose,
}: {
  script: GameScript;
  title: string;
  text: string;
  stats: GameStats;
  steps: number;
  choices: { label: string; to: string; delta?: GameStats; need?: GameStats }[];
  onChoose: (to: string, delta?: GameStats) => void;
}) {
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [title, text]);

  return (
    <main className="px-4 wide:px-6 pt-4 pb-8">
      <div className="game-play">
        <div>
          <div className="flex items-center justify-between gap-3">
            <p className="text-[11px] font-medium tracking-[0.16em] text-muted uppercase">{script.kicker}</p>
            <p className="text-[11px] tabular-nums text-subtle">шаг {steps + 1}</p>
          </div>
          <StatsHud script={script} stats={stats} />
        </div>
        <div>
          <h2 className="mt-5 font-sans text-[22px] font-semibold leading-tight rise-in wide:mt-0">{title}</h2>
          <p className="mt-3 font-serif text-[16px] leading-relaxed whitespace-pre-wrap text-muted rise-in">{text}</p>
          <div className="mt-6 flex flex-col gap-2">
            {choices.map((c, i) => {
              const ok = meetsNeed(stats, c.need);
              const hint = needHint(script, c.need);
              return (
                <button
                  key={`${c.to}-${i}`}
                  type="button"
                  disabled={!ok}
                  onClick={() => ok && onChoose(c.to, c.delta)}
                  className={cn(
                    "min-h-12 rounded-xl px-4 py-3.5 text-left text-sm leading-snug font-medium shadow-[0_0_0_1px_rgba(255,255,255,0.06)] transition-[transform,background-color] duration-150 ease-out",
                    ok ? "bg-surface hover:bg-elevated active:scale-[0.99]" : "bg-surface/50 text-subtle",
                  )}
                >
                  {c.label}
                  {!ok && hint ? (
                    <span className="mt-1 block text-[11px] font-normal tracking-wide text-subtle uppercase">
                      закрыто · {hint}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}

function EndingScreen({
  script,
  title,
  text,
  endId,
  rank,
  stats,
  steps,
  endings,
  runMs,
  onAgain,
  onMenu,
}: {
  script: GameScript;
  title: string;
  text: string;
  endId: string;
  rank: string;
  stats: GameStats;
  steps: number;
  endings: string[];
  runMs: number | null;
  onAgain: () => void;
  onMenu: () => void;
}) {
  const found = useMemo(() => {
    const set = new Set(endings);
    set.add(endId);
    return set.size;
  }, [endings, endId]);

  return (
    <main className="read-col px-4 wide:px-6 pt-4 pb-10">
      <p className="text-[11px] font-medium tracking-[0.16em] text-muted uppercase">Финал · {rank}</p>
      <h2 className="mt-1 font-sans text-2xl font-semibold leading-tight">{title}</h2>
      <p className="mt-4 font-serif text-[16px] leading-relaxed whitespace-pre-wrap text-muted">{text}</p>
      <section className="mt-6 rounded-xl bg-surface px-4 py-4 shadow-[0_0_0_1px_rgba(255,255,255,0.06)]">
        <h3 className="font-sans text-sm font-semibold">Статистика дня</h3>
        <p className="mt-1 text-[12px] text-subtle">
          {steps} {steps === 1 ? "выбор" : steps < 5 ? "выбора" : "выборов"} · концовок {found} из{" "}
          {script.endings.length}
        </p>
        <p className="mt-2 font-serif text-sm leading-relaxed text-muted">{verdictFor(script, stats)}</p>
        {runMs != null ? (
          <>
            <div className="mt-3 h-px bg-border" role="separator" />
            <p className="mt-3 font-serif text-sm italic leading-relaxed text-muted">{questFlavor(runMs)}</p>
          </>
        ) : null}
        <div className="mt-4">
          <StatsHud script={script} stats={stats} />
        </div>
      </section>
      <div className="mt-5 flex flex-col gap-2">
        <Button onClick={onAgain} className="h-12 w-full rounded-xl">
          Пройти ещё раз
        </Button>
        <Button onClick={onMenu} className="h-12 w-full rounded-xl bg-end-canon text-end-canon-fg hover:opacity-90">
          Альтернативные концовки
        </Button>
        <Link
          to="/story/$slug"
          params={{ slug: script.storySlug }}
          className="flex h-12 items-center justify-center rounded-xl bg-end-small text-end-small-fg text-sm font-medium hover:opacity-90"
        >
          {script.storyCta}
        </Link>
        <Link to="/game/quest" className="flex h-12 items-center justify-center rounded-xl bg-danger text-sm font-medium text-danger-fg">
          Выйти из игры
        </Link>
      </div>
    </main>
  );
}

function StatsHud({ script, stats }: { script: GameScript; stats: GameStats }) {
  return (
    <ul className="mt-4 grid grid-cols-2 gap-2">
      {script.stats.map((s) => {
        const v = Math.max(0, Math.min(100, stats[s.key] ?? 0));
        return (
          <li key={s.key} className="rounded-lg bg-surface px-3 py-2.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-medium text-muted">{s.label}</span>
              <span className="text-[11px] tabular-nums text-subtle">{v}</span>
            </div>
            <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-elevated">
              <div
                className="h-full rounded-full bg-accent transition-[width] duration-200 ease-out"
                style={{ width: `${v}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
