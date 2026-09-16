import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { LEVELS, QUEST_COVER, CROSSWORDS_COVER, AV_COVER, AV_CHAIN, avBeatenCount, ARK_COVER, ARK_CHAIN, arkBeatenCount, AV_HUB_BLURB, ARK_HUB_BLURB, QUEST_HUB_BLURB, CROSSWORD_HUB_BLURB } from "@/data/game";
import { SVOYA_COVER, SVOYA_HUB_BLURB } from "@/data/svoya-meta";
import { bestScore } from "@/lib/svoya-stats";
import { CROSSWORDS } from "@/data/crossword";
import { useAllEndings } from "@/lib/use-game";
import { openZoom } from "@/lib/zoom";
import { isVibrateOn } from "@/lib/use-settings";
import { setGameOrder, useGameOrder, type GameHubId } from "@/lib/use-game-order";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/game/")({ component: GamesHub });

const HOLD_MS = 400;

type GameMeta = {
  id: GameHubId;
  to: "/game/quest" | "/game/crosswords" | "/game/av" | "/game/ark" | "/game/svoya";
  cover: string;
  title: string;
  score?: string;
  blurb?: string;
};

function GamesHub() {
  const all = useAllEndings();
  const order = useGameOrder();
  const avOpen = useSyncExternalStore(
    (fn) => {
      window.addEventListener("storage", fn);
      window.addEventListener("yurec-av-wins", fn);
      return () => {
        window.removeEventListener("storage", fn);
        window.removeEventListener("yurec-av-wins", fn);
      };
    },
    avBeatenCount,
    () => 0,
  );
  const arkOpen = useSyncExternalStore(
    (fn) => {
      window.addEventListener("storage", fn);
      window.addEventListener("yurec-ark-wins", fn);
      return () => {
        window.removeEventListener("storage", fn);
        window.removeEventListener("yurec-ark-wins", fn);
      };
    },
    arkBeatenCount,
    () => 0,
  );
  const svoyaBest = useSyncExternalStore(
    (fn) => {
      window.addEventListener("storage", fn);
      window.addEventListener("yurec-svoya", fn);
      return () => {
        window.removeEventListener("storage", fn);
        window.removeEventListener("yurec-svoya", fn);
      };
    },
    bestScore,
    () => 0,
  );
  const questOpen = LEVELS.reduce((n, l) => n + ((all[l.id]?.length ?? 0) >= l.endings.length && l.endings.length > 0 ? 1 : 0), 0);
  const questTotal = LEVELS.length;
  const cwOpen = CROSSWORDS.reduce((n, cw) => n + (all[cw.id]?.length ?? 0), 0);
  const catalog: Record<GameHubId, GameMeta> = {
    quest: {
      id: "quest",
      to: "/game/quest",
      cover: QUEST_COVER,
      title: "Юрцовский квест",
      score: `пройдено ${questOpen} / ${questTotal}`,
      blurb: QUEST_HUB_BLURB,
    },
    crosswords: {
      id: "crosswords",
      to: "/game/crosswords",
      cover: CROSSWORDS_COVER,
      title: "Шотманские кроссворды",
      score: `разгадано ${cwOpen} / ${CROSSWORDS.length}`,
      blurb: CROSSWORD_HUB_BLURB,
    },
    av: { id: "av", to: "/game/av", cover: AV_COVER, title: "Помойкобол", score: `отбито ${avOpen} / ${AV_CHAIN.length}`, blurb: AV_HUB_BLURB },
    ark: { id: "ark", to: "/game/ark", cover: ARK_COVER, title: "Алконоид", score: `разбито ${arkOpen} / ${ARK_CHAIN.length}`, blurb: ARK_HUB_BLURB },
    svoya: { id: "svoya", to: "/game/svoya", cover: SVOYA_COVER, title: "Юрца игра", score: `рекорд ${svoyaBest}`, blurb: SVOYA_HUB_BLURB },
  };
  const list = order.ids.map((id) => catalog[id]).filter((g): g is GameMeta => !!g);

  return (
    <main className="px-4 pt-4 pb-10 wide:px-6">
      <p className="text-[11px] font-medium tracking-[0.16em] text-muted uppercase">Игры</p>
      <h2 className="mt-1 font-sans text-2xl font-semibold leading-tight">Игры двора</h2>
      <p className="mt-2 font-serif text-[16px] leading-relaxed text-muted">
        Пять игр. На телефоне столбик, на планшете — два ряда. Зажми карточку — перетащи любимую наверх.
      </p>
      <Link
        to="/passport"
        className="mt-4 flex items-center justify-between gap-3 rounded-2xl bg-surface px-4 py-3 shadow-[0_0_0_1px_rgba(255,255,255,0.06)]"
      >
        <div className="min-w-0">
          <p className="text-[11px] font-medium tracking-[0.16em] text-accent uppercase">Справка</p>
          <p className="truncate text-[16px] font-semibold">Паспорт двора</p>
          <p className="mt-0.5 text-[13px] text-muted">Что уже прочитано, отбито и разгадано.</p>
        </div>
        <span className="shrink-0 text-subtle">▸</span>
      </Link>
      <GameGrid list={list} />
      {order.custom ? (
        <button
          type="button"
          onClick={() => order.reset()}
          className="mt-4 grid h-12 w-full place-items-center rounded-xl bg-elevated text-sm font-medium"
        >
          Вернуть заводской порядок
        </button>
      ) : null}
    </main>
  );
}

function GameGrid({ list }: { list: GameMeta[] }) {
  const listRef = useRef(list);
  listRef.current = list;
  const [dragId, setDragId] = useState<string | null>(null);
  const dragIdRef = useRef<string | null>(null);
  const hold = useRef(0);
  const start = useRef({ x: 0, y: 0 });
  const swallowed = useRef(false);

  function clearHold() {
    if (hold.current) {
      window.clearTimeout(hold.current);
      hold.current = 0;
    }
  }

  function stopDrag() {
    clearHold();
    if (!dragIdRef.current) return;
    dragIdRef.current = null;
    setDragId(null);
    document.body.classList.remove("char-dragging");
  }

  function startDrag(id: string) {
    hold.current = 0;
    dragIdRef.current = id;
    swallowed.current = true;
    setDragId(id);
    document.body.classList.add("char-dragging");
    try {
      if (isVibrateOn()) navigator.vibrate?.(18);
    } catch {
      /* ignore */
    }
  }

  function hitGid(x: number, y: number) {
    const skipId = dragIdRef.current;
    const skip = skipId ? (document.querySelector(`[data-gid="${skipId}"]`) as HTMLElement | null) : null;
    const prev = skip?.style.pointerEvents ?? "";
    if (skip) skip.style.pointerEvents = "none";
    const hit = document.elementFromPoint(x, y)?.closest("[data-gid]") as HTMLElement | null;
    if (skip) skip.style.pointerEvents = prev;
    return hit?.getAttribute("data-gid") ?? null;
  }

  function moveAt(x: number, y: number) {
    const id = dragIdRef.current;
    if (id) {
      const over = hitGid(x, y);
      if (!over || over === id) return;
      const ids = listRef.current.map((g) => g.id);
      const from = ids.indexOf(id as GameHubId);
      const to = ids.indexOf(over as GameHubId);
      if (from < 0 || to < 0 || from === to) return;
      ids.splice(from, 1);
      ids.splice(to, 0, id as GameHubId);
      setGameOrder(ids);
      return;
    }
    const dx = x - start.current.x;
    const dy = y - start.current.y;
    if (dx * dx + dy * dy > 144) clearHold();
  }

  useEffect(() => {
    function onScroll() {
      if (!dragIdRef.current) clearHold();
    }
    function onPointerMove(e: PointerEvent) {
      if (e.pointerType !== "mouse") return;
      if (dragIdRef.current) e.preventDefault();
      moveAt(e.clientX, e.clientY);
    }
    function onPointerUp() {
      stopDrag();
    }
    function onPointerCancel() {
      if (hold.current || dragIdRef.current) return;
      stopDrag();
    }
    function onTouchMove(e: TouchEvent) {
      const t = e.touches[0] || e.changedTouches[0];
      if (!t) return;
      if (dragIdRef.current && e.cancelable) e.preventDefault();
      moveAt(t.clientX, t.clientY);
    }
    function onTouchEnd() {
      stopDrag();
    }
    function onTouchCancel() {
      if (hold.current || dragIdRef.current) return;
      stopDrag();
    }
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("pointermove", onPointerMove, { passive: false });
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerCancel);
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd);
    window.addEventListener("touchcancel", onTouchCancel);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerCancel);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchcancel", onTouchCancel);
      document.body.classList.remove("char-dragging");
    };
  }, []);

  return (
    <ul className="game-board mt-4">
      {list.map((g) => (
        <li key={g.id} data-gid={g.id} className={cn(dragId === g.id && "is-dragging")}>
          <article
            className={cn(
              "game-row overflow-hidden rounded-2xl bg-surface shadow-[0_0_0_1px_rgba(255,255,255,0.06)]",
              dragId === g.id && "relative z-10 scale-[1.03] shadow-[0_12px_28px_rgba(0,0,0,0.45)]",
            )}
            onPointerDown={(e) => {
              if (e.button != null && e.button !== 0) return;
              start.current = { x: e.clientX, y: e.clientY };
              swallowed.current = false;
              clearHold();
              const id = g.id;
              hold.current = window.setTimeout(() => startDrag(id), HOLD_MS);
            }}
            onContextMenu={(e) => e.preventDefault()}
            style={{ touchAction: "pan-y" }}
          >
            <button
              type="button"
              onClick={() => {
                if (swallowed.current) return;
                openZoom(g.cover);
              }}
              className="game-row-pic"
              aria-label={`Открыть обложку: ${g.title}`}
            >
              <img src={g.cover} alt="" loading="lazy" decoding="async" draggable={false} />
            </button>
            <div className="game-row-body">
              <h3 className="font-sans text-[17px] font-semibold leading-tight">{g.title}</h3>
              {g.score ? <p className="mt-0.5 text-[11px] tabular-nums text-subtle">{g.score}</p> : null}
              {g.blurb ? <p className="game-row-blurb">{g.blurb}</p> : null}
              <Link
                to={g.to}
                className="mt-2 grid h-10 w-full place-items-center rounded-xl bg-hero text-sm font-medium text-hero-fg"
                onClick={(e) => {
                  if (swallowed.current) {
                    e.preventDefault();
                    return;
                  }
                }}
                onPointerDown={(e) => e.stopPropagation()}
              >
                Открыть
              </Link>
            </div>
          </article>
        </li>
      ))}
    </ul>
  );
}
