import { useCallback, useSyncExternalStore } from "react";
import { grantPaidSilent } from "@/lib/use-paid";
import { matchDev } from "@/lib/secret-gate";
import changelogJson from "@/data/changelog.json";

const BOOK_NAV_KEY = "yurec-bookmarks-nav";
const INFO_NAV_KEY = "yurec-info-nav";
const ZASH_NAV_KEY = "yurec-zash-nav";
const AI_NAV_KEY = "yurec-ai-nav";
const AI_TOP_KEY = "yurec-ai-top";
const AI_KEEP_KEY = "yurec-ai-keep";
const WIDGET_KEY = "yurec-widget-interval";
const SCRUB_KEY = "yurec-reader-scrub";
const VIBRATE_KEY = "yurec-vibrate";
const SOUND_KEY = "yurec-sound";
const AWAKE_KEY = "yurec-keep-awake";
const DEV_KEY = "yurec-dev";
const ICON_KEY = "yurec-app-icon";
const NAME_KEY = "yurec-app-name";
export const STUDIO_URL = "https://studio.youtube.com/channel/UCUe2h3bjoip1jAD2eX1stIA";
export const DEV_CHAT_URL = "https://grok.com/c/bd6138f0-50b2-46ff-ad22-78e3151fb58f";
export const UPDATE_URL = "https://t.me/yurec_xuec/479";
export const SUPPORT_TG = "https://t.me/nick_stokes";
export const SUPPORT_MAIL = "nickstokes215@gmail.com";

const bookListeners = new Set<() => void>();
const infoListeners = new Set<() => void>();
const zashListeners = new Set<() => void>();
const aiListeners = new Set<() => void>();
const aiTopListeners = new Set<() => void>();
const aiKeepListeners = new Set<() => void>();
const widgetListeners = new Set<() => void>();
const scrubListeners = new Set<() => void>();
const vibeListeners = new Set<() => void>();
const soundListeners = new Set<() => void>();
const awakeListeners = new Set<() => void>();
const devListeners = new Set<() => void>();
const iconListeners = new Set<() => void>();
const nameListeners = new Set<() => void>();
let bookCache: boolean | undefined;
let infoCache: boolean | undefined;
let zashCache: boolean | undefined;
let aiCache: boolean | undefined;
let aiTopCache: boolean | undefined;
let aiKeepCache: boolean | undefined;
let widgetCache: WidgetHours | undefined;
let scrubCache: boolean | undefined;
let vibeCache: boolean | undefined;
let soundCache: boolean | undefined;
let awakeCache: boolean | undefined;
let devCache: boolean | undefined;
let iconCache: AppIconId | undefined;
let nameCache: AppNameId | undefined;

export type AppIconId = "comedy" | "horror";
export type AppNameId = "short" | "saga" | "arthouse";
export type WidgetHours = 1 | 6 | 12 | 24;
export const WIDGET_HOURS: { id: WidgetHours; label: string }[] = [
  { id: 1, label: "1 ч" },
  { id: 6, label: "6 ч" },
  { id: 12, label: "12 ч" },
  { id: 24, label: "24 ч" },
];
export const APP_ICONS: { id: AppIconId; label: string; src: string }[] = [
  { id: "comedy", label: "Комедийная сага", src: `/icons/comedy.jpg?v=${changelogJson.version}` },
  { id: "horror", label: "Артхаусный хоррор", src: `/icons/horror.jpg?v=${changelogJson.version}` },
];
export const APP_NAMES: { id: AppNameId; label: string }[] = [
  { id: "short", label: "Жизнь Юрца" },
  { id: "saga", label: "Жизнь Юрца: Комедийная сага" },
  { id: "arthouse", label: "Жизнь Юрца: Артхаусный хоррор" },
];

function emit(set: Set<() => void>) {
  for (const fn of set) fn();
}

function later(fn: () => void) {
  window.setTimeout(() => {
    try {
      fn();
    } catch {
      /* ignore */
    }
  }, 0);
}

function readBookmarksNav(): boolean {
  if (bookCache !== undefined) return bookCache;
  try {
    bookCache = localStorage.getItem(BOOK_NAV_KEY) === "1";
  } catch {
    bookCache = false;
  }
  return bookCache;
}

export function setBookmarksNav(on: boolean) {
  bookCache = on;
  try {
    localStorage.setItem(BOOK_NAV_KEY, on ? "1" : "0");
  } catch {
    /* ignore */
  }
  emit(bookListeners);
}

function readInfoNav(): boolean {
  if (infoCache !== undefined) return infoCache;
  try {
    infoCache = localStorage.getItem(INFO_NAV_KEY) !== "0";
  } catch {
    infoCache = true;
  }
  return infoCache;
}

export function setInfoNav(on: boolean) {
  infoCache = on;
  try {
    localStorage.setItem(INFO_NAV_KEY, on ? "1" : "0");
  } catch {
    /* ignore */
  }
  emit(infoListeners);
}

function readZashNav(): boolean {
  if (zashCache !== undefined) return zashCache;
  try {
    zashCache = localStorage.getItem(ZASH_NAV_KEY) !== "0";
  } catch {
    zashCache = true;
  }
  return zashCache;
}

export function setZashNav(on: boolean) {
  zashCache = on;
  try {
    localStorage.setItem(ZASH_NAV_KEY, on ? "1" : "0");
  } catch {
    /* ignore */
  }
  emit(zashListeners);
}

function readAiNav(): boolean {
  if (aiCache !== undefined) return aiCache;
  try {
    aiCache = localStorage.getItem(AI_NAV_KEY) === "1";
  } catch {
    aiCache = false;
  }
  return aiCache;
}

export function setAiNav(on: boolean) {
  aiCache = on;
  try {
    localStorage.setItem(AI_NAV_KEY, on ? "1" : "0");
  } catch {
    /* ignore */
  }
  emit(aiListeners);
}

function readAiTop(): boolean {
  if (aiTopCache !== undefined) return aiTopCache;
  try {
    aiTopCache = localStorage.getItem(AI_TOP_KEY) === "1";
  } catch {
    aiTopCache = false;
  }
  return aiTopCache;
}

export function setAiTop(on: boolean) {
  aiTopCache = on;
  try {
    localStorage.setItem(AI_TOP_KEY, on ? "1" : "0");
  } catch {
    /* ignore */
  }
  emit(aiTopListeners);
}

function readAiKeep(): boolean {
  if (aiKeepCache !== undefined) return aiKeepCache;
  try {
    aiKeepCache = localStorage.getItem(AI_KEEP_KEY) === "1";
  } catch {
    aiKeepCache = false;
  }
  return aiKeepCache;
}

export function setAiKeep(on: boolean) {
  aiKeepCache = on;
  try {
    localStorage.setItem(AI_KEEP_KEY, on ? "1" : "0");
  } catch {
    /* ignore */
  }
  emit(aiKeepListeners);
}

function readWidgetHours(): WidgetHours {
  if (widgetCache !== undefined) return widgetCache;
  try {
    const n = Number(localStorage.getItem(WIDGET_KEY) || "24");
    widgetCache = n === 1 || n === 6 || n === 12 || n === 24 ? n : 24;
  } catch {
    widgetCache = 24;
  }
  return widgetCache;
}

export function setWidgetHours(h: WidgetHours) {
  widgetCache = h;
  try {
    localStorage.setItem(WIDGET_KEY, String(h));
  } catch {
    /* ignore */
  }
  try {
    const native = (window as Window & { YurecNative?: { setWidgetInterval?: (n: number) => void } }).YurecNative;
    if (native && typeof native.setWidgetInterval === "function") native.setWidgetInterval(h);
  } catch {
    /* ignore */
  }
  emit(widgetListeners);
}

export function pinQuoteWidget(): "ok" | "need" | "old" | "web" {
  const native = (window as Window & { YurecNative?: { pinQuoteWidget?: () => string | void } }).YurecNative;
  if (native && typeof native.pinQuoteWidget === "function") {
    const r = native.pinQuoteWidget();
    if (r === "need" || r === "old") return r;
    return "ok";
  }
  return "web";
}

function readScrub(): boolean {
  if (scrubCache !== undefined) return scrubCache;
  try {
    scrubCache = localStorage.getItem(SCRUB_KEY) === "1";
  } catch {
    scrubCache = false;
  }
  return scrubCache;
}

export function setReaderScrub(on: boolean) {
  scrubCache = on;
  try {
    localStorage.setItem(SCRUB_KEY, on ? "1" : "0");
  } catch {
    /* ignore */
  }
  emit(scrubListeners);
}

function readVibrate(): boolean {
  if (vibeCache !== undefined) return vibeCache;
  try {
    vibeCache = localStorage.getItem(VIBRATE_KEY) !== "0";
  } catch {
    vibeCache = true;
  }
  return vibeCache;
}

export function isVibrateOn() {
  return readVibrate();
}

export function setVibrateOn(on: boolean) {
  vibeCache = on;
  try {
    localStorage.setItem(VIBRATE_KEY, on ? "1" : "0");
  } catch {
    /* ignore */
  }
  emit(vibeListeners);
}

function readSound(): boolean {
  if (soundCache !== undefined) return soundCache;
  try {
    soundCache = localStorage.getItem(SOUND_KEY) !== "0";
  } catch {
    soundCache = true;
  }
  return soundCache;
}

export function isSoundOn() {
  return readSound();
}

export function setSoundOn(on: boolean) {
  soundCache = on;
  try {
    localStorage.setItem(SOUND_KEY, on ? "1" : "0");
  } catch {
    /* ignore */
  }
  emit(soundListeners);
}

function readKeepAwake(): boolean {
  if (awakeCache !== undefined) return awakeCache;
  try {
    awakeCache = localStorage.getItem(AWAKE_KEY) !== "0";
  } catch {
    awakeCache = true;
  }
  return awakeCache;
}

type NativeBridge = { setKeepScreenOn?: (on: boolean) => void };
let wakeSentinel: WakeLockSentinel | null = null;
let wakeBound = false;

export function applyKeepAwake() {
  const on = readKeepAwake();
  try {
    const native = (window as Window & { YurecNative?: NativeBridge }).YurecNative;
    if (native && typeof native.setKeepScreenOn === "function") native.setKeepScreenOn(on);
  } catch {
    /* ignore */
  }
  if (!on) {
    const hold = wakeSentinel;
    wakeSentinel = null;
    if (hold) {
      try {
        void hold.release();
      } catch {
        /* ignore */
      }
    }
    return;
  }
  if (typeof document !== "undefined" && document.visibilityState !== "visible") return;
  try {
    const lock = navigator.wakeLock;
    if (!lock) return;
    void lock.request("screen").then((sent) => {
      if (!readKeepAwake()) {
        try {
          void sent.release();
        } catch {
          /* ignore */
        }
        return;
      }
      wakeSentinel = sent;
      sent.addEventListener("release", () => {
        if (wakeSentinel === sent) wakeSentinel = null;
      });
    }).catch(() => {
      /* preview / no permission */
    });
  } catch {
    /* ignore */
  }
}

export function setKeepAwakeOn(on: boolean) {
  awakeCache = on;
  try {
    localStorage.setItem(AWAKE_KEY, on ? "1" : "0");
  } catch {
    /* ignore */
  }
  emit(awakeListeners);
  applyKeepAwake();
}

if (typeof window !== "undefined" && !wakeBound) {
  wakeBound = true;
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") applyKeepAwake();
  });
}

function readDev(): boolean {
  if (devCache !== undefined) return devCache;
  try {
    devCache = localStorage.getItem(DEV_KEY) === "1";
  } catch {
    devCache = false;
  }
  return devCache;
}

function onDevChanged() {
  devCache = undefined;
  emit(devListeners);
}

if (typeof window !== "undefined") {
  window.addEventListener("yurec-dev-changed", onDevChanged);
}

export function unlockDeveloper(input: string): boolean {
  const ok = matchDev(input);
  if (!ok) return false;
  devCache = true;
  try {
    localStorage.setItem(DEV_KEY, "1");
  } catch {
    /* ignore */
  }
  grantPaidSilent();
  later(() => {
    emit(devListeners);
    window.dispatchEvent(new Event("yurec-license-changed"));
    window.dispatchEvent(new Event("yurec-fireworks"));
  });
  return true;
}

function readIcon(): AppIconId {
  if (iconCache) return iconCache;
  try {
    iconCache = localStorage.getItem(ICON_KEY) === "horror" ? "horror" : "comedy";
  } catch {
    iconCache = "comedy";
  }
  return iconCache;
}

function parseName(raw: string | null): AppNameId {
  if (raw === "saga" || raw === "arthouse") return raw;
  return "short";
}

function readName(): AppNameId {
  if (nameCache) return nameCache;
  try {
    nameCache = parseName(localStorage.getItem(NAME_KEY));
  } catch {
    nameCache = "short";
  }
  return nameCache;
}

function applyFavicon(id: AppIconId) {
  try {
    const href = id === "horror" ? "/icons/horror.jpg" : "/icons/comedy.jpg";
    let link = document.querySelector("link[rel='icon']") as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.type = "image/jpeg";
    link.href = href;
  } catch {
    /* ignore */
  }
}

function applyDocumentTitle(id: AppNameId) {
  try {
    const row = APP_NAMES.find((x) => x.id === id) || APP_NAMES[0];
    document.title = row.label;
  } catch {
    /* ignore */
  }
}

type LauncherNative = { setLauncher?: (icon: string, name: string) => void; setAppIcon?: (id: string) => void };

function pushLauncher(icon: AppIconId, name: AppNameId) {
  applyFavicon(icon);
  applyDocumentTitle(name);
  try {
    const native = (window as Window & { YurecNative?: LauncherNative }).YurecNative;
    if (native && typeof native.setLauncher === "function") native.setLauncher(icon, name);
    else if (native && typeof native.setAppIcon === "function") native.setAppIcon(icon);
  } catch {
    /* ignore */
  }
}

export function setAppIcon(id: AppIconId) {
  iconCache = id === "horror" ? "horror" : "comedy";
  try {
    localStorage.setItem(ICON_KEY, iconCache);
  } catch {
    /* ignore */
  }
  pushLauncher(iconCache, readName());
  emit(iconListeners);
}

export function setAppName(id: AppNameId) {
  nameCache = parseName(id);
  try {
    localStorage.setItem(NAME_KEY, nameCache);
  } catch {
    /* ignore */
  }
  pushLauncher(readIcon(), nameCache);
  emit(nameListeners);
}

export function applyStoredIcon() {
  pushLauncher(readIcon(), readName());
  try {
    const native = (window as Window & { YurecNative?: { setWidgetInterval?: (n: number) => void } }).YurecNative;
    if (native && typeof native.setWidgetInterval === "function") native.setWidgetInterval(readWidgetHours());
  } catch {
    /* ignore */
  }
}

export function useAppIcon() {
  const id = useSyncExternalStore(
    (fn) => {
      iconListeners.add(fn);
      return () => iconListeners.delete(fn);
    },
    readIcon,
    () => "comedy" as AppIconId,
  );
  const set = useCallback((v: AppIconId) => setAppIcon(v), []);
  return { id, set };
}

export function useAppName() {
  const id = useSyncExternalStore(
    (fn) => {
      nameListeners.add(fn);
      return () => nameListeners.delete(fn);
    },
    readName,
    () => "short" as AppNameId,
  );
  const set = useCallback((v: AppNameId) => setAppName(v), []);
  return { id, set };
}

export function isDeveloper() {
  return readDev();
}

export function useBookmarksNav() {
  const show = useSyncExternalStore(
    (fn) => {
      bookListeners.add(fn);
      return () => bookListeners.delete(fn);
    },
    readBookmarksNav,
    () => false,
  );
  const set = useCallback((v: boolean) => setBookmarksNav(v), []);
  return { show, set };
}

export function useInfoNav() {
  const show = useSyncExternalStore(
    (fn) => {
      infoListeners.add(fn);
      return () => infoListeners.delete(fn);
    },
    readInfoNav,
    () => true,
  );
  const set = useCallback((v: boolean) => setInfoNav(v), []);
  return { show, set };
}

export function useZashNav() {
  const show = useSyncExternalStore(
    (fn) => {
      zashListeners.add(fn);
      return () => zashListeners.delete(fn);
    },
    readZashNav,
    () => true,
  );
  const set = useCallback((v: boolean) => setZashNav(v), []);
  return { show, set };
}

export function useAiNav() {
  const show = useSyncExternalStore(
    (fn) => {
      aiListeners.add(fn);
      return () => aiListeners.delete(fn);
    },
    readAiNav,
    () => false,
  );
  const set = useCallback((v: boolean) => setAiNav(v), []);
  return { show, set };
}

export function useAiTop() {
  const show = useSyncExternalStore(
    (fn) => {
      aiTopListeners.add(fn);
      return () => aiTopListeners.delete(fn);
    },
    readAiTop,
    () => false,
  );
  const set = useCallback((v: boolean) => setAiTop(v), []);
  return { show, set };
}

export function useAiKeep() {
  const on = useSyncExternalStore(
    (fn) => {
      aiKeepListeners.add(fn);
      return () => aiKeepListeners.delete(fn);
    },
    readAiKeep,
    () => false,
  );
  const set = useCallback((v: boolean) => setAiKeep(v), []);
  return { on, set };
}

export function useWidgetHours() {
  const hours = useSyncExternalStore(
    (fn) => {
      widgetListeners.add(fn);
      return () => widgetListeners.delete(fn);
    },
    readWidgetHours,
    () => 24 as WidgetHours,
  );
  const set = useCallback((v: WidgetHours) => setWidgetHours(v), []);
  return { hours, set };
}

export function useReaderScrub() {
  const show = useSyncExternalStore(
    (fn) => {
      scrubListeners.add(fn);
      return () => scrubListeners.delete(fn);
    },
    readScrub,
    () => false,
  );
  const set = useCallback((v: boolean) => setReaderScrub(v), []);
  return { show, set };
}

export function useVibrate() {
  const on = useSyncExternalStore(
    (fn) => {
      vibeListeners.add(fn);
      return () => vibeListeners.delete(fn);
    },
    readVibrate,
    () => true,
  );
  const set = useCallback((v: boolean) => setVibrateOn(v), []);
  return { on, set };
}

export function useSound() {
  const on = useSyncExternalStore(
    (fn) => {
      soundListeners.add(fn);
      return () => soundListeners.delete(fn);
    },
    readSound,
    () => true,
  );
  const set = useCallback((v: boolean) => setSoundOn(v), []);
  return { on, set };
}

export function useKeepAwake() {
  const on = useSyncExternalStore(
    (fn) => {
      awakeListeners.add(fn);
      return () => awakeListeners.delete(fn);
    },
    readKeepAwake,
    () => true,
  );
  const set = useCallback((v: boolean) => setKeepAwakeOn(v), []);
  return { on, set };
}

export function useDeveloper() {
  const on = useSyncExternalStore(
    (fn) => {
      devListeners.add(fn);
      return () => devListeners.delete(fn);
    },
    readDev,
    () => false,
  );
  const unlock = useCallback((v: string) => unlockDeveloper(v), []);
  return { on, unlock };
}

export const KING_TEL = "962";

export function openKingDial(): boolean {
  try {
    const native = (
      window as Window & {
        YurecNative?: { openDial?: (number: string) => void };
      }
    ).YurecNative;
    if (native && typeof native.openDial === "function") {
      native.openDial(KING_TEL);
      return true;
    }
  } catch {
    /* ignore */
  }
  try {
    window.location.href = "tel:" + KING_TEL;
    return true;
  } catch {
    return false;
  }
}

export function openSupportMail(subject: string, body: string): boolean {
  try {
    const native = (
      window as Window & {
        YurecNative?: { openMail?: (to: string, subject: string, body: string) => void };
      }
    ).YurecNative;
    if (native && typeof native.openMail === "function") {
      native.openMail(SUPPORT_MAIL, subject, body);
      return true;
    }
  } catch {
    /* ignore */
  }
  return false;
}

export function deviceInfoBlock() {
  const lines: string[] = [];
  try {
    const native = (window as Window & { YurecNative?: { deviceInfo?: () => string } }).YurecNative;
    if (native && typeof native.deviceInfo === "function") {
      const s = native.deviceInfo();
      if (s) lines.push(...String(s).split(/\n+/).filter(Boolean));
    }
  } catch {
    /* ignore */
  }
  try {
    const n = navigator as Navigator & { deviceMemory?: number; connection?: { effectiveType?: string; downlink?: number; rtt?: number } };
    if (!lines.some((x) => x.startsWith("UA:") || x.startsWith("Браузер:"))) {
      if (n.userAgent) lines.push("UA: " + n.userAgent);
    }
    if (n.platform) lines.push("Платформа: " + n.platform);
    if (n.language) lines.push("Язык: " + n.language + (n.languages ? " (" + Array.from(n.languages).join(", ") + ")" : ""));
    if (typeof n.hardwareConcurrency === "number") lines.push("Потоки CPU: " + n.hardwareConcurrency);
    if (typeof n.deviceMemory === "number") lines.push("ОЗУ (оценка): " + n.deviceMemory + " ГБ");
    if (n.connection) {
      const c = n.connection;
      const bits = [c.effectiveType, c.downlink ? c.downlink + " Мбит/с" : "", c.rtt ? "rtt " + c.rtt + " мс" : ""].filter(Boolean);
      if (bits.length) lines.push("Сеть: " + bits.join(" · "));
    }
    lines.push("Онлайн: " + (n.onLine ? "да" : "нет"));
    const s = window.screen;
    lines.push(
      "Экран JS: " +
        s.width +
        "×" +
        s.height +
        " · окно " +
        window.innerWidth +
        "×" +
        window.innerHeight +
        " · dpr " +
        (window.devicePixelRatio || 1),
    );
    if (window.visualViewport) {
      lines.push("visualViewport: " + Math.round(window.visualViewport.width) + "×" + Math.round(window.visualViewport.height));
    }
    lines.push("Касания: " + (n.maxTouchPoints || 0));
    try {
      lines.push("Пояс: " + Intl.DateTimeFormat().resolvedOptions().timeZone);
    } catch {
      /* ignore */
    }
    const theme = document.documentElement.getAttribute("data-theme") || "";
    const wide = document.documentElement.getAttribute("data-wide") || "";
    if (theme) lines.push("Тема: " + theme);
    if (wide) lines.push("Широкий экран: " + (wide === "1" ? "да" : "нет"));
    try {
      const paid = localStorage.getItem("yurec-license");
      const dev = localStorage.getItem("yurec-dev");
      lines.push("Лицензия: " + (dev === "1" ? "разработчик" : paid ? "есть" : "нет"));
    } catch {
      /* ignore */
    }
  } catch {
    /* ignore */
  }
  if (!lines.length) return "браузер";
  const seen = new Set<string>();
  return lines.filter((l) => {
    if (seen.has(l)) return false;
    seen.add(l);
    return true;
  }).join("\n");
}

export function buildBugBody(text: string) {
  const device = deviceInfoBlock();
  const ver = (() => {
    try {
      return document.querySelector("meta[name='yurec-version']")?.getAttribute("content") || "";
    } catch {
      return "";
    }
  })();
  return (
    "Баг в «Жизнь Юрца»\n\n" +
    text.trim() +
    "\n\n— — —\n" +
    (ver ? "Версия: " + ver + "\n" : "") +
    device +
    "\n\n(Если есть скриншот или запись экрана — прикрепите к письму или пришлите следом в Telegram.)"
  );
}
