import { Pause, Play, Repeat, SkipBack, SkipForward, Volume2 } from "lucide-react";
import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";
import {
  formatQuoteTime,
  QUOTES,
  shuffleQuoteOrder,
  type QuoteClip,
} from "@/data/quotes";
import { cn } from "@/lib/utils";

let sharedAudio: HTMLAudioElement | null = null;
const VOL_KEY = "yurec-quote-vol";

function readQuoteVol() {
  try {
    const raw = localStorage.getItem(VOL_KEY);
    if (raw == null || raw === "") return 100;
    const n = Number(raw);
    if (Number.isFinite(n) && n >= 0 && n <= 100) return Math.round(n);
  } catch {
    /* ignore */
  }
  return 100;
}

function writeQuoteVol(n: number) {
  const v = Math.max(0, Math.min(100, Math.round(n)));
  try {
    localStorage.setItem(VOL_KEY, String(v));
  } catch {
    /* ignore */
  }
  return v;
}

function getAudio() {
  if (!sharedAudio) {
    sharedAudio = new Audio();
    sharedAudio.preload = "none";
  }
  sharedAudio.volume = readQuoteVol() / 100;
  return sharedAudio;
}

function clipAt(order: number[], pos: number): QuoteClip | null {
  if (!order.length) return null;
  return QUOTES[order[pos]] || null;
}

export function QuotePlayer() {
  const [order, setOrder] = useState<number[]>([]);
  const [pos, setPos] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [loop, setLoop] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [vol, setVol] = useState(100);
  const progRef = useRef<HTMLButtonElement>(null);
  const posRef = useRef(pos);
  const orderRef = useRef(order);
  const loopRef = useRef(loop);
  posRef.current = pos;
  orderRef.current = order;
  loopRef.current = loop;

  const clip = clipAt(order, pos);

  function load(nextOrder: number[], nextPos: number, autoplay: boolean) {
    const audio = getAudio();
    const next = clipAt(nextOrder, nextPos);
    if (!next) return;
    if (audio.src !== new URL(next.src, window.location.origin).href) {
      audio.src = next.src;
    }
    audio.loop = loopRef.current;
    orderRef.current = nextOrder;
    posRef.current = nextPos;
    setOrder(nextOrder);
    setPos(nextPos);
    setTime(0);
    if (autoplay) {
      void audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    }
  }

  function ensureOrder() {
    if (orderRef.current.length) return orderRef.current;
    const shuffled = shuffleQuoteOrder(QUOTES.length);
    orderRef.current = shuffled;
    setOrder(shuffled);
    return shuffled;
  }

  function playPause() {
    const audio = getAudio();
    if (playing && !audio.paused) {
      audio.pause();
      setPlaying(false);
      return;
    }
    const nextOrder = ensureOrder();
    const nextPos = orderRef.current.length ? posRef.current : 0;
    load(nextOrder, nextPos, true);
  }

  function next() {
    const current = orderRef.current.length ? orderRef.current : ensureOrder();
    const last = current[posRef.current];
    let nextOrder = current;
    let nextPos = posRef.current + 1;
    if (nextPos >= nextOrder.length) {
      nextOrder = shuffleQuoteOrder(QUOTES.length, last);
      nextPos = 0;
    }
    load(nextOrder, nextPos, true);
  }

  function prev() {
    const audio = getAudio();
    if (audio.currentTime > 2) {
      audio.currentTime = 0;
      setTime(0);
      return;
    }
    const current = orderRef.current.length ? orderRef.current : ensureOrder();
    const nextPos = (posRef.current - 1 + current.length) % current.length;
    load(current, nextPos, true);
  }

  function toggleLoop() {
    const on = !loopRef.current;
    setLoop(on);
    getAudio().loop = on;
  }

  function seek(ev: MouseEvent<HTMLButtonElement>) {
    const audio = getAudio();
    const dur = audio.duration;
    if (!Number.isFinite(dur) || dur <= 0) return;
    const rect = ev.currentTarget.getBoundingClientRect();
    const x = Math.min(1, Math.max(0, (ev.clientX - rect.left) / rect.width));
    audio.currentTime = x * dur;
    setTime(audio.currentTime);
  }

  function changeVol(next: number) {
    const v = writeQuoteVol(next);
    setVol(v);
    getAudio().volume = v / 100;
  }

  useEffect(() => {
    const audio = getAudio();
    setVol(readQuoteVol());
    audio.volume = readQuoteVol() / 100;
    const onTime = () => {
      setTime(audio.currentTime || 0);
      setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
    };
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onEnded = () => {
      setPlaying(false);
      setTime(0);
      try {
        audio.currentTime = 0;
      } catch {
        /* ignore */
      }
    };
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onTime);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);
    const onVis = () => {
      if (document.hidden) {
        audio.pause();
        setPlaying(false);
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onTime);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
      audio.pause();
      try {
        audio.removeAttribute("src");
        audio.load();
      } catch {
        /* ignore */
      }
      setPlaying(false);
      setOrder([]);
      setPos(0);
      setTime(0);
      setDuration(0);
    };
    // next() читает refs — слушатели вешаются один раз
  }, []);

  if (!QUOTES.length) return null;

  const pct = duration > 0 ? Math.min(100, (time / duration) * 100) : 0;
  const speaker = clip?.speaker || "Случайный голос";
  const title = clip?.title || "Жми play — двор орёт сам";

  return (
    <section
      className="rounded-xl bg-surface px-4 py-3.5 shadow-[0_0_0_1px_rgba(255,255,255,0.06)]"
      aria-label="Плеер цитат"
    >
      <p className="text-[11px] font-medium tracking-[0.16em] text-muted uppercase">Голос двора</p>
      <div className="mt-2 flex items-center gap-2">
        {playing ? <span className="size-1.5 shrink-0 rounded-full bg-accent" aria-hidden /> : null}
        <p className="truncate font-sans text-lg font-semibold leading-tight">{speaker}</p>
      </div>
      <p className="mt-0.5 truncate font-serif text-sm italic leading-snug text-muted">«{title}»</p>

      <button
        ref={progRef}
        type="button"
        aria-label="Перемотка"
        onClick={seek}
        className="mt-3 block h-6 w-full"
      >
        <span className="block h-1 overflow-hidden rounded-full bg-elevated">
          <span className="block h-full rounded-full bg-accent" style={{ width: pct + "%" }} />
        </span>
      </button>
      <div className="mt-1 flex justify-between text-[11px] tabular-nums text-subtle">
        <span>{formatQuoteTime(time)}</span>
        <span>{formatQuoteTime(duration)}</span>
      </div>

      <div className="mt-2 flex items-center gap-2">
        <div className="flex min-w-0 flex-1 items-center justify-center gap-2">
          <IconBtn label="Назад" onClick={prev}>
            <SkipBack className="size-5" fill="currentColor" />
          </IconBtn>
          <IconBtn label={playing ? "Пауза" : "Играть"} onClick={playPause} primary>
            {playing ? <Pause className="size-6" fill="currentColor" /> : <Play className="size-6" fill="currentColor" />}
          </IconBtn>
          <IconBtn label="Дальше" onClick={next}>
            <SkipForward className="size-5" fill="currentColor" />
          </IconBtn>
          <IconBtn label="Повторить" onClick={toggleLoop} pressed={loop}>
            <Repeat className="size-5" />
          </IconBtn>
        </div>
        <div className="flex w-[5.25rem] shrink-0 items-center gap-1">
          <Volume2 className="size-3.5 shrink-0 text-muted" aria-hidden />
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={vol}
            aria-label={`Громкость ${vol}%`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={vol}
            onChange={(e) => changeVol(Number(e.target.value))}
            className="h-5 min-w-0 flex-1 accent-accent"
          />
        </div>
      </div>
    </section>
  );
}

function IconBtn({
  label,
  onClick,
  children,
  primary,
  pressed,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
  primary?: boolean;
  pressed?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={pressed}
      onClick={onClick}
      className={cn(
        "inline-flex items-center justify-center rounded-full text-fg transition-[transform,background-color,opacity] duration-150 ease-out active:scale-[0.92]",
        primary ? "size-14 bg-accent text-accent-fg" : "size-11 bg-elevated",
        pressed && !primary ? "bg-accent text-accent-fg" : null,
      )}
    >
      {children}
    </button>
  );
}
