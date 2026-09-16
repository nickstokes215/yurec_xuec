import { createFileRoute } from "@tanstack/react-router";
import { Eraser, Send, Share2, Sparkles } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { APP_VERSION } from "@/data/catalog";
import { askYurec, type ChatMode, type ChatMsg } from "@/lib/yurec-chat";
import { detectMood, localYurecReply, welcomeLine } from "@/lib/yurec-brain";
import { isSoundOn, isVibrateOn } from "@/lib/use-settings";
import {
  AI_PICK_KEY,
  AI_SHARE_KEY,
  CHAT_CHIPS,
  CHAT_STARTERS,
  flyBeep,
  copyChatText,
  formatChat,
  readChatLog,
  saveChatFile,
  writeChatLog,
} from "@/lib/yurec-chat-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/chat")({ component: ChatPage });

const MODE_KEY = "yurec-ai-mode";
const PHOTO = `/characters/yurec.jpg?v=${APP_VERSION}`;
const COVER = `/covers/chat.jpg?v=${APP_VERSION}`;

function readMode(): ChatMode {
  try {
    return localStorage.getItem(MODE_KEY) === "sms" ? "sms" : "yurec";
  } catch {
    return "yurec";
  }
}

function writeMode(mode: ChatMode) {
  try {
    localStorage.setItem(MODE_KEY, mode);
  } catch {
    /* ignore */
  }
}

function moodLabel(mood: ReturnType<typeof detectMood>) {
  if (mood === "drunk") return "пьяный";
  if (mood === "psycho") return "псих";
  return "спокойный";
}

function ChatPage() {
  const [mode, setMode] = useState<ChatMode>("yurec");
  const [log, setLog] = useState<ChatMsg[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [pick, setPick] = useState(false);
  const [picked, setPicked] = useState<number[]>([]);
  const [note, setNote] = useState("");
  const scroller = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLTextAreaElement>(null);
  const mood = useMemo(() => detectMood(log), [log]);

  useEffect(() => {
    const m = readMode();
    const saved = readChatLog();
    setMode(m);
    setLog(saved.length ? saved : [{ role: "yurec", text: welcomeLine(m) }]);
    setReady(true);
    try {
      if (sessionStorage.getItem(AI_PICK_KEY) === "1") {
        sessionStorage.removeItem(AI_PICK_KEY);
        setPick(true);
        setShareOpen(false);
      } else if (sessionStorage.getItem(AI_SHARE_KEY) === "1") {
        sessionStorage.removeItem(AI_SHARE_KEY);
        setShareOpen(true);
        setPick(false);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (!ready) return;
    writeChatLog(log);
  }, [log, ready]);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [log, busy]);

  function changeMode(next: ChatMode) {
    if (next === mode) return;
    setMode(next);
    writeMode(next);
  }

  function wipe() {
    const hello = welcomeLine(mode);
    setLog([{ role: "yurec", text: hello }]);
    writeChatLog([{ role: "yurec", text: hello }]);
  }

  function putDraft(text: string) {
    setDraft(text);
    window.setTimeout(() => input.current?.focus(), 40);
  }

  async function sendText(raw: string) {
    const text = raw.replace(/\s+/g, " ").trim();
    if (!text || busy) return;
    const user: ChatMsg = { role: "user", text: text.slice(0, 500) };
    const next = [...log, user].slice(-80);
    setLog(next);
    setDraft("");
    setBusy(true);
    if (isVibrateOn()) {
      try {
        navigator.vibrate?.(18);
      } catch {
        /* ignore */
      }
    }
    if (isSoundOn()) flyBeep();
    window.setTimeout(() => input.current?.focus(), 40);
    let reply = "";
    try {
      const raced = Promise.race([
        askYurec({ data: { mode, messages: next } }),
        new Promise<{ ok: false; error: string }>((resolve) => {
          window.setTimeout(() => resolve({ ok: false, error: "timeout" }), 12000);
        }),
      ]);
      const res = await raced;
      if (res && "ok" in res && res.ok) reply = res.text;
    } catch {
      reply = "";
    }
    if (!reply) reply = localYurecReply(mode, user.text, next);
    setLog((cur) => [...cur, { role: "yurec" as const, text: reply }].slice(-80));
    setBusy(false);
  }

  async function send() {
    await sendText(draft);
  }

  async function doShare(dest: "copy" | "file", indexes?: number[]) {
    const text = formatChat(log, mode, indexes);
    if (dest === "copy") {
      const how = await copyChatText(text);
      setShareOpen(false);
      setPick(false);
      setPicked([]);
      setNote(how === "copy" ? "Скопировано в буфер." : "Не удалось скопировать.");
      return;
    }
    const how = await saveChatFile(text);
    setShareOpen(false);
    setPick(false);
    setPicked([]);
    if (how === "native") setNote("Дописано в /sdcard/Backup/Юрец AI.txt");
    else if (how === "need") setNote("Разреши доступ к файлам и нажми ещё раз.");
    else if (how === "file") setNote("Скачан файл «Юрец AI.txt».");
    else setNote("Пока нечем делиться.");
  }

  function togglePick(i: number) {
    setPicked((cur) => (cur.includes(i) ? cur.filter((x) => x !== i) : [...cur, i].sort((a, b) => a - b)));
  }

  return (
    <main className="chat-page flex h-full min-h-0 flex-col">
      <div className="chat-sticky">
        <div className="flex items-center gap-3">
          <img src={COVER} alt="" className="size-12 rounded-2xl object-cover shadow-[0_0_0_1px_rgba(255,255,255,0.08)]" />
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-medium tracking-[0.16em] text-muted uppercase">Бета</p>
            <h2 className="font-sans text-lg font-semibold leading-tight">Чат с Юрцом</h2>
            {mode === "yurec" ? (
              <p className="mt-0.5 text-[11px] text-subtle">настроение: {moodLabel(mood)}</p>
            ) : null}
          </div>
          <button
            type="button"
            className="grid size-11 shrink-0 place-items-center rounded-xl bg-elevated"
            aria-label="Поделиться"
            onClick={() => {
              setShareOpen(true);
              setPick(false);
            }}
          >
            <Share2 className="size-4" />
          </button>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => changeMode("yurec")}
            className={cn(
              "flex h-11 items-center justify-center rounded-xl text-sm font-medium",
              mode === "yurec" ? "bg-hero text-hero-fg" : "bg-elevated text-fg",
            )}
          >
            Разговор
          </button>
          <button
            type="button"
            onClick={() => changeMode("sms")}
            className={cn(
              "flex h-11 items-center justify-center rounded-xl text-sm font-medium",
              mode === "sms" ? "bg-hero text-hero-fg" : "bg-elevated text-fg",
            )}
          >
            SMS-ки
          </button>
        </div>
      </div>

      <div ref={scroller} className="chat-log mt-2">
        {log.map((m, i) => (
          <button
            key={i}
            type="button"
            disabled={false}
            onClick={() => { if (pick) togglePick(i); }}
            className={cn("chat-row", m.role === "user" ? "mine" : "his", pick && "chat-pick", pick && picked.includes(i) && "on")}
          >
            {m.role === "yurec" ? <img src={PHOTO} alt="" className="chat-ava" /> : null}
            <p className={cn("chat-bubble", m.role === "user" ? "mine bg-hero text-white" : "his", mode === "sms" && m.role === "yurec" && "sms")}>
              {m.text}
            </p>
          </button>
        ))}
        {busy ? (
          <div className="chat-row his">
            <img src={PHOTO} alt="" className="chat-ava" />
            <p className="chat-bubble his typing">
              <span />
              <span />
              <span />
            </p>
          </div>
        ) : null}
      </div>

      {pick ? (
        <div className="chat-dock">
          <div className="chat-composer">
            <button type="button" className="chat-wipe" onClick={() => { setPick(false); setPicked([]); }}>
              ×
            </button>
            <button
              type="button"
              className="chat-share-go"
              disabled={!picked.length}
              onClick={() => void doShare("copy", picked)}
            >
              Буфер ({picked.length})
            </button>
            <button
              type="button"
              className="chat-share-file"
              disabled={!picked.length}
              onClick={() => void doShare("file", picked)}
            >
              Backup
            </button>
          </div>
        </div>
      ) : (
        <div className="chat-dock">
          <div className="chat-chips">
            {CHAT_CHIPS.map((c) => (
              <button key={c} type="button" className="chat-chip" onClick={() => putDraft(c)}>
                {c}
              </button>
            ))}
            <button
              type="button"
              className="chat-chip chat-chip-gold"
              onClick={() => putDraft(CHAT_STARTERS[Math.floor(Math.random() * CHAT_STARTERS.length)]!)}
            >
              Случайный звонок
            </button>
          </div>
          <form
            className="chat-composer"
            onSubmit={(e) => {
              e.preventDefault();
              void send();
            }}
          >
            <button type="button" className="chat-wipe" onClick={wipe} aria-label="Стереть переписку" title="Стереть переписку">
              <Eraser className="size-4" />
            </button>
            <textarea
              ref={input}
              value={draft}
              rows={1}
              maxLength={500}
              placeholder={mode === "sms" ? "пиши смс…" : "Написать Юрцу…"}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send();
                }
              }}
            />
            <button type="submit" className="chat-send" disabled={busy || !draft.trim()} aria-label="Отправить">
              {busy ? <Sparkles className="size-4 animate-pulse" /> : <Send className="size-4" />}
            </button>
          </form>
        </div>
      )}

      {shareOpen ? (
        <div className="chat-share" role="dialog" aria-label="Поделиться">
          <p className="text-center text-sm font-medium">Куда сохранить чат</p>
          <button type="button" className="mt-3 flex h-12 w-full items-center justify-center rounded-xl bg-tg text-sm font-medium text-tg-fg" onClick={() => void doShare("copy")}>
            В буфер обмена
          </button>
          <button type="button" className="mt-2 flex h-12 w-full items-center justify-center rounded-xl bg-gold text-sm font-medium text-gold-fg" onClick={() => void doShare("file")}>
            Файл в Backup
          </button>
          <button
            type="button"
            className="mt-2 flex h-12 w-full items-center justify-center rounded-xl bg-off text-sm font-medium text-off-fg"
            onClick={() => {
              setShareOpen(false);
              setPick(true);
              setPicked([]);
            }}
          >
            Выбрать сообщения
          </button>
          <button type="button" className="mt-2 flex h-12 w-full items-center justify-center rounded-xl bg-elevated text-sm font-medium" onClick={() => setShareOpen(false)}>
            Отмена
          </button>
        </div>
      ) : null}
      {note ? <p className="chat-note">{note}</p> : null}
    </main>
  );
}
