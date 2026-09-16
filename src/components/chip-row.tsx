import { useLayoutEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function ChipRow({
  storageKey,
  deps,
  className,
  children,
}: {
  storageKey: string;
  deps: unknown;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useRef(0);

  useLayoutEffect(() => {
    try {
      x.current = Number(sessionStorage.getItem(storageKey) || 0);
    } catch {
      /* ignore */
    }
    if (ref.current) ref.current.scrollLeft = x.current;
  }, [deps, storageKey]);

  useLayoutEffect(() => {
    function zero() {
      x.current = 0;
      try {
        sessionStorage.setItem(storageKey, "0");
      } catch {
        /* ignore */
      }
      if (ref.current) ref.current.scrollLeft = 0;
    }
    const ev = `yurec-zero-chips:${storageKey}`;
    window.addEventListener(ev, zero);
    return () => window.removeEventListener(ev, zero);
  }, [storageKey]);

  function persist() {
    const n = ref.current?.scrollLeft ?? 0;
    x.current = n;
    try {
      sessionStorage.setItem(storageKey, String(n));
    } catch {
      /* ignore */
    }
  }

  return (
    <div
      ref={ref}
      data-chips={storageKey}
      onScroll={persist}
      onTouchStart={persist}
      onMouseDown={(e) => {
        persist();
        const t = e.target as HTMLElement;
        if (t.closest("button, a")) e.preventDefault();
      }}
      className={cn(
        "flex flex-nowrap gap-2 overflow-x-auto pb-1 [overflow-anchor:none] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className,
      )}
    >
      {children}
    </div>
  );
}