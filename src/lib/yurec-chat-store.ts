import type { ChatMode, ChatMsg } from "@/lib/yurec-brain";

const CHAT_LOG_KEY = "yurec-ai-log";
const AI_KEEP_KEY = "yurec-ai-keep";
export const AI_PICK_KEY = "yurec-ai-pick";
export const AI_SHARE_KEY = "yurec-ai-share";

export const CHAT_CHIPS = [
  "Как там Светка?",
  "Батя звонил?",
  "Гошу покормил?",
  "Что на помойке дали?",
  "Нашёл работу в газете?",
  "НЛО водку спёрло?",
];

export const CHAT_STARTERS = [
  "Алё, чем двор дышит?",
  "Толян в долг ещё наливает?",
  "Светка трубку взяла?",
  "Зина опять половником?",
  "Расскажи, как сенсорный тыкал.",
  "Есть свежий зашквар?",
  "Батя с дробовиком дома?",
  "Шаверму уже взял?",
];

function isAiKeepOn() {
  try {
    return localStorage.getItem(AI_KEEP_KEY) === "1";
  } catch {
    return false;
  }
}

function store(): Storage {
  try {
    return isAiKeepOn() ? localStorage : sessionStorage;
  } catch {
    return sessionStorage;
  }
}

export function readChatLog(): ChatMsg[] {
  try {
    const raw = store().getItem(CHAT_LOG_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as ChatMsg[];
    if (!Array.isArray(arr)) return [];
    return arr
      .filter((m) => m && (m.role === "user" || m.role === "yurec") && typeof m.text === "string")
      .slice(-80);
  } catch {
    return [];
  }
}

export function writeChatLog(list: ChatMsg[]) {
  const payload = JSON.stringify(list.slice(-80));
  try {
    store().setItem(CHAT_LOG_KEY, payload);
  } catch {
    /* ignore */
  }
}

export function migrateChatLog(keep: boolean) {
  try {
    if (keep) {
      const cur = sessionStorage.getItem(CHAT_LOG_KEY);
      if (cur && !localStorage.getItem(CHAT_LOG_KEY)) localStorage.setItem(CHAT_LOG_KEY, cur);
    }
  } catch {
    /* ignore */
  }
}

export function clearChatLog() {
  try {
    localStorage.removeItem(CHAT_LOG_KEY);
  } catch {
    /* ignore */
  }
  try {
    sessionStorage.removeItem(CHAT_LOG_KEY);
  } catch {
    /* ignore */
  }
}

export function formatChat(list: ChatMsg[], mode: ChatMode, indexes?: number[]) {
  const src = Array.isArray(indexes)
    ? indexes.map((i) => list[i]).filter(Boolean)
    : list;
  const head = "Чат с Юрцом · " + (mode === "sms" ? "SMS-ки" : "Разговор") + "\n\n";
  return (
    head +
    src
      .map((m) => (m.role === "user" ? "Я: " : "Юрец: ") + m.text)
      .join("\n\n")
  ).trim();
}

export async function copyChatText(text: string): Promise<"copy" | "empty"> {
  const body = String(text || "").trim();
  if (!body) return "empty";
  try {
    await navigator.clipboard.writeText(body);
    return "copy";
  } catch {
    /* fall through */
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = body;
    ta.setAttribute("readonly", "true");
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    ta.remove();
    return "copy";
  } catch {
    return "empty";
  }
}

export async function saveChatFile(text: string): Promise<"native" | "need" | "file" | "empty"> {
  const body = String(text || "").trim();
  if (!body) return "empty";
  const native = (window as Window & { YurecNative?: { appendChatLog?: (t: string) => string | void } }).YurecNative;
  if (native && typeof native.appendChatLog === "function") {
    const r = native.appendChatLog(body);
    if (r === "need") return "need";
    if (r === "fail") {
      /* fall through to download */
    } else {
      return "native";
    }
  }
  try {
    const blob = new Blob([body + "\n"], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Юрец AI.txt";
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 2000);
    return "file";
  } catch {
    return "empty";
  }
}

export function flyBeep() {
  try {
    const AC = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "square";
    o.frequency.value = 920;
    g.gain.value = 0.045;
    o.connect(g);
    g.connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + 0.055);
    window.setTimeout(() => {
      try {
        void ctx.close();
      } catch {
        /* ignore */
      }
    }, 120);
  } catch {
    /* ignore */
  }
}

export function pinChatShortcut(): "ok" | "need" | "web" {
  const native = (window as Window & { YurecNative?: { pinChatShortcut?: () => string | void } }).YurecNative;
  if (native && typeof native.pinChatShortcut === "function") {
    const r = native.pinChatShortcut();
    return r === "need" ? "need" : "ok";
  }
  return "web";
}
