import { useEffect, useRef, useState } from "react";
import { ACH_LOCKED, type Achievement } from "@/data/achievements";
import { evaluateAchievements } from "@/lib/use-achievements";
import { isSoundOn, isVibrateOn } from "@/lib/use-settings";

type Star = { id: number; left: number; delay: number; dur: number; size: number; rot: number; glow: string; kind: "fall" | "burst" };

function buildStars(): Star[] {
  const colors = ["#f6e7c2", "#e8c547", "#fff6d2", "#c9a227", "#ffe27a", "#fff", "#ffd36a"];
  const fall: Star[] = Array.from({ length: 56 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 480,
    dur: 1600 + Math.random() * 1400,
    size: 8 + Math.random() * 18,
    rot: Math.random() * 360,
    glow: colors[i % colors.length],
    kind: "fall" as const,
  }));
  const burst: Star[] = Array.from({ length: 28 }, (_, i) => ({
    id: 100 + i,
    left: 42 + Math.random() * 16,
    delay: Math.random() * 120,
    dur: 900 + Math.random() * 500,
    size: 6 + Math.random() * 12,
    rot: Math.random() * 360,
    glow: colors[i % colors.length],
    kind: "burst" as const,
  }));
  return fall.concat(burst);
}

function fanfare() {
  if (!isSoundOn()) return;
  try {
    const AudioCtx = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = i === notes.length - 1 ? "triangle" : "square";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.09, now + 0.018 + i * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.42 + i * 0.09);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.07);
      osc.stop(now + 0.55 + i * 0.09);
    });
    const shimmer = ctx.createOscillator();
    const sg = ctx.createGain();
    shimmer.type = "sine";
    shimmer.frequency.value = 2093;
    sg.gain.setValueAtTime(0.0001, now);
    sg.gain.exponentialRampToValueAtTime(0.05, now + 0.12);
    sg.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);
    shimmer.connect(sg);
    sg.connect(ctx.destination);
    shimmer.start(now + 0.2);
    shimmer.stop(now + 1);
    window.setTimeout(() => {
      try {
        void ctx.close();
      } catch {
        /* ignore */
      }
    }, 1400);
  } catch {
    /* ignore */
  }
}

function vibe() {
  try {
    if (isVibrateOn()) navigator.vibrate?.([24, 30, 40, 30, 55]);
  } catch {
    /* ignore */
  }
}

export function StarfallHost() {
  const [stars, setStars] = useState<Star[]>([]);
  const [pack, setPack] = useState<Achievement[] | null>(null);
  const dismissRef = useRef<() => void>(() => {});

  useEffect(() => {
    let showing = false;
    const queue: Achievement[][] = [];

    function present(items: Achievement[]) {
      if (!items.length) return;
      if (showing) {
        queue.push(items);
        return;
      }
      showing = true;
      setStars(buildStars());
      setPack(items);
      fanfare();
      vibe();
    }

    function done() {
      setStars([]);
      setPack(null);
      showing = false;
      if (queue.length) present(queue.shift() || []);
    }
    dismissRef.current = done;

    function onUnlock(e: Event) {
      const detail = (e as CustomEvent<Achievement[]>).detail;
      if (Array.isArray(detail) && detail.length) present(detail);
    }

    function scan() {
      evaluateAchievements();
    }

    window.addEventListener("yurec-ach-unlock", onUnlock);
    window.addEventListener("yurec-progress", scan);
    window.addEventListener("yurec-av-wins", scan);
    window.addEventListener("yurec-ark-wins", scan);
    window.addEventListener("yurec-endings", scan);
    window.addEventListener("yurec-svoya", scan);
    window.addEventListener("yurec-license-changed", scan);
    scan();
    return () => {
      window.removeEventListener("yurec-ach-unlock", onUnlock);
      window.removeEventListener("yurec-progress", scan);
      window.removeEventListener("yurec-av-wins", scan);
      window.removeEventListener("yurec-ark-wins", scan);
      window.removeEventListener("yurec-endings", scan);
      window.removeEventListener("yurec-svoya", scan);
      window.removeEventListener("yurec-license-changed", scan);
    };
  }, []);

  if (!pack) return null;
  const one = pack.length === 1 ? pack[0] : null;

  return (
    <div className="starfall" data-testid="starfall" onClick={() => dismissRef.current()}>
      <span className="starfall-flash" aria-hidden="true" />
      {stars.map((s) => (
        <span
          key={s.id}
          className={s.kind === "burst" ? "star-burst" : "star-fall"}
          style={{
            left: `${s.left}%`,
            width: s.size,
            height: s.size,
            animationDelay: `${s.delay}ms`,
            animationDuration: `${s.dur}ms`,
            background: s.glow,
            transform: `rotate(${s.rot}deg)`,
          }}
        />
      ))}
      <div className="starfall-card" onClick={(e) => e.stopPropagation()}>
        {one ? (
          <>
            <img src={one.photo} alt="" className="starfall-shot" />
            <p className="starfall-kicker">Зашквар открыт</p>
            <p className="starfall-title">{one.title}</p>
            <p className="starfall-flavor">{one.flavor}</p>
          </>
        ) : (
          <>
            <div className="starfall-thumbs">
              {pack.slice(0, 4).map((a) => (
                <img key={a.id} src={a.photo || ACH_LOCKED} alt="" />
              ))}
            </div>
            <p className="starfall-kicker">Зашквары двора</p>
            <p className="starfall-title">Открыто {pack.length}</p>
            <p className="starfall-flavor">Двор уже помнил. Медали просто догнали.</p>
          </>
        )}
        <button type="button" className="starfall-close" onClick={() => dismissRef.current()}>
          Закрыть
        </button>
      </div>
    </div>
  );
}
