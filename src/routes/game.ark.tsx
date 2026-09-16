import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useEffect, useRef } from "react";
import { APP_VERSION } from "@/data/catalog";
import "@/lib/secret-gate";

type ArkApi = {
  mount: (
    el: HTMLElement,
    opts: {
      yurec: string;
      lysy: string;
      zinaida: string;
      svetlana: string;
      tolik: string;
      lyudmila: string;
      batya: string;
      kostya: string;
    },
  ) => { destroy: () => void };
};

declare global {
  interface Window {
    YurecArk?: ArkApi;
  }
}

export const Route = createFileRoute("/game/ark")({ component: ArkPage });

function ArkPage() {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let dead = false;
    let handle: { destroy: () => void } | null = null;
    const opts = {
      yurec: "/characters/yurec.jpg",
      lysy: "/characters/lysy.jpg",
      zinaida: "/characters/zinaida.jpg",
      svetlana: "/characters/svetlana.jpg",
      tolik: "/characters/tolik.jpg",
      lyudmila: "/characters/lyudmila.jpg",
      batya: "/characters/batya.jpg",
      kostya: "/characters/kostya.jpg",
    };

    function boot() {
      if (dead || !el || !window.YurecArk) return;
      handle = window.YurecArk.mount(el, opts);
    }

    const scripts: HTMLScriptElement[] = [];
    function add(src: string, next: () => void) {
      const s = document.createElement("script");
      s.src = src;
      s.async = true;
      s.onload = next;
      document.body.appendChild(s);
      scripts.push(s);
    }
    const start = () => {
      if (window.YurecArk) {
        boot();
        return;
      }
      add(`/game/ark-game.js?v=${APP_VERSION}`, boot);
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
