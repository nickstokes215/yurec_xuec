import { useEffect, useState } from "react";

type Drop = { id: number; left: number; delay: number; dur: number; h: number };

function buildDrops(): Drop[] {
  return Array.from({ length: 42 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 400,
    dur: 700 + Math.random() * 700,
    h: 12 + Math.random() * 16,
  }));
}

export function playRain() {
  window.dispatchEvent(new Event("yurec-rain"));
}

export function RainHost() {
  const [drops, setDrops] = useState<Drop[]>([]);

  useEffect(() => {
    function onRain() {
      setDrops(buildDrops());
      window.setTimeout(() => setDrops([]), 2200);
    }
    window.addEventListener("yurec-rain", onRain);
    return () => window.removeEventListener("yurec-rain", onRain);
  }, []);

  if (!drops.length) return null;

  return (
    <div className="rain-layer" aria-hidden data-testid="rain">
      {drops.map((d) => (
        <span
          key={d.id}
          className="rain-drop"
          style={{
            left: `${d.left}%`,
            height: `${d.h}px`,
            animationDelay: `${d.delay}ms`,
            animationDuration: `${d.dur}ms`,
          }}
        />
      ))}
    </div>
  );
}
