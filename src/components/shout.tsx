import { useEffect, useState } from "react";
import { takeShout } from "@/lib/yard-life";

export function ShoutHost() {
  const [text, setText] = useState<string | null>(null);

  useEffect(() => {
    const t = window.setTimeout(() => {
      const p = window.location.pathname;
      if (p.startsWith("/game/av") || p.startsWith("/game/ark")) return;
      const line = takeShout();
      if (line) setText(line);
    }, 800);
    return () => window.clearTimeout(t);
  }, []);

  if (!text) return null;
  return (
    <button type="button" className="shout" onClick={() => setText(null)}>
      <span className="shout-k">Юрец с порога</span>
      <span className="shout-t">{text}</span>
    </button>
  );
}