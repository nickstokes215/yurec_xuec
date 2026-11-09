import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  Bell,
  Bug,
  BookOpen,
  BookCheck,
  Code2,
  Columns3,
  Trophy,
  ArchiveRestore,
  Github,
  Download,
  ExternalLink,
  Eye,
  EyeOff,
  Gamepad2,
  Monitor,
  Moon,
  Palette,
  Phone,
  Quote,
  Shield,
  Smartphone,
  Share2,
  Sparkles,
  Sun,
  Type,
  Tv,
  Users,
  Volume2,
  VolumeX,
  Vibrate,
  Youtube,
  GraduationCap,
  KeyRound,
} from "lucide-react";
import { ImagePlus } from "lucide-react";
import {
  POST_FONTS,
  POST_PAPERS,
  POST_PATTERNS,
  drawPostcardPreview,
  postcardFolder,
  readPostcard,
  shrinkPostcardFile,
  writePostcard,
  type PostcardPrefs,
} from "@/lib/postcard";
import { APP_VERSION, GITHUB_APK_URL } from "@/data/catalog";
import { notesAsk, notesHHMM, notesHint, notesMinutes, notesTest, readNotesPlan, rollMinute, setNotesPlan, type NoteChan, type NotePlan } from "@/lib/notes";
import { useTheme, type ThemeChoice } from "@/lib/use-theme";
import { FONT_DEFAULT, FONT_MAX, FONT_MIN, setReaderFont, useReaderFont, type FontSource } from "@/lib/use-font";
import {
  DEV_CHAT_URL,
  STUDIO_URL,
  SUPPORT_MAIL,
  SUPPORT_TG,
  UPDATE_URL,
  TG_UPDATE_URL,
  buildBugBody,
  openSupportMail,
  openKingDial,
  useBookmarksNav,
  useInfoNav,
  useZashNav,
  useCitatsNav,
  useAiNav,
  useAiTop,
  useAiKeep,
  useWidgetHours,
  pinQuoteWidget,
  WIDGET_HOURS,
  useReaderScrub,
  useDeveloper,
  useAppIcon,
  useAppName,
  useVibrate,
  useSound,
  useKeepAwake,
  APP_ICONS,
  APP_NAMES,
  deviceInfoBlock,
} from "@/lib/use-settings";
import { usePaid } from "@/lib/use-paid";
import { clearAllRead, useReadCount } from "@/lib/use-read";
import { playRain } from "@/components/rain";
import { resetCharOrder } from "@/lib/use-char-order";
import { resetGameOrder } from "@/lib/use-game-order";
import { exportBackup, parseBackup, applyBackup } from "@/lib/use-backup";
import {
  AI_SHARE_KEY,
  clearChatLog,
  migrateChatLog,
  pinChatShortcut,
} from "@/lib/yurec-chat-store";
import { cn } from "@/lib/utils";
import { startTour } from "@/lib/use-tour";
import { applyAdminCheat, CHEAT_BOOK, CHEAT_MSG, type CheatKind } from "@/lib/use-cheat";
import { playFireworks } from "@/components/fireworks";

function NoteLane({
  title,
  text,
  chan,
  allowSpan,
  onChange,
  onTest,
}: {
  title: string;
  text: string;
  chan: NoteChan;
  allowSpan?: boolean;
  onChange: (next: NoteChan) => void;
  onTest: () => void;
}) {
  const timed = chan.on && chan.mode !== "span";
  const shown = timed && chan.min >= 0 ? notesHHMM(chan.min) : "08:00";
  return (
    <div className="mt-3 rounded-xl bg-elevated px-3 py-3">
      <label className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium">{title}</span>
        <input
          type="checkbox"
          checked={chan.on}
          onChange={(e) => onChange({ ...chan, on: e.target.checked })}
          className="size-5 accent-[var(--color-gold,#c9a227)]"
        />
      </label>
      <p className="mt-1 text-[12px] leading-relaxed text-subtle">{text}</p>
      {allowSpan ? (
        <label className="mt-3 flex items-center justify-between gap-3">
          <span className="text-sm text-subtle">Своё время</span>
          <input
            type="checkbox"
            checked={chan.on && chan.mode !== "span"}
            onChange={(e) =>
              onChange(
                e.target.checked
                  ? { on: true, mode: "clock", min: chan.min >= 0 ? chan.min : 8 * 60 }
                  : { on: true, mode: "span", min: -1 },
              )
            }
            className="size-5 accent-[var(--color-gold,#c9a227)]"
          />
        </label>
      ) : null}
      <label className="mt-3 flex min-h-12 items-center justify-between gap-3">
        <span className="text-sm text-subtle">Когда стучать</span>
        <input
          type="time"
          value={shown}
          disabled={!timed}
          onChange={(e) => {
            const min = notesMinutes(e.target.value || "08:00");
            onChange({ on: true, mode: "clock", min: min < 0 ? 8 * 60 : min });
          }}
          className="h-10 w-32 shrink-0 rounded-lg bg-surface px-2 text-sm text-fg disabled:opacity-40"
        />
      </label>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => onChange({ on: true, mode: "random", min: rollMinute() })}
          className="h-10 flex-1 rounded-xl bg-surface text-sm font-medium"
        >
          Рандом
        </button>
        <button
          type="button"
          onClick={() => onChange({ on: true, mode: "clock", min: 8 * 60 })}
          className="h-10 flex-1 rounded-xl bg-surface text-sm font-medium"
        >
          По умолчанию
        </button>
      </div>
      {chan.mode === "random" && chan.on ? (
        <p className="mt-2 text-center text-[11px] text-subtle">Случайный час на эти сутки: {shown}. Завтра выпадет другой.</p>
      ) : null}
      <button type="button" onClick={onTest} className="mt-3 flex h-10 w-full items-center justify-center rounded-xl bg-surface text-sm font-medium">
        Проверить «{title}»
      </button>
    </div>
  );
}

export const Route = createFileRoute("/settings")({ component: SettingsPage });

function SettingsPage() {
  const theme = useTheme();
  const books = useBookmarksNav();
  const citats = useCitatsNav();
  const info = useInfoNav();
  const zash = useZashNav();
  const ai = useAiNav();
  const aiTop = useAiTop();
  const aiKeep = useAiKeep();
  const widget = useWidgetHours();
  const [widgetNote, setWidgetNote] = useState("");
  const scrub = useReaderScrub();
  const vibe = useVibrate();
  const sound = useSound();
  const awake = useKeepAwake();
  const dev = useDeveloper();
  const { paid } = usePaid();
  const icon = useAppIcon();
  const appName = useAppName();
  const readN = useReadCount();
  const [bugOpen, setBugOpen] = useState(false);
  const [devOpen, setDevOpen] = useState(false);
  const [cheatOpen, setCheatOpen] = useState(false);
  const [bookOpen, setBookOpen] = useState(false);
  const [lockOpen, setLockOpen] = useState(false);
  const [wipeRead, setWipeRead] = useState(false);
  const [wipeChar, setWipeChar] = useState(false);
  const [wipeGames, setWipeGames] = useState(false);
  const [bakMsg, setBakMsg] = useState("");
  const [bakErr, setBakErr] = useState("");
  const [bakAsk, setBakAsk] = useState(false);
  const [wipeChat, setWipeChat] = useState(false);
  const [notesMsg, setNotesMsg] = useState("");
  const [notesPlan, setNotesPlanUi] = useState<NotePlan>(readNotesPlan);
  const [aiNote, setAiNote] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  const [setQ, setSetQ] = useState("");
  const navigate = useNavigate();

  useLayoutEffect(() => {
    const root = mainRef.current;
    if (!root) return;
    const q = setQ.trim().toLowerCase().replace(/ё/g, "е").replace(/\s+/g, " ");
    const parts = q.split(" ").filter(Boolean);
    root.querySelectorAll<HTMLElement>("section, [data-set-find]").forEach((el) => {
      if (el.id === "set-search") return;
      const text = (el.textContent || "").toLowerCase().replace(/ё/g, "е");
      el.hidden = parts.length > 0 && parts.some((part) => !text.includes(part));
    });
  });

  return (
    <main ref={mainRef} className="px-4 pt-4 pb-10">
      <section id="set-search" data-tour="set-search" className="rounded-2xl bg-surface px-4 py-4 shadow-[0_0_0_1px_rgba(255,255,255,0.06)]">
        <p className="text-center text-[11px] font-medium tracking-[0.14em] text-muted uppercase">Поиск</p>
        <p className="mt-1 text-center text-[13px] leading-relaxed text-subtle">
          Ключевое слово: звук, открытка, читы, виджет. Карточки без этого слова прячутся.
        </p>
        <input
          value={setQ}
          onChange={(e) => setSetQ(e.target.value)}
          placeholder="Найти настройку…"
          aria-label="Поиск настроек"
          className="mt-3 h-12 w-full rounded-2xl bg-elevated px-4 text-center text-sm text-fg outline-none"
        />
      </section>

      <p className="mt-6 text-center text-[11px] font-medium tracking-[0.16em] text-muted uppercase">Приложение</p>
      <h2 className="mt-1 text-center font-sans text-2xl font-semibold leading-tight">Настройки</h2>
      <p className="mt-2 text-center text-sm leading-relaxed text-muted">
        Тема на весь сборник, письма о багах и пара кнопок, которые нужны автору, а не двору.
      </p>

      <section data-tour="set-theme" className="mt-6 rounded-2xl bg-surface px-4 py-4 shadow-[0_0_0_1px_rgba(255,255,255,0.06)]">
        <p className="flex items-center justify-center gap-1.5 text-[11px] font-medium tracking-[0.14em] text-muted uppercase">
          <Palette className="size-3.5" />
          Тема оформления
        </p>
        <p className="mt-1 text-center text-[13px] leading-relaxed text-subtle">
          Светлая — бумага. Тёмная — сумерки. Чёрная — OLED. «Как в системе» слушает телефон.
        </p>
        <div className="mt-3 grid grid-cols-3 gap-2">
          <ThemeBtn id="light" label="Светлая" active={theme.choice === "light"} onClick={() => theme.set("light")} />
          <ThemeBtn id="dark" label="Тёмная" active={theme.choice === "dark"} onClick={() => theme.set("dark")} />
          <ThemeBtn id="black" label="Чёрная" active={theme.choice === "black"} onClick={() => theme.set("black")} />
        </div>
        <button
          type="button"
          onClick={() => theme.set("system")}
          className={cn(
            "mt-2 flex h-11 w-full items-center justify-center rounded-xl text-sm font-medium",
            theme.choice === "system" ? "bg-accent text-accent-fg" : "bg-elevated text-fg",
          )}
        >
          Задано системой
        </button>
      </section>

      <FontSizeCard />
      <PostcardCard />

      <section data-tour="set-tour" className="mt-3 rounded-2xl bg-surface px-4 py-4 shadow-[0_0_0_1px_rgba(255,255,255,0.06)]">
        <p className="flex items-center justify-center gap-1.5 text-[11px] font-medium tracking-[0.14em] text-muted uppercase">
          <GraduationCap className="size-3.5" />
          Обучение
        </p>
        <p className="mt-1 text-center text-[13px] leading-relaxed text-subtle">
          Первый заход сам водит по двору и заходит в разделы. Дойдёшь до конца — будет медаль. Потом само не лезет.
        </p>
        <button
          type="button"
          onClick={() => {
            void navigate({ to: "/" });
            window.setTimeout(() => startTour(), 80);
          }}
          className="mt-3 flex h-12 w-full items-center justify-center rounded-xl bg-elevated text-sm font-medium"
        >
          Пройти обучение заново
        </button>
      </section>

      <section data-tour="set-dock" className="mt-3 rounded-2xl bg-surface px-4 py-4 shadow-[0_0_0_1px_rgba(255,255,255,0.06)]">
        <p className="flex items-center justify-center gap-1.5 text-[11px] font-medium tracking-[0.14em] text-muted uppercase">
          <Columns3 className="size-3.5" />
          Нижнее меню
        </p>
        <p className="mt-1 text-center text-[13px] leading-relaxed text-subtle">
          Закладки, Цитатник, Зашквары и Инфо можно убрать из нижнего ряда — остальные кнопки растянутся. По умолчанию Зашквары на месте, Цитатник и Закладки спрятаны. Цитатник всё равно открывается с «Цитаты дня».
        </p>
        <button
          type="button"
          role="switch"
          aria-checked={books.show}
          onClick={() => books.set(!books.show)}
          className="mt-3 flex h-12 w-full items-center justify-center gap-3 rounded-xl bg-elevated px-4 text-sm font-medium"
        >
          <span className="inline-flex items-center gap-2">
            {books.show ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
            Закладки
          </span>
          <span
            className={cn(
              "rounded-full px-3 py-1 text-[11px]",
              books.show ? "bg-off text-off-fg" : "bg-danger text-danger-fg",
            )}
          >
            {books.show ? "включены" : "отключены"}
          </span>
        </button>
        <button
          type="button"
          role="switch"
          aria-checked={citats.show}
          onClick={() => citats.set(!citats.show)}
          className="mt-2 flex h-12 w-full items-center justify-center gap-3 rounded-xl bg-elevated px-4 text-sm font-medium"
        >
          <span className="inline-flex items-center gap-2">
            <Quote className={cn("size-4", !citats.show && "opacity-50")} />
            Цитатник
          </span>
          <span
            className={cn(
              "rounded-full px-3 py-1 text-[11px]",
              citats.show ? "bg-off text-off-fg" : "bg-danger text-danger-fg",
            )}
          >
            {citats.show ? "включён" : "отключён"}
          </span>
        </button>
        <button
          type="button"
          role="switch"
          aria-checked={zash.show}
          onClick={() => zash.set(!zash.show)}
          className="mt-2 flex h-12 w-full items-center justify-center gap-3 rounded-xl bg-elevated px-4 text-sm font-medium"
        >
          <span className="inline-flex items-center gap-2">
            <Trophy className={cn("size-4", !zash.show && "opacity-50")} />
            Зашквары
          </span>
          <span
            className={cn(
              "rounded-full px-3 py-1 text-[11px]",
              zash.show ? "bg-off text-off-fg" : "bg-danger text-danger-fg",
            )}
          >
            {zash.show ? "включены" : "отключены"}
          </span>
        </button>
        <button
          type="button"
          role="switch"
          aria-checked={info.show}
          onClick={() => info.set(!info.show)}
          className="mt-2 flex h-12 w-full items-center justify-center gap-3 rounded-xl bg-elevated px-4 text-sm font-medium"
        >
          <span className="inline-flex items-center gap-2">
            {info.show ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
            Инфо
          </span>
          <span
            className={cn(
              "rounded-full px-3 py-1 text-[11px]",
              info.show ? "bg-off text-off-fg" : "bg-danger text-danger-fg",
            )}
          >
            {info.show ? "включено" : "отключено"}
          </span>
        </button>
      </section>

      <section className="mt-3 rounded-2xl bg-surface px-4 py-4 shadow-[0_0_0_1px_rgba(255,255,255,0.06)]">
        <p className="flex items-center justify-center gap-1.5 text-[11px] font-medium tracking-[0.14em] text-muted uppercase">
          <Sparkles className="size-3.5" />
          Юрец AI
          <span className="rounded-full bg-elevated px-2 py-0.5 text-[10px] font-semibold tracking-[0.08em] text-muted uppercase">бета</span>
        </p>
        <p className="mt-1 text-center text-[13px] leading-relaxed text-subtle">
          Импровизация: пишешь Юрцу, он отвечает как в рассказах или как школьник из смс. По умолчанию кнопка стоит и внизу, и сверху рядом с темой. Можно оставить одну или убрать обе.
        </p>
        <button
          type="button"
          role="switch"
          aria-checked={ai.show}
          onClick={() => ai.set(!ai.show)}
          className="mt-3 flex h-12 w-full items-center justify-center gap-3 rounded-xl bg-elevated px-4 text-sm font-medium"
        >
          <span>Кнопка в нижнем меню</span>
          <span className={cn("rounded-full px-3 py-1 text-[11px]", ai.show ? "bg-off text-off-fg" : "bg-danger text-danger-fg")}>
            {ai.show ? "включена" : "отключена"}
          </span>
        </button>
        <button
          type="button"
          role="switch"
          aria-checked={aiTop.show}
          onClick={() => aiTop.set(!aiTop.show)}
          className="mt-2 flex h-12 w-full items-center justify-center gap-3 rounded-xl bg-elevated px-4 text-sm font-medium"
        >
          <span>Кнопка сверху слева</span>
          <span className={cn("rounded-full px-3 py-1 text-[11px]", aiTop.show ? "bg-off text-off-fg" : "bg-danger text-danger-fg")}>
            {aiTop.show ? "включена" : "отключена"}
          </span>
        </button>
        <button
          type="button"
          role="switch"
          aria-checked={aiKeep.on}
          onClick={() => {
            const next = !aiKeep.on;
            migrateChatLog(next);
            aiKeep.set(next);
          }}
          className="mt-2 flex h-12 w-full items-center justify-center gap-3 rounded-xl bg-elevated px-4 text-sm font-medium"
        >
          <span>Сохранять историю</span>
          <span className={cn("rounded-full px-3 py-1 text-[11px]", aiKeep.on ? "bg-off text-off-fg" : "bg-danger text-danger-fg")}>
            {aiKeep.on ? "включено" : "отключено"}
          </span>
        </button>
        <p className="mt-1 text-center text-[12px] leading-relaxed text-subtle">
          По умолчанию переписка сгорает, когда закрыл сборник. Если включить — останется на этом телефоне.
        </p>
        <Link
          to="/chat"
          className="mt-3 flex h-12 w-full items-center justify-center rounded-xl bg-hero px-4 text-sm font-medium text-hero-fg"
        >
          Открыть чат
        </Link>
        <button
          type="button"
          onClick={() => {
            try {
              sessionStorage.setItem(AI_SHARE_KEY, "1");
            } catch {
              /* ignore */
            }
            void navigate({ to: "/chat" });
          }}
          className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-tg px-4 text-sm font-medium text-tg-fg"
        >
          <Share2 className="size-4" />
          Поделиться
        </button>
        <button
          type="button"
          onClick={() => {
            const how = pinChatShortcut();
            if (how === "ok") setAiNote("Android спросит: добавить ярлык «Юрец AI» на рабочий стол.");
            else if (how === "need") setAiNote("Разреши ярлыки и нажми ещё раз.");
            else setAiNote("Ярлык ставится в телефонной сборке. Здесь чат уже открывается с /chat.");
          }}
          className="mt-2 flex h-12 w-full items-center justify-center rounded-xl bg-gold px-4 text-sm font-medium text-gold-fg"
        >
          Ярлык «Юрец AI» на рабочий стол
        </button>
        <button
          type="button"
          onClick={() => {
            if (!wipeChat) {
              setWipeChat(true);
              return;
            }
            clearChatLog();
            setWipeChat(false);
            playRain();
            setAiNote("История стёрта. Можно звонить сначала.");
          }}
          className="mt-2 flex h-12 w-full items-center justify-center rounded-xl bg-danger px-4 text-sm font-medium text-danger-fg"
        >
          {wipeChat ? "Точно стереть чат?" : "Очистить историю"}
        </button>
        {aiNote ? <p className="mt-2 text-center text-[12px] text-gold">{aiNote}</p> : null}
      </section>

      <section className="mt-3 rounded-2xl bg-surface px-4 py-4 shadow-[0_0_0_1px_rgba(255,255,255,0.06)]">
        <p className="flex items-center justify-center gap-1.5 text-[11px] font-medium tracking-[0.14em] text-muted uppercase">
          <Quote className="size-3.5" />
          Виджет
        </p>
        <p className="mt-1 text-center text-[13px] leading-relaxed text-subtle">
          «Цитата дня из Жизни Юрца» на рабочий стол — только фраза и кто орёт. Меняется сама, по выбранному интервалу. По умолчанию раз в сутки.
        </p>
        <button
          type="button"
          onClick={() => {
            const how = pinQuoteWidget();
            if (how === "ok") setWidgetNote("Android спросит: добавить виджет на рабочий стол.");
            else if (how === "old") setWidgetNote("Зажми пустое место на рабочем столе → Виджеты → Жизнь Юрца.");
            else if (how === "need") setWidgetNote("Система не даёт ставить виджеты из приложения. Добавь вручную: долгий тап по столу.");
            else setWidgetNote("Виджет ставится в телефонной сборке.");
          }}
          className="mt-3 flex h-12 w-full items-center justify-center rounded-xl bg-gold px-4 text-sm font-medium text-gold-fg"
        >
          Добавить виджет на рабочий стол
        </button>
        <p className="mt-3 text-center text-[12px] leading-relaxed text-subtle">Как часто менять цитату</p>
        <div className="mt-2 grid grid-cols-4 gap-2">
          {WIDGET_HOURS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => widget.set(opt.id)}
              className={cn(
                "flex h-11 items-center justify-center rounded-xl text-sm font-medium",
                widget.hours === opt.id ? "bg-accent text-accent-fg" : "bg-elevated text-fg",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {widgetNote ? <p className="mt-2 text-center text-[12px] text-gold">{widgetNote}</p> : null}
      </section>

      <section className="mt-3 rounded-2xl bg-surface px-4 py-4 shadow-[0_0_0_1px_rgba(255,255,255,0.06)]">
        <p className="flex items-center justify-center gap-1.5 text-[11px] font-medium tracking-[0.14em] text-muted uppercase">
          <Volume2 className="size-3.5" />
          Мультимедиа
        </p>
        <p className="mt-1 text-center text-[13px] leading-relaxed text-subtle">
          Звук и вибрация на всё приложение: Помойкобол, Алконоид, Юрца игра, отбив, гол, перетаскивание карточек. По умолчанию оба включены.
        </p>
        <button
          type="button"
          role="switch"
          aria-checked={sound.on}
          onClick={() => sound.set(!sound.on)}
          className="mt-3 flex h-12 w-full items-center justify-center gap-3 rounded-xl bg-elevated px-4 text-sm font-medium"
        >
          <span className="inline-flex items-center gap-2">
            {sound.on ? <Volume2 className="size-4" /> : <VolumeX className="size-4 opacity-50" />}
            Звук
          </span>
          <span
            className={cn(
              "rounded-full px-3 py-1 text-[11px]",
              sound.on ? "bg-off text-off-fg" : "bg-danger text-danger-fg",
            )}
          >
            {sound.on ? "включён" : "отключён"}
          </span>
        </button>
        <button
          type="button"
          role="switch"
          aria-checked={vibe.on}
          onClick={() => vibe.set(!vibe.on)}
          className="mt-2 flex h-12 w-full items-center justify-center gap-3 rounded-xl bg-elevated px-4 text-sm font-medium"
        >
          <span className="inline-flex items-center gap-2">
            {vibe.on ? <Vibrate className="size-4" /> : <Vibrate className="size-4 opacity-50" />}
            Вибрация
          </span>
          <span
            className={cn(
              "rounded-full px-3 py-1 text-[11px]",
              vibe.on ? "bg-off text-off-fg" : "bg-danger text-danger-fg",
            )}
          >
            {vibe.on ? "включена" : "отключена"}
          </span>
        </button>
      </section>

      <section className="mt-3 rounded-2xl bg-surface px-4 py-4 shadow-[0_0_0_1px_rgba(255,255,255,0.06)]">
        <p className="flex items-center justify-center gap-1.5 text-[11px] font-medium tracking-[0.14em] text-muted uppercase">
          <Monitor className="size-3.5" />
          Экран
        </p>
        <p className="mt-1 text-center text-[13px] leading-relaxed text-subtle">
          Полезно в Помойкоболе, Алконоиде и Юрца игре: телефон не уснёт посреди розыгрыша. Пока включено — экран горит, пока сборник открыт.
        </p>
        <button
          type="button"
          role="switch"
          aria-checked={awake.on}
          onClick={() => awake.set(!awake.on)}
          className="mt-3 flex h-12 w-full items-center justify-center gap-3 rounded-xl bg-elevated px-4 text-sm font-medium"
        >
          <span className="inline-flex items-center gap-2">
            <Monitor className={cn("size-4", !awake.on && "opacity-50")} />
            Не гасить экран
          </span>
          <span
            className={cn(
              "rounded-full px-3 py-1 text-[11px]",
              awake.on ? "bg-off text-off-fg" : "bg-danger text-danger-fg",
            )}
          >
            {awake.on ? "включено" : "отключено"}
          </span>
        </button>
      </section>

      <section className="mt-3 rounded-2xl bg-surface px-4 py-4 shadow-[0_0_0_1px_rgba(255,255,255,0.06)]">
        <p className="flex items-center justify-center gap-1.5 text-[11px] font-medium tracking-[0.14em] text-muted uppercase">
          <BookOpen className="size-3.5" />
          Читалка
        </p>
        <p className="mt-1 text-center text-[13px] leading-relaxed text-subtle">
          Справа в рассказе — полоса, чтобы мотать пальцем, не свайпая. Если накладывается на системную — выключи, вернётся обычный скролл.
        </p>
        <button
          type="button"
          role="switch"
          aria-checked={scrub.show}
          onClick={() => scrub.set(!scrub.show)}
          className="mt-3 flex h-12 w-full items-center justify-center gap-3 rounded-xl bg-elevated px-4 text-sm font-medium"
        >
          <span className="inline-flex items-center gap-2">
            {scrub.show ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
            Полоса прокрутки
          </span>
          <span
            className={cn(
              "rounded-full px-3 py-1 text-[11px]",
              scrub.show ? "bg-off text-off-fg" : "bg-danger text-danger-fg",
            )}
          >
            {scrub.show ? "включена" : "отключена"}
          </span>
        </button>
      </section>

      <section className="mt-3 rounded-2xl bg-surface px-4 py-4 shadow-[0_0_0_1px_rgba(255,255,255,0.06)]">
        <p className="flex items-center justify-center gap-1.5 text-[11px] font-medium tracking-[0.14em] text-muted uppercase">
          <BookCheck className="size-3.5" />
          Прочитанное
        </p>
        <p className="mt-1 text-center text-[13px] leading-relaxed text-subtle">
          Сбросит отметки «прочитано» у всех рассказов. Сами тексты на месте.
        </p>
        <button
          type="button"
          onClick={() => {
            if (!wipeRead) {
              setWipeRead(true);
              return;
            }
            clearAllRead();
            playRain();
            setWipeRead(false);
          }}
          className="mt-3 flex h-12 w-full items-center justify-center rounded-xl bg-danger px-4 text-sm font-medium text-danger-fg"
        >
          {wipeRead ? "Точно сбросить всё?" : `Очистить прочитанное${readN ? " · " + readN : ""}`}
        </button>
      </section>

      <section className="mt-3 rounded-2xl bg-surface px-4 py-4 shadow-[0_0_0_1px_rgba(255,255,255,0.06)]">
        <p className="flex items-center justify-center gap-1.5 text-[11px] font-medium tracking-[0.14em] text-muted uppercase">
          <Users className="size-3.5" />
          Герои
        </p>
        <p className="mt-1 text-center text-[13px] leading-relaxed text-subtle">
          Вернёт карточки во вкладке «Герои» к заводскому порядку. Сами герои на месте.
        </p>
        <button
          type="button"
          onClick={() => {
            if (!wipeChar) {
              setWipeChar(true);
              return;
            }
            resetCharOrder();
            playRain();
            setWipeChar(false);
          }}
          className="mt-3 flex h-12 w-full items-center justify-center rounded-xl bg-danger px-4 text-sm font-medium text-danger-fg"
        >
          {wipeChar ? "Точно сбросить всё?" : "Сбросить позиции Героев"}
        </button>
      </section>

      <section className="mt-3 rounded-2xl bg-surface px-4 py-4 shadow-[0_0_0_1px_rgba(255,255,255,0.06)]">
        <p className="flex items-center justify-center gap-1.5 text-[11px] font-medium tracking-[0.14em] text-muted uppercase">
          <Gamepad2 className="size-3.5" />
          Игры
        </p>
        <p className="mt-1 text-center text-[13px] leading-relaxed text-subtle">
          Вернёт карточки во вкладке «Игры» к заводскому порядку: квест, кроссворды, Помойкобол, Алконоид, Юрца игра.
        </p>
        <button
          type="button"
          onClick={() => {
            if (!wipeGames) {
              setWipeGames(true);
              return;
            }
            resetGameOrder();
            playRain();
            setWipeGames(false);
          }}
          className="mt-3 flex h-12 w-full items-center justify-center rounded-xl bg-danger px-4 text-sm font-medium text-danger-fg"
        >
          {wipeGames ? "Точно сбросить всё?" : "Сбросить порядок игр"}
        </button>
      </section>

      <section className="mt-3 rounded-2xl bg-surface px-4 py-4 shadow-[0_0_0_1px_rgba(255,255,255,0.06)]">
        <p className="flex items-center justify-center gap-1.5 text-[11px] font-medium tracking-[0.14em] text-muted uppercase">
          <Smartphone className="size-3.5" />
          Иконка приложения
        </p>
        <p className="mt-1 text-center text-[13px] leading-relaxed text-subtle">
          На телефоне меняется ярлык в лаунчере. Иногда система думает пару секунд.
        </p>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {APP_ICONS.map((opt) => {
            const on = icon.id === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => icon.set(opt.id)}
                className={cn(
                  "overflow-hidden rounded-xl text-left",
                  on ? "shadow-[0_0_0_2px_var(--color-accent)]" : "shadow-[0_0_0_1px_rgba(255,255,255,0.08)]",
                )}
              >
                <img src={opt.src} alt="" className="aspect-square w-full object-cover" />
                <span className={cn("block px-2 py-2 text-center text-[12px] font-semibold leading-tight", on ? "bg-accent text-accent-fg" : "bg-elevated")}>
                  {opt.label}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="mt-3 rounded-2xl bg-surface px-4 py-4 shadow-[0_0_0_1px_rgba(255,255,255,0.06)]">
        <p className="flex items-center justify-center gap-1.5 text-[11px] font-medium tracking-[0.14em] text-muted uppercase">
          <Type className="size-3.5" />
          Название приложения
        </p>
        <p className="mt-1 text-center text-[13px] leading-relaxed text-subtle">
          Подпись под ярлыком на телефоне. Три варианта — короткий и два с подзаголовком. Иногда система думает пару секунд.
        </p>
        <div className="mt-3 flex flex-col gap-2">
          {APP_NAMES.map((opt) => {
            const on = appName.id === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => appName.set(opt.id)}
                className={cn(
                  "flex min-h-12 w-full items-center justify-center rounded-xl px-3 py-2 text-center text-[13px] font-semibold leading-snug",
                  on ? "bg-accent text-accent-fg" : "bg-elevated text-fg",
                )}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </section>

      <section className="mt-3 rounded-2xl bg-surface px-4 py-4 shadow-[0_0_0_1px_rgba(255,255,255,0.06)]">
        <p className="flex items-center justify-center gap-1.5 text-[11px] font-medium tracking-[0.14em] text-muted uppercase">
          <ArchiveRestore className="size-3.5" />
          Резервное копирование
        </p>
        <p className="mt-1 text-center text-[13px] leading-relaxed text-subtle">
          Лицензия, прочитанное, игры, зашквары, стена подъезда и тумблеры — всё в одном файле. На телефоне кладётся в папку Backup во внутренней памяти: /sdcard/Backup/Жизнь Юрца.json. На другом телефоне — верни эту справку.
        </p>
        <button
          type="button"
          onClick={() => {
            setBakErr("");
            void exportBackup()
              .then((how) => {
                if (how === "native") setBakMsg("Справка: /sdcard/Backup/Жизнь Юрца.json");
                else if (how === "need") setBakMsg("Разреши доступ к файлам и нажми экспорт ещё раз.");
                else setBakMsg("Файл «Жизнь Юрца.json» скачан. На телефоне он кладётся в /sdcard/Backup/.");
              })
              .catch(() => setBakErr("Не удалось забрать справку."));
          }}
          className="mt-3 flex h-12 w-full items-center justify-center rounded-xl bg-tg px-4 text-sm font-medium text-tg-fg"
        >
          Забрать справку (экспорт)
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            e.target.value = "";
            if (!f) return;
            const reader = new FileReader();
            reader.onload = () => {
              try {
                const pack = parseBackup(String(reader.result || ""));
                applyBackup(pack);
                setBakAsk(false);
                setBakErr("");
                setBakMsg("Справка двора вернулась. Двор всё вспомнил.");
                window.setTimeout(() => window.location.reload(), 500);
              } catch (err) {
                setBakErr(err instanceof Error ? err.message : "Файл не справка.");
              }
            };
            reader.readAsText(f);
          }}
        />
        <button
          type="button"
          onClick={() => {
            if (!bakAsk) {
              setBakAsk(true);
              return;
            }
            fileRef.current?.click();
          }}
          className="mt-2 flex h-12 w-full items-center justify-center rounded-xl bg-off px-4 text-sm font-medium text-off-fg"
        >
          {bakAsk ? "Точно вернуть справку?" : "Вернуть справку (импорт)"}
        </button>
        {bakMsg ? <p className="mt-2 text-center text-[12px] text-gold">{bakMsg}</p> : null}
        {bakErr ? <p className="mt-2 text-center text-[12px] text-danger">{bakErr}</p> : null}
      </section>

      <SettingsCard
        tone="tg"
        icon={<Bug className="size-4" />}
        title="Поддержка"
        titleIcon={<Bug className="size-3.5" />}
        text="Нашли дыру? Опишите, что сломалось, на каком экране, и по возможности приложите скриншот или запись экрана. Автор получит это в Telegram или на электронную почту."
        action="Сообщить о баге"
        onClick={() => setBugOpen(true)}
      />
      <section className="mt-3 rounded-2xl bg-surface px-4 py-4 shadow-[0_0_0_1px_rgba(255,255,255,0.06)]">
        <p className="flex items-center justify-center gap-1.5 text-[11px] font-medium tracking-[0.14em] text-muted uppercase">
          <Bell className="size-3.5" />
          Уведомления
        </p>
        <p className="mt-1 text-center text-[13px] leading-relaxed text-subtle">
          Три канала, у каждого свой час. Двор стучит раз в сутки. Разработка зовёт в Grok, когда лимит мог отпуститься. Обновления сами смотрят GitHub и пишут, если сборку можно скачать с официального источника автора.
        </p>
        <NoteLane
          title="Двор"
          text="Один стук: то про сборник, то про игру. Выключишь своё время — стук через сутки после прошлого."
          chan={notesPlan.day}
          allowSpan
          onChange={(chan) => {
            const next = setNotesPlan({ ...notesPlan, day: chan });
            setNotesPlanUi(next);
          }}
          onTest={() => void notesTest("day").then((how) => setNotesMsg(notesHint(how)))}
        />
        <button
          type="button"
          onClick={() => void notesAsk().then((how) => setNotesMsg(notesHint(how)))}
          className="notes-ask mt-5 flex h-11 w-full items-center justify-center rounded-xl bg-elevated px-4 text-sm font-medium"
        >
          Разрешить уведомления
        </button>
        <NoteLane
          title="Разработка"
          text="Зайти в Grok и продолжить двор. Лимиты сбрасываются в разное время, поэтому час подводится вручную. Канал по умолчанию выключен."
          chan={notesPlan.dev}
          onChange={(chan) => {
            const next = setNotesPlan({ ...notesPlan, dev: chan });
            setNotesPlanUi(next);
          }}
          onTest={() => void notesTest("dev").then((how) => setNotesMsg(notesHint(how)))}
        />
        <NoteLane
          title="Обновления"
          text="В выбранный час телефон проверяет GitHub. Если версия новее — придёт стук: скачать можно с официального источника автора."
          chan={notesPlan.upd}
          onChange={(chan) => {
            const next = setNotesPlan({ ...notesPlan, upd: chan });
            setNotesPlanUi(next);
          }}
          onTest={() => void notesTest("upd").then((how) => setNotesMsg(notesHint(how)))}
        />
        <button
          type="button"
          onClick={() => void notesTest("all").then((how) => setNotesMsg(notesHint(how)))}
          className="mt-4 flex h-11 w-full items-center justify-center rounded-xl bg-gold px-4 text-sm font-medium text-gold-fg"
        >
          Проверить все уведомления
        </button>
        {notesMsg ? <p className="mt-2 text-center text-[12px] text-gold">{notesMsg}</p> : null}
      </section>

      <section className="mt-3 rounded-2xl bg-surface px-4 py-4 shadow-[0_0_0_1px_rgba(255,255,255,0.06)]">
        <p className="flex items-center justify-center gap-1.5 text-[11px] font-medium tracking-[0.14em] text-muted uppercase">
          <Download className="size-3.5" />
          Скачать и поставить
        </p>
        <p className="mt-1 text-center text-[13px] leading-relaxed text-subtle">
          Новая сборка {APP_VERSION}: Android — APK, iPhone — Safari или IPA, Windows — EXE,
          Ubuntu — DEB, компьютер — веб. Два места, откуда брать файл. Все версии — на GitHub Releases.
        </p>
        <a
          href={TG_UPDATE_URL}
          target="_blank"
          rel="noreferrer"
          className="mt-3 flex h-11 items-center justify-center gap-2 rounded-xl bg-tg px-4 text-sm font-medium text-tg-fg"
        >
          <Download className="size-4" />
          Скачать из Telegram
          <ExternalLink className="size-4 opacity-80" />
        </a>
        <a
          href={GITHUB_APK_URL}
          target="_blank"
          rel="noreferrer"
          className="mt-2 flex h-11 items-center justify-center gap-2 rounded-xl bg-gold px-4 text-sm font-medium text-gold-fg"
        >
          <Github className="size-4" />
          Скачать с GitHub
          <ExternalLink className="size-4 opacity-80" />
        </a>
        <a
          href={UPDATE_URL}
          target="_blank"
          rel="noreferrer"
          className="mt-2 flex h-11 items-center justify-center gap-2 rounded-xl bg-elevated px-4 text-sm font-medium"
        >
          <Github className="size-4" />
          Все релизы
          <ExternalLink className="size-4 opacity-80" />
        </a>
        <Link
          to="/apk"
          className="mt-2 flex h-11 w-full items-center justify-center rounded-xl bg-elevated px-4 text-sm font-medium"
        >
          Как поставить: Android, iPhone, Windows, Ubuntu
        </Link>
      </section>

      <div className="mt-8 flex items-center gap-3" role="separator" data-set-find>
        <span className="h-px flex-1 bg-border" />
        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium tracking-[0.16em] text-muted uppercase">
          <Shield className="size-3.5" />
          Админка
        </span>
        <span className="h-px flex-1 bg-border" />
      </div>
      <p className="mt-2 text-center text-[13px] leading-relaxed text-subtle" data-set-find>
        Предназначено исключительно для разработчика приложения. Здесь быстрые ссылки автора — чужой аккаунт сюда не пустят.
      </p>

      <SettingsCard
        tone="yt"
        icon={<Youtube className="size-4" />}
        title="Творческая студия"
        titleIcon={<Tv className="size-3.5" />}
        text="Панель управления каналом на YouTube: комментарии, статистика, загрузка."
        action="Открыть студию"
        onClick={() => (dev.on ? window.open(STUDIO_URL, "_blank") : setDevOpen(true))}
      />
      <SettingsCard
        tone="code"
        icon={<Code2 className="size-4" />}
        title="Разработка"
        titleIcon={<Code2 className="size-3.5" />}
        text="Быстрый вход в облачный чат с Grok, где собирается это приложение."
        action="Открыть разработку"
        onClick={() => (dev.on ? window.open(DEV_CHAT_URL, "_blank") : setDevOpen(true))}
      />
      <SettingsCard
        tone="call"
        icon={<Phone className="size-4" />}
        title="Связь"
        titleIcon={<Phone className="size-3.5" />}
        text="Позвонить помойному королю. Короткий набор, как его зовут. Живой номер в приложении не лежит."
        action="Позвонить"
        onClick={() => (dev.on ? openKingDial() : setDevOpen(true))}
      />
      {dev.on ? (
      <section className="mt-3 rounded-2xl bg-surface px-4 py-4 shadow-[0_0_0_1px_rgba(255,255,255,0.06)]">
        <p className="flex items-center justify-center gap-1.5 text-[11px] font-medium tracking-[0.14em] text-muted uppercase">
          <KeyRound className="size-3.5" />
          Чит-коды
        </p>
        <p className="mt-1 text-center text-[13px] leading-relaxed text-subtle">
          Одно поле на все слова двора. Регистр не важен. «Коды доступа» — список слов. Без кода разработчика этого блока нет.
        </p>
        <button
          type="button"
          onClick={() => setCheatOpen(true)}
          className="mt-3 flex h-11 w-full items-center justify-center rounded-xl bg-gold px-4 text-sm font-medium text-gold-fg"
        >
          Ввести код
        </button>
        <button
          type="button"
          onClick={() => setBookOpen(true)}
          className="mt-2 flex h-11 w-full items-center justify-center rounded-xl bg-elevated px-4 text-sm font-medium"
        >
          Коды доступа
        </button>
      </section>
      ) : null}

      <p className="mt-8 text-center text-[12px] text-subtle">
        Версия {APP_VERSION}
        <br />
        Лицензия: {dev.on ? "Разработчик" : paid ? "Приобретена" : "Отсутствует"}
      </p>
      <Link
        to="/about"
        className="mt-5 flex h-14 w-full items-center justify-center rounded-2xl bg-[#c9a227] text-[16px] font-semibold text-[#1a1408]"
      >
        О приложении
      </Link>

      {bugOpen ? <BugModal onClose={() => setBugOpen(false)} /> : null}
      {devOpen ? <DevModal onClose={() => setDevOpen(false)} /> : null}
      {dev.on && cheatOpen ? (
        <CheatModal
          onClose={() => setCheatOpen(false)}
          onRaven={() => {
            setCheatOpen(false);
            void navigate({ to: "/zashkvary" });
          }}
        />
      ) : null}
      {lockOpen ? (
        <LegendLock
          onClose={() => setLockOpen(false)}
          onOpen={() => {
            setLockOpen(false);
            setBookOpen(true);
          }}
        />
      ) : null}
      {dev.on && bookOpen ? <CheatBookModal onClose={() => setBookOpen(false)} /> : null}
    </main>
  );
}

function Chip({
  on,
  label,
  click,
}: {
  on: boolean;
  label: string;
  click: () => void;
}) {
  return (
    <button
      type="button"
      onClick={click}
      className={cn(
        "h-9 rounded-full px-3 text-xs font-medium",
        on ? "bg-accent text-accent-fg" : "bg-elevated text-fg",
      )}
    >
      {label}
    </button>
  );
}

function PostcardCard() {
  const [post, setPost] = useState<PostcardPrefs>(() => readPostcard());
  const [note, setNote] = useState("");
  const [pathDraft, setPathDraft] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function patch(p: Partial<PostcardPrefs>) {
    setPost(writePostcard(p));
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let dead = false;
    void drawPostcardPreview(canvas, post, {
      text: "Двор орёт, а Юрец уже в подъезде. Кто не верит — пусть сам послушает.",
      speaker: "Юрец",
      speakerId: "yurec",
    }).then(() => {
      if (dead) return;
    });
    return () => {
      dead = true;
    };
  }, [post]);

  return (
    <section data-tour="set-post" className="mt-3 rounded-2xl bg-surface px-4 py-4 shadow-[0_0_0_1px_rgba(255,255,255,0.06)]">
      <p className="flex items-center justify-center gap-1.5 text-[11px] font-medium tracking-[0.14em] text-muted uppercase">
        <ImagePlus className="size-3.5" />
        Открытка
      </p>
      <p className="mt-1 text-center text-[13px] leading-relaxed text-subtle">
        Цитата дня собирается в карточку. Текст и фото одной ширины. Фон, узор и шрифт можно закрепить или оставить случайными.
      </p>
      <button
        type="button"
        role="switch"
        aria-checked={post.on}
        onClick={() => patch({ on: !post.on })}
        className="mt-3 flex h-12 w-full items-center justify-center gap-3 rounded-xl bg-elevated px-4 text-sm font-medium"
      >
        <span>Режим открытки</span>
        <span className={cn("rounded-full px-2 py-0.5 text-xs", post.on ? "bg-accent text-accent-fg" : "bg-bg text-muted")}>
          {post.on ? "включён" : "выключен"}
        </span>
      </button>
      {!post.on ? (
        <p className="mt-2 text-center text-[13px] text-subtle">Кнопка на сборнике спрятана. Настройки ниже никуда не денутся.</p>
      ) : null}

      <p className="mt-4 text-center text-[11px] font-medium tracking-[0.14em] text-muted uppercase">Шрифт</p>
      <div className="mt-2 flex flex-wrap justify-center gap-1.5">
        {POST_FONTS.map((f) => (
          <Chip key={f.id} label={f.label} on={post.font === f.id} click={() => patch({ font: f.id })} />
        ))}
      </div>

      <p className="mt-4 text-center text-[11px] font-medium tracking-[0.14em] text-muted uppercase">Текст</p>
      <div className="mt-2 flex flex-wrap justify-center gap-1.5">
        <Chip label="Цитата дня" on={post.textMode === "day"} click={() => patch({ textMode: "day" })} />
        <Chip label="Свой" on={post.textMode === "custom"} click={() => patch({ textMode: "custom" })} />
      </div>
      {post.textMode === "custom" ? (
        <textarea
          value={post.customText}
          maxLength={280}
          rows={3}
          placeholder="Своя фраза на открытку"
          onChange={(e) => patch({ customText: e.target.value.slice(0, 280) })}
          className="mt-2 w-full resize-none rounded-xl bg-elevated px-3 py-2 text-sm text-fg outline-none"
        />
      ) : (
        <p className="mt-2 text-center text-[13px] text-subtle">Берётся цитата дня. Свой текст подставит то, что напишешь.</p>
      )}

      <p className="mt-4 text-center text-[11px] font-medium tracking-[0.14em] text-muted uppercase">Картинка</p>
      <div className="mt-2 flex flex-wrap justify-center gap-1.5">
        <Chip label="Кто сказал" on={post.image === "speaker"} click={() => patch({ image: "speaker" })} />
        <Chip label="Юрец" on={post.image === "yurec"} click={() => patch({ image: "yurec" })} />
        <Chip label="Своя" on={post.image === "custom"} click={() => patch({ image: "custom" })} />
        <Chip label="Без фото" on={post.image === "none"} click={() => patch({ image: "none" })} />
      </div>
      {post.image === "custom" ? (
        <div className="mt-2">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (!file) return;
              void shrinkPostcardFile(file).then((url) => {
                if (!url) {
                  setNote("Картинку не прочитать.");
                  return;
                }
                patch({ customImage: url, image: "custom" });
                setNote("Своя картинка на месте. Она уменьшена, чтоб телефон не задохнулся.");
              });
            }}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex h-11 w-full items-center justify-center rounded-xl bg-elevated text-sm font-medium"
          >
            {post.customImage ? "Заменить картинку" : "Выбрать картинку"}
          </button>
        </div>
      ) : null}

      <p className="mt-4 text-center text-[11px] font-medium tracking-[0.14em] text-muted uppercase">Формат</p>
      <div className="mt-2 flex justify-center gap-1.5">
        <Chip label="JPG" on={post.format === "jpg"} click={() => patch({ format: "jpg" })} />
        <Chip label="PNG" on={post.format === "png"} click={() => patch({ format: "png" })} />
      </div>

      <p className="mt-4 text-center text-[11px] font-medium tracking-[0.14em] text-muted uppercase">Фон</p>
      <div className="mt-2 flex flex-wrap justify-center gap-1.5">
        {POST_PAPERS.map((f) => (
          <Chip key={f.id} label={f.label} on={post.paper === f.id} click={() => patch({ paper: f.id })} />
        ))}
      </div>

      <p className="mt-4 text-center text-[11px] font-medium tracking-[0.14em] text-muted uppercase">Узор</p>
      <div className="mt-2 flex flex-wrap justify-center gap-1.5">
        {POST_PATTERNS.map((f) => (
          <Chip key={f.id} label={f.label} on={post.pattern === f.id} click={() => patch({ pattern: f.id })} />
        ))}
      </div>

      <p className="mt-4 text-center text-[11px] font-medium tracking-[0.14em] text-muted uppercase">Папка</p>
      <p className="mt-1 text-center text-[13px] text-subtle">Куда класть в галерее. По умолчанию Pictures/Yurec_Xuec.</p>
      <input
        value={pathDraft ?? post.path}
        onChange={(e) => setPathDraft(e.target.value)}
        onBlur={() => {
          if (pathDraft == null) return;
          patch({ path: pathDraft });
          setPathDraft(null);
        }}
        className="mt-2 h-11 w-full rounded-xl bg-elevated px-3 text-center text-sm text-fg outline-none"
        aria-label="Папка открыток"
      />
      <p className="mt-1 text-center text-[12px] text-muted">{postcardFolder({ ...post, path: pathDraft ?? post.path })}</p>

      <canvas ref={canvasRef} className="mx-auto mt-4 block w-[240px] max-w-full rounded-2xl shadow-[0_0_0_1px_rgba(255,255,255,0.08)]" />
      <button
        type="button"
        onClick={() => patch({ roll: post.roll + 1 })}
        className="mt-3 flex h-11 w-full items-center justify-center rounded-xl bg-elevated text-sm font-medium"
      >
        Другой вариант
      </button>
      {note ? <p className="mt-2 text-center text-[13px] text-subtle">{note}</p> : null}
    </section>
  );
}

function FontSizeCard() {
  const { size, source } = useReaderFont();
  const [draft, setDraft] = useState(String(size));
  const [touched, setTouched] = useState<FontSource>(source);

  useEffect(() => {
    setDraft(String(size));
    setTouched(source);
  }, [size, source]);

  function apply(raw: string, src: FontSource) {
    const n = Number(raw);
    if (!Number.isFinite(n)) return;
    setReaderFont(n, src);
    setTouched(src);
  }

  return (
    <section className="mt-3 rounded-2xl bg-surface px-4 py-4 shadow-[0_0_0_1px_rgba(255,255,255,0.06)]">
      <p className="flex items-center justify-center gap-1.5 text-[11px] font-medium tracking-[0.14em] text-muted uppercase">
        <Type className="size-3.5" />
        Размер текста
      </p>
      <p className="mt-1 text-center text-[13px] leading-relaxed text-subtle">
        От {FONT_MIN} до {FONT_MAX}. Число руками или шкала. Чего коснулся последним — то и стоит. Кнопка A± в рассказе возвращает {FONT_DEFAULT}.
      </p>
      <div className="mt-3 flex items-center gap-3">
        <input
          type="number"
          inputMode="numeric"
          min={FONT_MIN}
          max={FONT_MAX}
          value={draft}
          aria-label="Размер текста числом"
          onChange={(e) => {
            const raw = e.target.value;
            setDraft(raw);
            setTouched("keys");
            const n = Number(raw);
            if (Number.isInteger(n) && n >= FONT_MIN && n <= FONT_MAX) apply(raw, "keys");
          }}
          onBlur={() => {
            const n = Number(draft);
            const next = Number.isFinite(n)
              ? Math.max(FONT_MIN, Math.min(FONT_MAX, Math.round(n)))
              : FONT_DEFAULT;
            setReaderFont(next, "keys");
            setDraft(String(next));
            setTouched("keys");
          }}
          className="h-11 w-[4.5rem] rounded-xl bg-elevated text-center text-base font-semibold"
        />
        <input
          type="range"
          min={FONT_MIN}
          max={FONT_MAX}
          value={size}
          aria-label="Шкала размера текста"
          onChange={(e) => apply(e.target.value, "slider")}
          className="h-11 min-w-0 flex-1 accent-[#c9a227]"
        />
      </div>
      <p className="mt-3 text-center font-serif leading-snug" style={{ fontSize: size }}>
        Юрец орёт этим размером.
      </p>
      <p className="mt-1 text-center text-[11px] text-subtle">
        Сейчас {size}. Последним было: {touched === "slider" ? "шкала" : touched === "keys" ? "число" : "сброс A±"}.
      </p>
    </section>
  );
}

function ThemeBtn({
  id,
  label,
  active,
  onClick,
}: {
  id: ThemeChoice;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex h-16 flex-col items-center justify-center rounded-xl text-[12px] font-semibold",
        id === "light" && "bg-[#e7dfd0] text-[#1c1916]",
        id === "dark" && "bg-[#141416] text-[#eceae4]",
        id === "black" && "bg-black text-[#c9a227]",
        active && "shadow-[0_0_0_2px_var(--color-accent)]",
      )}
    >
      {id === "light" ? <Sun className="mb-1 size-4" /> : <Moon className="mb-1 size-4" />}
      {label}
    </button>
  );
}

function SettingsCard({
  tone,
  icon,
  title,
  titleIcon,
  text,
  action,
  href,
  onClick,
}: {
  tone: "tg" | "gold" | "yt" | "code" | "call";
  icon: React.ReactNode;
  title: string;
  titleIcon: React.ReactNode;
  text: string;
  action: string;
  href?: string;
  onClick?: () => void;
}) {
  const bg =
    tone === "tg"
      ? "bg-tg text-tg-fg"
      : tone === "gold"
        ? "bg-gold text-gold-fg"
        : tone === "yt"
          ? "bg-yt text-yt-fg"
          : tone === "call"
            ? "bg-[#1f6b45] text-white"
            : "bg-[#3d2a5c] text-white";
  const inner = (
    <span className="inline-flex items-center gap-2">
      {icon}
      {action}
      {href ? <ExternalLink className="size-4 opacity-80" /> : null}
    </span>
  );
  return (
    <section className="mt-3 rounded-2xl bg-surface px-4 py-4 shadow-[0_0_0_1px_rgba(255,255,255,0.06)]">
      <p className="flex items-center justify-center gap-1.5 text-[11px] font-medium tracking-[0.14em] text-muted uppercase">
        {titleIcon}
        {title}
      </p>
      <p className="mt-1 text-center text-[13px] leading-relaxed text-subtle">{text}</p>
      {href ? (
        <a href={href} target="_blank" rel="noreferrer" className={cn("mt-3 flex h-11 items-center justify-center rounded-xl px-4 text-sm font-medium", bg)}>
          {inner}
        </a>
      ) : (
        <button type="button" onClick={onClick} className={cn("mt-3 flex h-11 w-full items-center justify-center rounded-xl px-4 text-sm font-medium", bg)}>
          {inner}
        </button>
      )}
    </section>
  );
}

function BugModal({ onClose }: { onClose: () => void }) {
  const [text, setText] = useState("");
  const [info] = useState(() => deviceInfoBlock());
  const body = buildBugBody(text || "Опишите, что случилось.");
  const mail = `mailto:${SUPPORT_MAIL}?subject=${encodeURIComponent("Баг: Жизнь Юрца")}&body=${encodeURIComponent(body)}`;
  const tg = `${SUPPORT_TG}?text=${encodeURIComponent(body)}`;
  useBodyLock(true);
  return (
    <div
      className="fixed inset-0 z-[85] grid place-items-center overflow-hidden bg-void/80 px-6"
      role="dialog"
      aria-modal="true"
      onWheel={(e) => e.preventDefault()}
      onTouchMove={(e) => {
        const t = e.target as HTMLElement;
        if (t.closest("textarea") || t.closest(".bug-facts") || t.closest("form")) return;
        e.preventDefault();
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <form
        className="w-full max-w-[360px] max-h-[90dvh] overflow-y-auto rounded-2xl bg-surface p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.08)]"
        onSubmit={(e) => e.preventDefault()}
      >
        <p className="text-center font-sans text-[15px] font-semibold">Нашли баг?</p>
        <p className="mt-2 text-center text-[12px] leading-relaxed text-subtle">
          Напишите, что сломалось и на каком экране. К сообщению сама пришьётся карточка устройства. Скриншот или запись экрана очень помогают.
        </p>
        <textarea
          autoFocus
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={5}
          placeholder="Что нажал, что увидел, чего ждал…"
          className="mt-3 w-full rounded-xl bg-elevated px-3 py-2 text-sm text-fg shadow-[0_0_0_1px_rgba(255,255,255,0.06)] focus:outline-2 focus:outline-offset-2 focus:outline-accent"
        />
        <pre className="bug-facts mt-2 max-h-28 overflow-y-auto whitespace-pre-wrap break-all rounded-xl bg-elevated px-3 py-2 text-left text-[10px] leading-relaxed text-subtle">
          {info}
        </pre>
        <div className="mt-3 flex flex-col gap-3">
          <a href={tg} target="_blank" rel="noreferrer" className="flex h-11 items-center justify-center rounded-xl bg-tg text-sm font-medium text-tg-fg">
            В Telegram
          </a>
          <a
            href={mail}
            onClick={(e) => {
              if (openSupportMail("Баг: Жизнь Юрца", body)) e.preventDefault();
            }}
            className="flex h-11 items-center justify-center rounded-xl bg-[#6d28d9] text-sm font-medium text-white"
          >
            На почту
          </a>
          <button type="button" onClick={onClose} className="h-11 rounded-xl bg-danger text-sm font-medium text-danger-fg">
            Отмена
          </button>
        </div>
      </form>
    </div>
  );
}

function useBodyLock(on: boolean) {
  useEffect(() => {
    if (!on) return;
    const html = document.documentElement;
    const body = document.body;
    const y = window.scrollY;
    html.classList.add("modal-lock");
    body.style.top = `-${y}px`;
    const block = (e: TouchEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.closest("textarea") || t.closest(".bug-facts") || t.closest("input") || t.closest("form"))) return;
      e.preventDefault();
    };
    document.addEventListener("touchmove", block, { passive: false });
    return () => {
      html.classList.remove("modal-lock");
      body.style.top = "";
      document.removeEventListener("touchmove", block);
      window.scrollTo(0, y);
    };
  }, [on]);
}

function DevModal({ onClose }: { onClose: () => void }) {
  const { unlock } = useDeveloper();
  const [value, setValue] = useState("");
  const [err, setErr] = useState(false);
  useBodyLock(true);

  function submit() {
    if (!unlock(value)) {
      setErr(true);
      return;
    }
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[85] grid place-items-center bg-void/80 px-6" role="dialog" aria-modal="true" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <form
        className="w-full max-w-[340px] rounded-2xl bg-surface p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.08)]"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <p className="text-center font-sans text-[15px] font-semibold leading-snug">Ключ разработчика</p>
        <p className="mt-2 text-center text-[12px] leading-relaxed text-subtle">
          Быстрые ссылки для перехода в Творческую студию YouTube и в облачный чат с Grok. Полезно исключительно для разработчика приложения.
        </p>
        <input
          autoFocus
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setErr(false);
          }}
          className="mt-4 h-12 w-full rounded-xl bg-elevated px-3 text-center text-sm text-fg shadow-[0_0_0_1px_rgba(255,255,255,0.06)] focus:outline-2 focus:outline-offset-2 focus:outline-accent"
          placeholder="ключ"
          autoComplete="off"
        />
        {err ? (
          <p className="mt-2 text-center text-[12px] text-danger">Неверный ключ.</p>
        ) : (
          <p className="mt-2 text-center text-[12px] text-subtle">Один раз — и окно больше не появится.</p>
        )}
        <div className="mt-4 flex gap-2">
          <button type="button" onClick={onClose} className="h-11 flex-1 rounded-xl bg-danger text-sm font-medium text-danger-fg">
            Отмена
          </button>
          <button type="submit" className="h-11 flex-1 rounded-xl bg-gold text-sm font-medium text-gold-fg">
            Войти
          </button>
        </div>
      </form>
    </div>
  );
}

function CheatModal({ onClose, onRaven }: { onClose: () => void; onRaven: () => void }) {
  const [value, setValue] = useState("");
  const [err, setErr] = useState(false);
  const [ok, setOk] = useState<CheatKind | null>(null);
  useBodyLock(true);

  function submit() {
    if (ok === "raven") {
      onRaven();
      return;
    }
    const kind = applyAdminCheat(value);
    if (!kind) {
      setErr(true);
      setOk(null);
      return;
    }
    if (kind === "raven") {
      setErr(false);
      setOk("raven");
      setValue("");
      return;
    }
    playFireworks();
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-[85] grid place-items-center bg-void/80 px-6"
      role="dialog"
      aria-modal="true"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <form
        className="w-full max-w-[340px] rounded-2xl bg-surface p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.08)]"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <p className="text-center font-sans text-[15px] font-semibold leading-snug">Чит-коды</p>
        <p className="mt-2 text-center text-[12px] leading-relaxed text-subtle">
          Введи слово двора. Регистр не важен. Гоша смотрит, но молчит.
        </p>
        <input
          autoFocus
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setErr(false);
            setOk(null);
          }}
          className="mt-4 h-12 w-full rounded-xl bg-elevated px-3 text-center text-sm text-fg shadow-[0_0_0_1px_rgba(255,255,255,0.06)] focus:outline-2 focus:outline-offset-2 focus:outline-accent"
          placeholder="код"
          autoComplete="off"
        />
        {err ? (
          <p className="mt-2 text-center text-[12px] text-danger">Не тот код. Гоша смотрит.</p>
        ) : ok ? (
          <p className="mt-2 text-center text-[12px] text-[#c9a227]">{CHEAT_MSG[ok]}</p>
        ) : (
          <p className="mt-2 text-center text-[12px] text-subtle">Одно поле на все слова.</p>
        )}
        <div className="mt-4 flex gap-2">
          <button type="button" onClick={onClose} className="h-11 flex-1 rounded-xl bg-danger text-sm font-medium text-danger-fg">
            Закрыть
          </button>
          <button type="submit" className="h-11 flex-1 rounded-xl bg-gold text-sm font-medium text-gold-fg">
            {ok === "raven" ? "ОК" : "Открыть"}
          </button>
        </div>
      </form>
    </div>
  );
}

function LegendLock({ onClose, onOpen }: { onClose: () => void; onOpen: () => void }) {
  const { unlock } = useDeveloper();
  const [value, setValue] = useState("");
  const [err, setErr] = useState(false);
  useBodyLock(true);
  return (
    <div
      className="fixed inset-0 z-[85] grid place-items-center bg-void/80 px-6"
      role="dialog"
      aria-modal="true"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <form
        className="w-full max-w-[340px] rounded-2xl bg-surface p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.08)]"
        onSubmit={(e) => {
          e.preventDefault();
          if (!unlock(value)) {
            setErr(true);
            return;
          }
          onOpen();
        }}
      >
        <p className="text-center font-sans text-[15px] font-semibold leading-snug">Коды доступа</p>
        <p className="mt-2 text-center text-[12px] leading-relaxed text-subtle">
          Список слов закрыт. Сначала код разработчика.
        </p>
        <input
          autoFocus
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setErr(false);
          }}
          className="mt-4 h-12 w-full rounded-xl bg-elevated px-3 text-center text-sm text-fg shadow-[0_0_0_1px_rgba(255,255,255,0.06)] focus:outline-2 focus:outline-offset-2 focus:outline-accent"
          placeholder="код разработчика"
          autoComplete="off"
        />
        <p className={"mt-2 text-center text-[12px] " + (err ? "text-danger" : "text-subtle")}>
          {err ? "Не тот код. Список не откроется." : "Без этого слова списка нет."}
        </p>
        <div className="mt-4 flex gap-2">
          <button type="button" onClick={onClose} className="h-11 flex-1 rounded-xl bg-danger text-sm font-medium text-danger-fg">
            Закрыть
          </button>
          <button type="submit" className="h-11 flex-1 rounded-xl bg-gold text-sm font-medium text-gold-fg">
            Открыть
          </button>
        </div>
      </form>
    </div>
  );
}

function CheatBookModal({ onClose }: { onClose: () => void }) {
  useBodyLock(true);
  return (
    <div
      className="fixed inset-0 z-[85] grid place-items-center bg-void/80 px-6"
      role="dialog"
      aria-modal="true"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-[340px] rounded-2xl bg-surface p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.08)]">
        <p className="text-center font-sans text-[15px] font-semibold leading-snug">Коды доступа</p>
        <p className="mt-2 text-center text-[12px] leading-relaxed text-subtle">
          Слова, которые принимает окно читов. Регистр не важен.
        </p>
        <ul className="mt-3 flex flex-col gap-2">
          {CHEAT_BOOK.map((row) => (
            <li key={row.code} className="rounded-xl bg-elevated px-3 py-2">
              <p className="font-sans text-[14px] font-semibold">{row.code}</p>
              <p className="mt-0.5 text-[12px] leading-snug text-subtle">{row.what}</p>
            </li>
          ))}
        </ul>
        <button type="button" onClick={onClose} className="mt-4 h-11 w-full rounded-xl bg-elevated text-sm font-medium">
          Закрыть
        </button>
      </div>
    </div>
  );
}
