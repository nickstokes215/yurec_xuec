import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useEffect, useRef } from "react";
import { APP_VERSION } from "@/data/catalog";
import "@/lib/secret-gate";

type YtApi = {
  mount: (el: HTMLElement) => { destroy: () => void };
};

declare global {
  interface Window {
    YurecYt?: YtApi;
  }
}

export const Route = createFileRoute("/game/yt")({ component: YtPage });

function YtPage() {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let dead = false;
    let handle: { destroy: () => void } | null = null;
    const scripts: HTMLScriptElement[] = [];
    function boot() {
      if (dead || !el || !window.YurecYt) return;
      handle = window.YurecYt.mount(el);
    }
    function add(src: string, next: () => void) {
      const s = document.createElement("script");
      s.src = src;
      s.async = true;
      s.onload = next;
      document.body.appendChild(s);
      scripts.push(s);
    }
    const start = () => {
      if (window.YurecYt) {
        boot();
        return;
      }
      add(`/game/yurtris.js?v=${APP_VERSION}`, boot);
    };
    if (window.YurecGate) start();
    else add(`/game/secret-gate.js?v=${APP_VERSION}`, start);
    return () => {
      dead = true;
      handle?.destroy();
      scripts.forEach((s) => s.remove());
    };
  }, []);

  return (
    <main className="av-page">
      <Link to="/game" className="av-back">
        <ArrowLeft className="size-3.5" />
        Игры
      </Link>
      <div ref={host} className="av-host" />
    </main>
  );
}
