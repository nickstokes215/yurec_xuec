import { useCallback, useEffect, useRef, useState } from "react";
import type { ZoomDetail } from "@/lib/zoom";
import { cn } from "@/lib/utils";

const MIN = 1;
const MAX = 5;

type Pt = { x: number; y: number };

function dist(a: Pt, b: Pt) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function ZoomLayer() {
  const [open, setOpen] = useState(false);
  const [src, setSrc] = useState("");
  const [flip, setFlip] = useState<"none" | "next" | "prev">("none");
  const gallery = useRef<string[] | null>(null);
  const index = useRef(0);
  const stage = useRef<HTMLDivElement>(null);
  const img = useRef<HTMLImageElement>(null);
  const flipping = useRef(false);

  const scale = useRef(1);
  const tx = useRef(0);
  const ty = useRef(0);
  const startScale = useRef(1);
  const startDist = useRef(0);
  const last = useRef<Pt>({ x: 0, y: 0 });
  const pointers = useRef<Map<number, Pt>>(new Map());
  const moved = useRef(false);
  const swiped = useRef(false);
  const pushed = useRef(false);
  const openRef = useRef(open);
  openRef.current = open;

  const apply = useCallback(() => {
    const el = img.current;
    if (!el) return;
    el.style.transform = `translate(${tx.current}px, ${ty.current}px) scale(${scale.current})`;
  }, []);

  const reset = useCallback(() => {
    scale.current = 1;
    tx.current = 0;
    ty.current = 0;
    apply();
  }, [apply]);

  const showIndex = useCallback(
    (i: number, dir?: 1 | -1) => {
      const g = gallery.current;
      if (!g || !g.length) return;
      const next = Math.max(0, Math.min(g.length - 1, i));
      if (next === index.current) return;
      if (dir && !flipping.current) {
        flipping.current = true;
        setFlip(dir === 1 ? "next" : "prev");
        window.setTimeout(() => {
          index.current = next;
          setSrc(g[next] || "");
          reset();
          window.dispatchEvent(new CustomEvent("yurec-zoom-page", { detail: next }));
        }, 220);
        window.setTimeout(() => {
          setFlip("none");
          flipping.current = false;
        }, 480);
        return;
      }
      index.current = next;
      setSrc(g[next] || "");
      reset();
      window.dispatchEvent(new CustomEvent("yurec-zoom-page", { detail: next }));
    },
    [reset],
  );

  const close = useCallback(() => {
    setOpen(false);
    setSrc("");
    setFlip("none");
    flipping.current = false;
    gallery.current = null;
    reset();
    if (pushed.current) {
      pushed.current = false;
      try {
        history.back();
      } catch {
        /* ignore */
      }
    }
  }, [reset]);

  useEffect(() => {
    function onOpen(e: Event) {
      const raw = (e as CustomEvent<ZoomDetail | string>).detail;
      const detail: ZoomDetail = typeof raw === "string" ? { src: raw } : raw;
      if (!detail?.src) return;
      gallery.current = detail.gallery && detail.gallery.length ? detail.gallery : null;
      index.current = detail.index || 0;
      const first = gallery.current ? gallery.current[index.current] || detail.src : detail.src;
      setSrc(first);
      setOpen(true);
      setFlip("none");
      flipping.current = false;
      scale.current = 1;
      tx.current = 0;
      ty.current = 0;
      if (!pushed.current) {
        try {
          history.pushState({ yurecZoom: 1 }, "", location.href);
          pushed.current = true;
        } catch {
          /* ignore */
        }
      }
    }
    function onKey(e: KeyboardEvent) {
      if (!openRef.current) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") showIndex(index.current + 1, 1);
      if (e.key === "ArrowLeft") showIndex(index.current - 1, -1);
    }
    function onPop() {
      if (!openRef.current && !pushed.current) return;
      pushed.current = false;
      setOpen(false);
      setSrc("");
      setFlip("none");
      gallery.current = null;
    }
    const prevBack = (window as Window & { yurecBack?: () => boolean }).yurecBack;
    function onBack() {
      if (!openRef.current) return typeof prevBack === "function" ? prevBack() : false;
      close();
      return true;
    }
    window.addEventListener("yurec-zoom", onOpen);
    window.addEventListener("keydown", onKey);
    window.addEventListener("popstate", onPop);
    (window as Window & { yurecBack?: () => boolean }).yurecBack = onBack;
    return () => {
      window.removeEventListener("yurec-zoom", onOpen);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("popstate", onPop);
      const w = window as Window & { yurecBack?: () => boolean };
      if (w.yurecBack === onBack) w.yurecBack = prevBack;
    };
  }, [close, showIndex]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  function pts(): Pt[] {
    return Array.from(pointers.current.values());
  }

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    moved.current = false;
    swiped.current = false;
    last.current = { x: e.clientX, y: e.clientY };
    const p = pts();
    if (p.length === 2) {
      startDist.current = dist(p[0], p[1]);
      startScale.current = scale.current;
    }
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const p = pts();
    if (p.length === 2) {
      moved.current = true;
      const d = dist(p[0], p[1]);
      if (startDist.current > 8) {
        scale.current = Math.min(MAX, Math.max(MIN, startScale.current * (d / startDist.current)));
        if (scale.current <= 1.02) {
          scale.current = 1;
          tx.current = 0;
          ty.current = 0;
        }
        apply();
      }
      return;
    }
    if (p.length !== 1) return;
    const dx = e.clientX - last.current.x;
    const dy = e.clientY - last.current.y;
    last.current = { x: e.clientX, y: e.clientY };
    if (Math.abs(dx) + Math.abs(dy) > 6) moved.current = true;
    if (scale.current > 1.05) {
      tx.current += dx;
      ty.current += dy;
      apply();
    }
  }

  function onPointerUp(e: React.PointerEvent<HTMLDivElement>) {
    const start = pointers.current.get(e.pointerId);
    pointers.current.delete(e.pointerId);
    const p = pts();
    if (p.length === 1) {
      last.current = p[0];
      startScale.current = scale.current;
      return;
    }
    if (p.length === 2) {
      startDist.current = dist(p[0], p[1]);
      startScale.current = scale.current;
      return;
    }
    if (moved.current && scale.current <= 1.05 && start && gallery.current && gallery.current.length > 1 && !flipping.current) {
      const dx = e.clientX - start.x;
      const dy = e.clientY - start.y;
      if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) + 8) {
        swiped.current = true;
        showIndex(index.current + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
      }
    }
  }

  function onClick() {
    if (swiped.current) {
      swiped.current = false;
      return;
    }
    if (moved.current) return;
    if (scale.current > 1.05) return;
    if (flipping.current) return;
    close();
  }

  if (!open || !src) return null;

  return (
    <div
      ref={stage}
      role="dialog"
      aria-label="Просмотр"
      className="fixed inset-0 z-50 touch-none overflow-hidden bg-void [perspective:1400px]"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onClick={onClick}
    >
      <div
        className={cn(
          "zoom-leaf",
          flip === "next" && "turn-next",
          flip === "prev" && "turn-prev",
        )}
      >
        <img
          ref={img}
          src={src}
          alt=""
          draggable={false}
          className="pointer-events-none h-full w-full object-contain select-none"
        />
      </div>
    </div>
  );
}