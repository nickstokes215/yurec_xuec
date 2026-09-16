import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  Bug,
  BookOpen,
  BookCheck,
  Code2,
  Columns3,
  Trophy,
  ArchiveRestore,
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
} from "lucide-react";
import { APP_VERSION } from "@/data/catalog";
import { useTheme, type ThemeChoice } from "@/lib/use-theme";
import {
  DEV_CHAT_URL,
  STUDIO_URL,
  SUPPORT_MAIL,
  SUPPORT_TG,
  UPDATE_URL,
  buildBugBody,
  openSupportMail,
  openKingDial,
  useBookmarksNav,
  useInfoNav,
  useZashNav,
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

export const Route = createFileRoute("/settings")({ component: SettingsPage });

function SettingsPage() {
  const theme = useTheme();
  const books = useBookmarksNav();
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
  const [wipeRead, setWipeRead] = useState(false);
  const [wipeChar, setWipeChar] = useState(false);
  const [wipeGames, setWipeGames] = useState(false);
  const [bakMsg, setBakMsg] = useState("");
  const [bakErr, setBakErr] = useState("");
  const [bakAsk, setBakAsk] = useState(false);
  const [wipeChat, setWipeChat] = useState(false);
  const [aiNote, setAiNote] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  return (
    <main className="px-4 pt-4 pb-10">
      <p className="text-center text-[11px] font-medium tracking-[0.16em] text-muted uppercase">Приложение</p>
      <h2 className="mt-1 text-center font-sans text-2xl font-semibold leading-tight">Настройки</h2>
      <p className="mt-2 text-center text-sm leading-relaxed text-muted">
        Тема на весь сборник, письма о багах и пара кнопок, которые нужны автору, а не двору.
      </p>

      <section className="mt-6 rounded-2xl bg-surface px-4 py-4 shadow-[0_0_0_1px_rgba(255,255,255,0.06)]">
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

      <section className="mt-3 rounded-2xl bg-surface px-4 py-4 shadow-[0_0_0_1px_rgba(255,255,255,0.06)]">
        <p className="flex items-center justify-center gap-1.5 text-[11px] font-medium tracking-[0.14em] text-muted uppercase">
          <Columns3 className="size-3.5" />
          Нижнее меню
        </p>
        <p className="mt-1 text-center text-[13px] leading-relaxed text-subtle">
          Закладки, Зашквары и Инфо можно убрать из нижнего ряда — остальные кнопки растянутся. По умолчанию Зашквары на месте, Закладки спрятаны. Сами разделы никуда не денутся.
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
          Импровизация: пишешь Юрцу, он отвечает как в рассказах или как школьник из смс. Кнопку можно поставить вниз, наверх рядом с темой — или оба сразу.
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
          Лицензия, прочитанное, игры, зашквары и тумблеры — всё в одном файле. На телефоне кладётся в папку Backup во внутренней памяти: /sdcard/Backup/Жизнь Юрца.json. На другом телефоне — верни эту справку.
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
      <SettingsCard
        tone="gold"
        icon={<Download className="size-4" />}
        title="Обновление"
        titleIcon={<Download className="size-3.5" />}
        text="Проверить, вышла ли новая сборка. Пока ведёт в пост канала, откуда ставится приложение."
        href={UPDATE_URL}
        action="Проверить обновления"
      />

      <div className="mt-8 flex items-center gap-3" role="separator">
        <span className="h-px flex-1 bg-border" />
        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium tracking-[0.16em] text-muted uppercase">
          <Shield className="size-3.5" />
          Админка
        </span>
        <span className="h-px flex-1 bg-border" />
      </div>
      <p className="mt-2 text-center text-[13px] leading-relaxed text-subtle">
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
    </main>
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
