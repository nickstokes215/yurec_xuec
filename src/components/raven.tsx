import { useEffect, useState } from "react";

const MS = 5000;

function playKar() {
  try {
    if (localStorage.getItem("yurec-sound") === "0") return null;
  } catch {
    /* ignore */
  }
  const a = new Audio();
  a.src = "/quotes/gosha-kar.mp3";
  a.loop = true;
  a.play().catch(() => {
    a.src = "quotes/gosha-kar.mp3";
    a.loop = true;
    void a.play().catch(() => {});
  });
  return a;
}

export function RavenHost() {
  const [on, setOn] = useState(false);

  useEffect(() => {
    function start() {
      setOn(true);
    }
    window.addEventListener("yurec-raven", start);
    return () => window.removeEventListener("yurec-raven", start);
  }, []);

  useEffect(() => {
    if (!on) return;
    const html = document.documentElement;
    html.classList.add("modal-lock");
    const audio = playKar();
    const t = window.setTimeout(() => setOn(false), MS);
    const w = window as Window & { yurecBack?: () => boolean };
    const prev = w.yurecBack;
    const onBack = () => {
      setOn(false);
      return true;
    };
    w.yurecBack = onBack;
    return () => {
      window.clearTimeout(t);
      html.classList.remove("modal-lock");
      if (audio) {
        try {
          audio.pause();
          audio.src = "";
        } catch {
          /* ignore */
        }
      }
      if (w.yurecBack === onBack) w.yurecBack = prev;
    };
  }, [on]);

  if (!on) return null;
  return (
    <div className="raven-joke" role="dialog" aria-label="Гоша">
      <span className="raven-joke-sky" />
      <svg className="raven-joke-bird" viewBox="0 0 64 40" aria-hidden="true">
        <path
          fill="#0a0a0c"
          stroke="#c9a227"
          strokeWidth="1.2"
          d="M8 22c6-10 16-16 28-14 6 1 12 5 18 2-4 6-8 10-6 16 2 5-2 10-8 11-8 1-16-2-22-7-4 4-8 6-12 5 4-4 6-8 2-13z"
        />
        <circle cx="46" cy="14" r="2.2" fill="#c9a227" />
        <path fill="#c9a227" d="M52 13l10 2-10 3z" />
      </svg>
      <p className="raven-joke-word">РЕВЭЛ</p>
      <p className="raven-joke-sub">кар-кар</p>
    </div>
  );
}
