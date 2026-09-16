import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState, type PointerEvent } from "react";
import { getPressIssue, pressTitle } from "@/data/catalog";
import { openZoom } from "@/lib/zoom";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/press/$id")({ component: PressIssuePage });

function PressIssuePage() {
  const { id } = Route.useParams();
  const issue = getPressIssue(id);
  const [page, setPage] = useState(0);
  const [flip, setFlip] = useState<"none" | "next" | "prev">("none");
  const startX = useRef(0);
  const startY = useRef(0);
  const swiped = useRef(false);
  const flipping = useRef(false);
  const n = issue ? issue.pages.length : 0;

  useEffect(() => {
    setPage(0);
    setFlip("none");
    flipping.current = false;
  }, [id]);

  useEffect(() => {
    function onZoomPage(e: Event) {
      const i = (e as CustomEvent<number>).detail;
      if (typeof i === "number" && n > 0) setPage(Math.max(0, Math.min(n - 1, i)));
    }
    window.addEventListener("yurec-zoom-page", onZoomPage);
    return () => window.removeEventListener("yurec-zoom-page", onZoomPage);
  }, [n]);

  if (!issue) {
    return (
      <main className="px-4 pt-10 text-center">
        <p className="text-sm text-muted">Этого выпуска в киоске нет.</p>
        <Link to="/videos/$cat" params={{ cat: "press" }} className="mt-4 inline-flex h-11 items-center rounded-xl bg-elevated px-4 text-sm">
          К газете
        </Link>
      </main>
    );
  }

  const current = issue.pages[page] ?? issue.pages[0];

  function go(delta: number) {
    const next = Math.max(0, Math.min(n - 1, page + delta));
    if (next === page || flipping.current) return;
    flipping.current = true;
    setFlip(delta > 0 ? "next" : "prev");
    window.setTimeout(() => {
      setPage(next);
    }, 220);
    window.setTimeout(() => {
      setFlip("none");
      flipping.current = false;
    }, 480);
  }

  function onPointerDown(e: PointerEvent<HTMLDivElement>) {
    startX.current = e.clientX;
    startY.current = e.clientY;
    swiped.current = false;
  }

  function onPointerUp(e: PointerEvent<HTMLDivElement>) {
    const dx = e.clientX - startX.current;
    const dy = e.clientY - startY.current;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) + 8) {
      swiped.current = true;
      go(dx < 0 ? 1 : -1);
    }
  }

  return (
    <main className="px-4 pt-4 pb-12">
      <Link
        to="/videos/$cat"
        params={{ cat: "press" }}
        className="inline-flex h-10 items-center gap-1.5 text-sm text-muted"
      >
        <ArrowLeft className="size-4" />
        К киоску
      </Link>
      <p className="mt-4 text-[11px] font-medium tracking-[0.16em] text-muted uppercase">{issue.kicker}</p>
      <h2 className="mt-1 font-sans text-2xl font-semibold leading-tight">{pressTitle(issue)}</h2>
      <p className="mt-2 text-[12px] tabular-nums text-subtle">
        {page + 1} из {n}
      </p>

      <div
        className="paper-stage mt-4 overflow-hidden rounded-xl bg-[#e7dcc4] shadow-[0_0_0_1px_rgba(255,255,255,0.06)]"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <button
          type="button"
          onClick={() => {
            if (swiped.current || flipping.current) return;
            openZoom(
              current.src,
              issue.pages.map((p) => p.src),
              page,
            );
          }}
          className={cn(
            "paper-leaf block w-full",
            flip === "next" && "turn-next",
            flip === "prev" && "turn-prev",
          )}
          aria-label={`Полоса ${page + 1}, открыть крупно`}
        >
          <img
            src={current.src}
            alt={current.title}
            draggable={false}
            className="mx-auto max-h-[52vh] w-auto max-w-full object-contain py-2"
          />
        </button>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <button
          type="button"
          aria-label="Предыдущая полоса"
          disabled={page === 0 || flipping.current}
          onClick={() => go(-1)}
          className="grid size-12 shrink-0 place-items-center rounded-xl bg-elevated text-fg disabled:opacity-30"
        >
          <ChevronLeft className="size-6" />
        </button>
        <div className="min-w-0 text-center">
          <p className="text-[10px] font-semibold tracking-wide text-muted uppercase">{current.title}</p>
          <p className="mt-0.5 text-[13px] font-medium tabular-nums">
            {page + 1} / {n}
          </p>
        </div>
        <button
          type="button"
          aria-label="Следующая полоса"
          disabled={page === n - 1 || flipping.current}
          onClick={() => go(1)}
          className="grid size-12 shrink-0 place-items-center rounded-xl bg-elevated text-fg disabled:opacity-30"
        >
          <ChevronRight className="size-6" />
        </button>
      </div>
      <p className="mt-2 font-serif text-[14px] leading-relaxed text-muted">{current.caption}</p>
    </main>
  );
}
