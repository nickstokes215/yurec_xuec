import { useEffect, useRef, useState } from "react";
import { ACH_LOCKED, type Achievement } from "@/data/achievements";
import { evaluateAchievements } from "@/lib/use-achievements";
import { isSoundOn, isVibrateOn } from "@/lib/use-settings";

type Star = { id: number; left: number; delay: number; dur: number; size: number; rot: number; glow: string };

function buildStars(): Star[] {
  const colors = ["#f6e7c2", "#e8c547", "#fff6d2", "#c9a227", "#ffe27a"];
  return Array.from({ length: 48 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 700,
    dur: 1800 + Math.random() * 1200,
    size: 8 + Math.random() * 16,
    rot: Math.random() * 360,
    glow: colors[i % colors.length],
  }));
}

function chime() {
  if (!isSoundOn()) return;
  try {
    const AudioCtx = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;
    const notes = [784, 1175, 1568];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.08, now + 0.02 + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.55 + i * 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.08);
      osc.stop(now + 0.7 + i * 0.08);
    });
    window.setTimeout(() => {
      try {
        void ctx.close();
      } catch {
        /* ignore */
      }
    }, 1200);
  } catch {
    /* ignore */
  }
}

function vibe() {
  try {
    if (isVibrateOn()) navigator.vibrate?.([18, 40, 28]);
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
    const wait: Achievement[][] = [];

    function inGame() {
      return document.body.classList.contains("av-nodock");
    }

    function present(items: Achievement[]) {
      if (!items.length) return;
      if (inGame()) {
        wait.push(items);
        return;
      }
      if (showing) {
        queue.push(items);
        return;
      }
      showing = true;
      setStars(buildStars());
      setPack(items);
      chime();
      vibe();
    }

    function done() {
      setStars([]);
      setPack(null);
      showing = false;
      if (queue.length) present(queue.shift() || []);
    }
    dismissRef.current = done;

    function flushWait() {
      if (inGame() || !wait.length) return;
      const batch = wait.flat();
      wait.length = 0;
      present(batch);
    }

    function onUnlock(e: Event) {
      const detail = (e as CustomEvent<Achievement[]>).detail;
      if (Array.isArray(detail) && detail.length) present(detail);
    }

    function scan() {
      evaluateAchievements();
      flushWait();
    }

    window.addEventListener("yurec-ach-unlock", onUnlock);
    window.addEventListener("yurec-progress", scan);
    window.addEventListener("yurec-av-wins", scan);
    window.addEventListener("yurec-ark-wins", scan);
    window.addEventListener("yurec-endings", scan);
    window.addEventListener("yurec-license-changed", scan);
    const tick = window.setInterval(flushWait, 600);
    scan();
    return () => {
      window.clearInterval(tick);
      window.removeEventListener("yurec-ach-unlock", onUnlock);
      window.removeEventListener("yurec-progress", scan);
      window.removeEventListener("yurec-av-wins", scan);
      window.removeEventListener("yurec-ark-wins", scan);
      window.removeEventListener("yurec-endings", scan);
      window.removeEventListener("yurec-license-changed", scan);
    };
  }, []);

  if (!pack) return null;
  const one = pack.length === 1 ? pack[0] : null;

  return (
    <div className="starfall" data-testid="starfall" onClick={() => dismissRef.current()}>
      {stars.map((s) => (
        <span
          key={s.id}
          className="star-fall"
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
