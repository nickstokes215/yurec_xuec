import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getCharacter } from "@/data/catalog";
import { openZoom } from "@/lib/zoom";

export const Route = createFileRoute("/characters/$id")({ component: CharacterPage });

function backToHeroes(): "/characters" | "/characters/map" {
  try {
    if (sessionStorage.getItem("yurec-char-from") === "map") return "/characters/map";
  } catch {
    /* ignore */
  }
  return "/characters";
}

function CharacterPage() {
  const { id } = Route.useParams();
  const c = getCharacter(id);
  const [qi, setQi] = useState(0);
  const back = backToHeroes();
  useEffect(() => {
    setQi(0);
  }, [id]);

  const quotes = useMemo(() => {
    if (!c) return [];
    const all = [c.quote, ...(c.quotes || [])];
    return all.filter((q, i) => all.indexOf(q) === i);
  }, [c]);

  if (!c) {
    return (
      <main className="px-4 py-10 text-center">
        <p className="text-sm text-muted">Этого героя на Шотмана не нашли.</p>
        <Link to="/characters" className="mt-4 inline-flex h-12 items-center rounded-xl bg-elevated px-4 text-sm">
          К карточкам
        </Link>
      </main>
    );
  }

  const quote = quotes[qi % quotes.length];

  return (
    <main className="pb-8">
      <div className="px-4 pt-4">
        <Link
          to={back}
          className="inline-flex h-10 items-center gap-1.5 text-sm text-muted"
        >
          <ArrowLeft className="size-4" />
          {back === "/characters/map" ? "К карте" : "К героям"}
        </Link>
      </div>
      <div className="relative mt-1">
        <button
          type="button"
          onClick={() => openZoom(c.photo)}
          className="relative block w-full text-left"
          aria-label={`Открыть портрет: ${c.name}`}
        >
          <img src={c.photo} alt={c.name} className={`h-72 w-full object-cover ${["zhiletka", "kurtka", "portret", "svetdom", "granata", "drobovik"].includes(c.id) ? "object-center" : "object-top"}`} />
          <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/20 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 px-4 pb-4">
            <p className="text-[11px] font-medium tracking-[0.16em] text-accent uppercase">{c.vibe}</p>
            <h2 className="mt-1 font-sans text-2xl font-semibold leading-tight">{c.name}</h2>
            <p className="mt-1 text-sm text-muted">{c.role}</p>
          </div>
        </button>
      </div>

      <div className="px-4 pt-4">
        <p className="text-[11px] text-subtle">{c.aka}</p>

        <button
          type="button"
          onClick={() => setQi((n) => n + 1)}
          className="mt-4 w-full rounded-2xl bg-surface px-4 py-4 text-left shadow-[0_0_0_1px_rgba(255,255,255,0.06)]"
        >
          <p className="text-[11px] font-medium tracking-wide text-muted uppercase">Голос · жми</p>
          <p className="mt-2 font-serif text-[17px] leading-relaxed">«{quote}»</p>
        </button>

        <p className="mt-5 font-serif text-[16px] leading-relaxed text-muted">{c.bio}</p>
      </div>
    </main>
  );
}
