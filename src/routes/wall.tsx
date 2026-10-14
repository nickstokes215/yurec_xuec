import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { addWall, readWall, removeWall, type WallNote } from "@/lib/yard-life";

export const Route = createFileRoute("/wall")({ component: WallPage });

function WallPage() {
  const [notes, setNotes] = useState<WallNote[]>(() => readWall());
  const [text, setText] = useState("");

  function write() {
    const next = addWall(text);
    setNotes(next);
    setText("");
  }

  return (
    <main className="px-4 pt-4 pb-10">
      <Link to="/characters" className="inline-flex h-10 items-center gap-1.5 text-sm text-muted">
        <ArrowLeft className="size-4" />
        К героям
      </Link>
      <p className="mt-3 text-[11px] font-medium tracking-[0.16em] text-muted uppercase">Подъезд</p>
      <h2 className="mt-1 font-sans text-2xl font-semibold leading-tight">Стена</h2>
      <p className="mt-2 font-serif text-[16px] leading-relaxed text-muted">
        Мел только на этом телефоне. Чужих комментариев нет. Надписи уезжают вместе со справкой из настроек.
      </p>
      <section className="wall mt-4">
        <ul className="wall-list">
          {notes.length === 0 ? <li className="wall-empty">Стена голая. Сосед ещё не видел.</li> : null}
          {notes.map((n) => (
            <li key={n.id}>
              <p>{n.text}</p>
              <button type="button" aria-label="Стереть" onClick={() => setNotes(removeWall(n.id))}>
                ×
              </button>
            </li>
          ))}
        </ul>
        <form
          className="wall-form"
          onSubmit={(e) => {
            e.preventDefault();
            write();
          }}
        >
          <input
            value={text}
            maxLength={120}
            placeholder="Написать мелом…"
            onChange={(e) => setText(e.target.value)}
          />
          <button type="submit">Мел</button>
        </form>
      </section>
    </main>
  );
}
