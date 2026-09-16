import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { getCharacter } from "@/data/catalog";
import { getYardLayer, YARD_LAYERS, type YardLayer, type YardPin } from "@/data/yard-map";
import { cn } from "@/lib/utils";

const LAYER_KEY = "yurec-yard-layer";
const CRUMB = [
  { id: "peter", label: "Петербург" },
  { id: "yard", label: "Шотмана" },
  { id: "flat", label: "Трёшка" },
] as const;

function readLayer() {
  try {
    const id = sessionStorage.getItem(LAYER_KEY);
    if (id && YARD_LAYERS.some((l) => l.id === id)) return id;
  } catch {
    /* ignore */
  }
  return "peter";
}

function writeLayer(id: string) {
  try {
    sessionStorage.setItem(LAYER_KEY, id);
  } catch {
    /* ignore */
  }
}

export function YardMap() {
  const [layerId, setLayerId] = useState("peter");
  const [openId, setOpenId] = useState<string | null>(null);
  const layerIdRef = useRef(layerId);
  const openRef = useRef(openId);
  const navigate = useNavigate();
  layerIdRef.current = layerId;
  openRef.current = openId;

  useEffect(() => {
    setLayerId(readLayer());
  }, []);

  function goLayer(id: string) {
    setOpenId(null);
    setLayerId(id);
    writeLayer(id);
  }

  useEffect(() => {
    const w = window as Window & { yurecBack?: () => boolean };
    const prev = w.yurecBack;
    const onBack = () => {
      if (openRef.current) {
        setOpenId(null);
        return true;
      }
      const cur = layerIdRef.current;
      if (cur === "flat") {
        goLayer("yard");
        return true;
      }
      if (cur === "yard") {
        goLayer("peter");
        return true;
      }
      if (typeof prev === "function" && prev()) return true;
      return false;
    };
    w.yurecBack = onBack;
    return () => {
      if (w.yurecBack === onBack) w.yurecBack = prev;
    };
  }, []);

  const layer = getYardLayer(layerId);
  const pin = layer.pins.find((p) => p.id === openId) || null;
  const crumbAt = CRUMB.findIndex((c) => c.id === layer.id);

  return (
    <main className="px-4 pt-4 pb-10">
      <Link
        to="/characters"
        className="inline-flex h-10 items-center gap-1.5 text-sm text-muted"
        onClick={() => {
          try {
            sessionStorage.removeItem("yurec-char-from");
          } catch {
            /* ignore */
          }
        }}
      >
        <ArrowLeft className="size-4" />
        К героям
      </Link>

      <p className="mt-3 text-[11px] font-medium tracking-[0.16em] text-muted uppercase">{layer.kicker}</p>
      <h2 className="mt-1 font-sans text-2xl font-semibold leading-tight">{layer.title}</h2>

      <nav className="mt-3 flex flex-wrap items-center gap-1.5 text-[13px]" aria-label="Слои карты">
        {CRUMB.map((c, i) => {
          const on = i === crumbAt;
          return (
            <span key={c.id} className="inline-flex items-center gap-1">
              {i > 0 ? <ChevronRight className="size-3.5 text-subtle" aria-hidden /> : null}
              <button
                type="button"
                onClick={() => goLayer(c.id)}
                aria-current={on ? "page" : undefined}
                className={cn(
                  "rounded-full px-2.5 py-1 font-medium",
                  on ? "bg-hero text-white" : "bg-elevated text-muted",
                )}
              >
                {c.label}
              </button>
            </span>
          );
        })}
      </nav>

      <p className="mt-2 font-serif text-[15px] leading-relaxed text-muted">{layer.hint}</p>

      <MapStage
        layer={layer}
        openId={openId}
        onPin={(id) => setOpenId((cur) => (cur === id ? null : id))}
      />

      {pin ? (
        <PinSheet
          pin={pin}
          onClose={() => setOpenId(null)}
          onGoto={(id) => goLayer(id)}
          onChar={(id) => {
            writeLayer(layerId);
            try {
              sessionStorage.setItem("yurec-char-from", "map");
            } catch {
              /* ignore */
            }
            void navigate({ to: "/characters/$id", params: { id } });
          }}
        />
      ) : null}
    </main>
  );
}

function MapStage({
  layer,
  openId,
  onPin,
}: {
  layer: YardLayer;
  openId: string | null;
  onPin: (id: string) => void;
}) {
  const placed = layer.pins.filter((p) => p.cloud || !p.offscreen);
  const dock = layer.pins.filter((p) => p.offscreen && !p.cloud);
  return (
    <div className={cn("ymap-scroller mt-4", layer.wide && "is-wide")}>
      <div className={cn("ymap-stage", layer.wide && "is-wide")} data-layer={layer.id}>
        <img src={layer.src} alt={layer.title} draggable={false} />
        {placed.map((p) => {
          const ch = p.char ? getCharacter(p.char) : undefined;
          const thumb = p.thumb || ch?.photo;
          const isFace = Boolean(thumb) && (p.cloud || p.kind === "goto" || layer.id === "peter");
          return (
            <button
              key={p.id}
              type="button"
              className={cn(
                "ymap-pin",
                p.kind === "goto" && "is-goto",
                p.cloud && "is-cloud",
                isFace && "is-face",
                p.tone && `is-${p.tone}`,
                openId === p.id && "is-on",
              )}
              style={{ left: `${p.x}%`, top: `${p.y}%` }}
              aria-label={p.cloud ? `${p.label}, за кадром` : p.kind === "goto" ? `${p.label}, войти` : p.label}
              aria-pressed={openId === p.id}
              onClick={() => onPin(p.id)}
            >
              {isFace ? (
                <span className="ymap-bubble" aria-hidden>
                  <img src={thumb} alt="" />
                  {p.kind === "goto" ? <span className="ymap-go">▸</span> : null}
                </span>
              ) : p.kind === "goto" ? (
                <span className="ymap-dot" aria-hidden>
                  <span className="ymap-go">▸</span>
                </span>
              ) : (
                <span className="ymap-dot" aria-hidden />
              )}
              <span className="ymap-name">{p.kind === "goto" ? `${p.label} ▸` : p.label}</span>
            </button>
          );
        })}
        {dock.length ? (
          <div className="ymap-off">
            <span className="ymap-off-lab">За кадром</span>
            {dock.map((p) => (
              <button
                key={p.id}
                type="button"
                className={cn("ymap-off-pin", openId === p.id && "is-on")}
                aria-label={`${p.label}, за кадром`}
                aria-pressed={openId === p.id}
                onClick={() => onPin(p.id)}
              >
                {p.label}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function PinSheet({
  pin,
  onClose,
  onGoto,
  onChar,
}: {
  pin: YardPin;
  onClose: () => void;
  onGoto: (id: string) => void;
  onChar: (id: string) => void;
}) {
  const ch = pin.char ? getCharacter(pin.char) : undefined;
  return (
    <aside className="ymap-sheet mt-4" aria-live="polite">
      <div className="flex items-start gap-3">
        {ch ? (
          <img src={ch.photo} alt="" className="size-14 shrink-0 rounded-xl object-cover" />
        ) : null}
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium tracking-[0.14em] text-muted uppercase">
            {pin.offscreen || pin.cloud ? "За кадром" : pin.kind === "goto" ? "Войти" : ch ? ch.role : "Точка двора"}
          </p>
          <h3 className="mt-0.5 font-sans text-lg font-semibold leading-tight">{pin.label}</h3>
        </div>
        <button type="button" onClick={onClose} className="grid size-9 shrink-0 place-items-center rounded-lg text-muted" aria-label="Закрыть">
          ×
        </button>
      </div>
      <p className="mt-3 font-serif text-[15px] leading-relaxed text-muted">{pin.blurb}</p>
      <div className="mt-3 flex flex-col gap-2">
        {pin.kind === "goto" && pin.goto ? (
          <button
            type="button"
            onClick={() => onGoto(pin.goto!)}
            className="grid h-11 w-full place-items-center rounded-xl bg-hero text-sm font-medium text-hero-fg"
          >
            {pin.goto === "yard" ? "Спуститься во двор" : "Войти в трёшку"}
          </button>
        ) : null}
        {ch ? (
          <button
            type="button"
            onClick={() => onChar(ch.id)}
            className="grid h-11 w-full place-items-center rounded-xl bg-elevated text-sm font-medium"
          >
            Карточка: {ch.name}
          </button>
        ) : null}
      </div>
    </aside>
  );
}
