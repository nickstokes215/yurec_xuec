import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { playExternal, type OfflineItem, offlineItems, isOfflineAudio } from "@/lib/offline";

type Detail = { src: string; title: string; id: string };

export function OfflinePlayer() {
  const [open, setOpen] = useState(false);
  const [src, setSrc] = useState("");
  const [title, setTitle] = useState("");
  const [id, setId] = useState("");
  const media = useRef<HTMLMediaElement>(null);
  const pushed = useRef(false);
  const openRef = useRef(open);
  openRef.current = open;

  const close = useCallback(() => {
    const el = media.current;
    if (el) {
      el.pause();
      el.removeAttribute("src");
      el.load();
    }
    if (src.startsWith("blob:")) {
      try {
        URL.revokeObjectURL(src);
      } catch {
        /* ignore */
      }
    }
    setOpen(false);
    setSrc("");
    if (pushed.current) {
      pushed.current = false;
      try {
        history.back();
      } catch {
        /* ignore */
      }
    }
  }, [src]);

  useEffect(() => {
    function onOpen(e: Event) {
      const d = (e as CustomEvent<Detail>).detail;
      if (!d?.src) return;
      setSrc(d.src);
      setTitle(d.title || "Оффлайн");
      setId(d.id || "");
      setOpen(true);
      if (!pushed.current) {
        try {
          history.pushState({ yurecOff: 1 }, "", location.href);
          pushed.current = true;
        } catch {
          /* ignore */
        }
      }
    }
    function onPop() {
      if (!open && !pushed.current) return;
      pushed.current = false;
      setOpen(false);
      setSrc("");
    }
    window.addEventListener("yurec-offline-play", onOpen);
    window.addEventListener("popstate", onPop);
    return () => {
      window.removeEventListener("yurec-offline-play", onOpen);
      window.removeEventListener("popstate", onPop);
    };
  }, [open]);

  useEffect(() => {
    const prev = (window as Window & { yurecBack?: () => boolean }).yurecBack;
    const onBack = () => {
      if (openRef.current) {
        close();
        return true;
      }
      return prev ? prev() : false;
    };
    (window as Window & { yurecBack?: () => boolean }).yurecBack = onBack;
    return () => {
      const w = window as Window & { yurecBack?: () => boolean };
      if (w.yurecBack === onBack) w.yurecBack = prev;
    };
  }, [close]);

  if (!open) return null;
  const item = offlineItems().find((x) => x.id === id) as OfflineItem | undefined;
  const audio = item ? isOfflineAudio(item) : src.toLowerCase().includes(".mp3");
  return (
    <div className="fixed inset-0 z-[80] flex flex-col bg-black">
      <div className="flex items-center gap-2 px-3 py-2">
        <button type="button" onClick={close} className="h-10 rounded-full bg-[#2c2c34] px-3 text-xs font-medium text-fg">
          Закрыть
        </button>
        <p className="min-w-0 flex-1 truncate text-sm font-medium">{title}</p>
        {item ? (
          <button
            type="button"
            onClick={() => playExternal(item)}
            className="h-10 rounded-full bg-[#2c2c34] px-3 text-xs font-medium text-fg"
          >
            Другой плеер
          </button>
        ) : null}
      </div>
      {audio ? (
        <div className="grid flex-1 place-items-center px-6">
          <audio ref={media as RefObject<HTMLAudioElement>} src={src} controls autoPlay className="w-full" />
        </div>
      ) : (
        <video ref={media as RefObject<HTMLVideoElement>} src={src} controls playsInline autoPlay className="min-h-0 w-full flex-1 bg-black" />
      )}
    </div>
  );
}
