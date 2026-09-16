import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChipRow } from "@/components/chip-row";
import { QuotePlayer } from "@/components/quote-player";
import { CHAR_GROUPS, type Character } from "@/data/catalog";
import { YARD_COVER } from "@/data/yard-map";
import { orderedCharacters, setGroupOrder, useCharOrder } from "@/lib/use-char-order";
import { isVibrateOn } from "@/lib/use-settings";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/characters/")({ component: CharactersPage });

function CharactersPage() {
  const [group, setGroup] = useState<(typeof CHAR_GROUPS)[number]["id"]>("all");
  const order = useCharOrder();
  useEffect(() => {
    function onReset() {
      setGroup("all");
    }
    window.addEventListener("yurec-reset-chars", onReset);
    return () => window.removeEventListener("yurec-reset-chars", onReset);
  }, []);
  useEffect(() => {
    try {
      sessionStorage.removeItem("yurec-char-from");
    } catch {
      /* ignore */
    }
  }, []);
  const list = useMemo(() => orderedCharacters(group), [group, order.stamp]);

  return (
    <main className="px-4 pt-4 pb-8">
      <QuotePlayer />
      <YardTeaser />
      <p className="mt-5 text-[11px] font-medium tracking-[0.16em] text-muted uppercase">Двор на Шотмана</p>
      <h2 className="mt-1 font-sans text-2xl font-semibold leading-tight">Персонажи</h2>
      <p className="mt-2 font-serif text-[16px] leading-relaxed text-muted">
        Карточки тех, кто орёт, спасает, продаёт водку и каркает «РЕВЭЛ». Жми — будет смешно и чуть
        страшно. Зажми карточку и тащи, если хочешь другой порядок.
      </p>

      <ChipRow storageKey="yurec-chips-chars" deps={group} className="mt-4">
        {CHAR_GROUPS.map((g) => (
          <button
            key={g.id}
            type="button"
            onClick={() => setGroup(g.id)}
            className={cn(
              "h-9 shrink-0 rounded-full px-3.5 text-xs font-medium",
              group === g.id ? "bg-accent text-accent-fg" : "bg-surface text-muted",
            )}
          >
            {g.label}
          </button>
        ))}
      </ChipRow>

      <p className="mt-3 text-xs tabular-nums text-subtle">{list.length} карточек</p>

      <CharGrid group={group} list={list} />
    </main>
  );
}

function YardTeaser() {
  return (
    <section className="mt-4 overflow-hidden rounded-2xl bg-surface shadow-[0_0_0_1px_rgba(255,255,255,0.06)]">
      <Link to="/characters/map" className="block">
        <span className="relative block aspect-video w-full bg-elevated">
          <img
            src={YARD_COVER}
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-[50%_42%]"
            loading="lazy"
            decoding="async"
          />
          <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-bg via-bg/50 to-transparent p-4">
            <span className="block text-[11px] font-medium tracking-[0.16em] text-muted uppercase">Карта двора</span>
            <span className="mt-1 block font-sans text-xl font-semibold leading-tight">Петербург · Шотмана · трёшка</span>
          </span>
        </span>
        <span className="block px-4 pt-2 pb-3">
          <span className="block font-serif text-[15px] leading-snug text-muted">
            Сначала город, потом двор, потом холодильник, который не закрывается. Жми на огни.
          </span>
          <span className="mt-2 grid h-11 w-full place-items-center rounded-xl bg-hero text-sm font-medium text-hero-fg">
            Открыть карту
          </span>
        </span>
      </Link>
    </section>
  );
}

function CharGrid({ group, list }: { group: string; list: Character[] }) {
  const navigate = useNavigate();
  const listRef = useRef(list);
  listRef.current = list;
  const groupRef = useRef(group);
  groupRef.current = group;
  const [dragId, setDragId] = useState<string | null>(null);
  const dragIdRef = useRef<string | null>(null);
  const hold = useRef(0);
  const start = useRef({ x: 0, y: 0 });
  const swallowed = useRef(false);
  const CHAR_HOLD_MS = 400;

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

  function hitCid(x: number, y: number) {
    const skipId = dragIdRef.current;
    const skip = skipId ? (document.querySelector(`[data-cid="${skipId}"]`) as HTMLElement | null) : null;
    const prev = skip?.style.pointerEvents ?? "";
    if (skip) skip.style.pointerEvents = "none";
    const hit = document.elementFromPoint(x, y)?.closest("[data-cid]") as HTMLElement | null;
    if (skip) skip.style.pointerEvents = prev;
    return hit?.getAttribute("data-cid") ?? null;
  }

  function moveAt(x: number, y: number) {
    const id = dragIdRef.current;
    if (id) {
      const over = hitCid(x, y);
      if (!over || over === id) return;
      const ids = listRef.current.map((c) => c.id);
      const from = ids.indexOf(id);
      const to = ids.indexOf(over);
      if (from < 0 || to < 0 || from === to) return;
      ids.splice(from, 1);
      ids.splice(to, 0, id);
      setGroupOrder(groupRef.current, ids);
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
      // Android: длинный тап даёт pointercancel ~500мс и системную вибрацию.
      // Если уже зажали или тащим — не сбрасывать, дальше ведёт touchmove.
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
    <ul className="mt-3 grid grid-cols-2 gap-2 wide:grid-cols-3 board:grid-cols-4">
      {list.map((c) => (
        <li key={c.id} data-cid={c.id} className={cn(dragId === c.id && "is-dragging")}>
          <div
            role="link"
            tabIndex={0}
            onPointerDown={(e) => {
              if (e.button != null && e.button !== 0) return;
              start.current = { x: e.clientX, y: e.clientY };
              swallowed.current = false;
              clearHold();
              const id = c.id;
              hold.current = window.setTimeout(() => {
                startDrag(id);
              }, CHAR_HOLD_MS);
            }}
            onContextMenu={(e) => e.preventDefault()}
            onClick={() => {
              if (swallowed.current) {
                swallowed.current = false;
                return;
              }
              void navigate({ to: "/characters/$id", params: { id: c.id } });
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                void navigate({ to: "/characters/$id", params: { id: c.id } });
              }
            }}
            className={cn(
              "block overflow-hidden rounded-2xl bg-surface shadow-[0_0_0_1px_rgba(255,255,255,0.06)] select-none",
              dragId === c.id && "relative z-10 scale-[1.04] shadow-[0_12px_28px_rgba(0,0,0,0.45)]",
            )}
            style={{ touchAction: "pan-y" }}
          >
            <img
              src={c.photo}
              alt={c.name}
              draggable={false}
              className="pointer-events-none aspect-square w-full object-cover"
              loading="lazy"
              decoding="async"
            />
            <div className="px-3 py-3">
              <p className="truncate font-sans text-sm font-semibold">{c.name}</p>
              <p className="mt-0.5 truncate text-[11px] text-muted">{c.role}</p>
              <p className="mt-2 line-clamp-2 font-serif text-[12px] leading-snug text-subtle">
                «{c.quote}»
              </p>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
