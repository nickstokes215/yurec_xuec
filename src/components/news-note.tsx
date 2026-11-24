import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { APP_VERSION, CHANGELOG } from "@/data/catalog";
import { shouldAutoTour } from "@/lib/use-tour";

const NEWS_KEY = "yurec-news";

export function NewsHost() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const row = CHANGELOG.find((item) => item.version === APP_VERSION) || CHANGELOG[0];

  useEffect(() => {
    if (shouldAutoTour()) {
      try {
        localStorage.setItem(NEWS_KEY, APP_VERSION);
      } catch {
        /* ignore */
      }
      return;
    }
    let seen = "";
    try {
      seen = localStorage.getItem(NEWS_KEY) || "";
    } catch {
      seen = APP_VERSION;
    }
    if (seen !== APP_VERSION) setOpen(true);
  }, []);

  function close(goHistory: boolean) {
    try {
      localStorage.setItem(NEWS_KEY, APP_VERSION);
    } catch {
      /* ignore */
    }
    setOpen(false);
    if (goHistory) void navigate({ to: "/changelog" });
  }

  if (!open || !row) return null;
  return (
    <div className="news-root" role="dialog" aria-label="Что нового">
      <div className="news-card">
        <p className="text-[11px] font-medium tracking-[0.16em] text-muted uppercase">Что нового</p>
        <h3>Версия {row.version}</h3>
        <ul className="news-list">
          {row.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <button type="button" className="btn wide gold" onClick={() => close(false)}>
          Понятно
        </button>
        <button type="button" className="btn wide" onClick={() => close(true)}>
          Вся история
        </button>
      </div>
    </div>
  );
}
