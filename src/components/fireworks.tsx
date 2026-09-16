import { Component, useEffect, useState, type ReactNode } from "react";
import { consumeCelebrate, usePaid } from "@/lib/use-paid";

const COLORS = ["#e8c547", "#f4e4a1", "#ff6b4a", "#ffffff", "#c43b6e", "#8a9a4a"];

type Spark = {
  id: string;
  x: number;
  y: number;
  color: string;
  delay: number;
};

function buildSparks(): Spark[] {
  const items: Spark[] = [];
  for (let burst = 0; burst < 6; burst++) {
    const cx = 16 + Math.random() * 68;
    const cy = 14 + Math.random() * 36;
    const color = COLORS[burst % COLORS.length];
    const n = 8;
    for (let i = 0; i < n; i++) {
      const a = (Math.PI * 2 * i) / n + Math.random() * 0.2;
      const dist = 4 + Math.random() * 7;
      items.push({
        id: `${burst}-${i}`,
        x: cx + Math.cos(a) * dist,
        y: cy + Math.sin(a) * dist * 0.55,
        color,
        delay: burst * 140,
      });
    }
  }
  return items;
}

class FireworksBoundary extends Component<{ children: ReactNode }, { dead: boolean }> {
  state = { dead: false };
  static getDerivedStateFromError() {
    return { dead: true };
  }
  componentDidCatch() {
    /* салют не должен ронять приложение */
  }
  render() {
    return this.state.dead ? null : this.props.children;
  }
}

export function playFireworks() {
  window.dispatchEvent(new Event("yurec-fireworks"));
}

function FireworksInner() {
  const { paid } = usePaid();
  const [sparks, setSparks] = useState<Spark[]>([]);

  function boom() {
    setSparks(buildSparks());
    window.setTimeout(() => setSparks([]), 2400);
  }

  useEffect(() => {
    function onFw() {
      try {
        boom();
      } catch {
        /* ignore */
      }
    }
    window.addEventListener("yurec-fireworks", onFw);
    return () => window.removeEventListener("yurec-fireworks", onFw);
  }, []);

  useEffect(() => {
    if (!paid) return;
    let cancelled = false;
    let show = 0;
    let hide = 0;
    show = window.setTimeout(() => {
      try {
        if (cancelled || !consumeCelebrate()) return;
        setSparks(buildSparks());
        hide = window.setTimeout(() => {
          if (!cancelled) setSparks([]);
        }, 2400);
      } catch {
        /* ignore */
      }
    }, 80);
    return () => {
      cancelled = true;
      window.clearTimeout(show);
      window.clearTimeout(hide);
    };
  }, [paid]);

  if (!sparks.length) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[120] overflow-hidden"
      aria-hidden
      data-testid="fireworks"
    >
      {sparks.map((s) => (
        <span
          key={s.id}
          className="fw-spark"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            background: s.color,
            animationDelay: `${s.delay}ms`,
          }}
        />
      ))}
    </div>
  );
}

export function FireworksHost() {
  return (
    <FireworksBoundary>
      <FireworksInner />
    </FireworksBoundary>
  );
}
