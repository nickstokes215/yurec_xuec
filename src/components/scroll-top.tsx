import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export function ScrollTop({ media }: { media?: boolean }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [show, setShow] = useState(false);

  useEffect(() => {
    const check = () => {
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setShow(max > 80 && y > 160);
    };
    check();
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    return () => {
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, [pathname]);

  if (!show) return null;

  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-x-0 z-30 mx-auto flex w-full max-w-[var(--app-max)] justify-end px-4",
        media
          ? "bottom-[calc(8.7rem+env(safe-area-inset-bottom))]"
          : "bottom-[calc(5.4rem+env(safe-area-inset-bottom))]",
      )}
    >
      <button
        type="button"
        aria-label="Наверх"
        onClick={() => {
          try {
            sessionStorage.setItem(`yurec-scroll:${pathname}`, "0");
          } catch {
            /* ignore */
          }
          window.scrollTo(0, 0);
        }}
        className="pointer-events-auto grid size-11 place-items-center rounded-full bg-elevated text-fg shadow-[0_0_0_1px_rgba(255,255,255,0.14),0_10px_28px_rgba(0,0,0,0.45)]"
      >
        <ArrowUp className="size-5" strokeWidth={2.2} />
      </button>
    </div>
  );
}
