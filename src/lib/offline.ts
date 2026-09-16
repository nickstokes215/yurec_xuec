import pack from "@/data/offline-index.json";

export type OfflineItem = {
  id: string;
  videoId: string;
  storySlug: string | null;
  code: string;
  title: string;
  kind: string;
  file: string;
  ext?: string;
  url: string;
  size: number;
  sha256: string;
  md5: string;
  duration?: string;
};

export function offlineKindLabel(item: Pick<OfflineItem, "code" | "kind">) {
  const kind = String(item.kind || "");
  const code = String(item.code || "").toUpperCase();
  if (kind === "call" || code === "ЗВОНОК") return "Звонок";
  if (kind === "visit" || code.startsWith("VISIT")) return "Визит";
  if (kind === "short" || code === "SHORT") return "Shorts";
  return item.code || "";
}

export type OfflineState = "idle" | "downloading" | "cached" | "error";

export type OfflineSnap = {
  state: OfflineState;
  progress: number;
  error: string;
};

type Native = {
  download: (json: string) => void;
  playExternal: (id: string) => void;
  cancel: (id: string) => void;
  cachedJson: () => string;
  playUrl: (id: string) => string;
  remove?: (id: string) => void;
};

const items = (pack as { items: OfflineItem[] }).items;
const snaps = new Map<string, OfflineSnap>();
const listeners = new Set<() => void>();
let inited = false;

function native(): Native | null {
  const n = (window as Window & { YurecNative?: Native }).YurecNative;
  return n && typeof n.download === "function" ? n : null;
}

export function offlineExt(item: Pick<OfflineItem, "ext" | "kind" | "file">): "mp3" | "mp4" {
  if (item.ext === "mp3") return "mp3";
  const f = (item.file || "").toLowerCase();
  if (f.endsWith(".mp3") || item.kind === "call") return "mp3";
  return "mp4";
}

export function offlineMime(item: Pick<OfflineItem, "ext" | "kind" | "file">) {
  return offlineExt(item) === "mp3" ? "audio/mpeg" : "video/mp4";
}

export function isOfflineAudio(item: Pick<OfflineItem, "ext" | "kind" | "file">) {
  return offlineExt(item) === "mp3";
}

export function offlineItems(): OfflineItem[] {
  return items;
}

export function offlineForVideo(v: { id: string }): OfflineItem | undefined {
  return items.find((o) => o.videoId === v.id);
}

export function offlineForStory(s: { youtubeId?: string | null; slug: string; kind: string }): OfflineItem | undefined {
  if (s.youtubeId) {
    const hit = items.find((o) => o.videoId === s.youtubeId);
    if (hit) return hit;
  }
  return items.find((o) => o.storySlug === s.slug && o.kind === s.kind);
}

export function offlineSnap(id: string): OfflineSnap {
  return snaps.get(id) || { state: "idle", progress: 0, error: "" };
}

export function subscribeOffline(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function offlinePlayerMode(): "in" | "ext" {
  try {
    return localStorage.getItem("yurec-off-player") === "ext" ? "ext" : "in";
  } catch {
    return "in";
  }
}

export function setOfflinePlayerMode(mode: "in" | "ext") {
  try {
    localStorage.setItem("yurec-off-player", mode);
  } catch {
    /* ignore */
  }
  emit();
}

function emit() {
  listeners.forEach((fn) => fn());
}

function setSnap(id: string, next: OfflineSnap) {
  snaps.set(id, next);
  emit();
}

export function applyOfflineEvent(ev: { id: string; state: string; progress?: number; error?: string }) {
  const state = (ev.state as OfflineState) || "idle";
  setSnap(ev.id, {
    state: state === "cached" ? "cached" : state === "downloading" ? "downloading" : state === "error" ? "error" : "idle",
    progress: ev.progress || 0,
    error: ev.error || "",
  });
}

async function markCachedFromNative() {
  const n = native();
  if (!n) return;
  try {
    const raw = n.cachedJson();
    const ids = JSON.parse(raw) as string[];
    ids.forEach((id) => setSnap(id, { state: "cached", progress: 100, error: "" }));
  } catch {
    /* ignore */
  }
}

async function markCachedFromOpfs() {
  try {
    const root = await navigator.storage.getDirectory();
    const dir = await root.getDirectoryHandle("yurec-offline", { create: true });
    // @ts-expect-error — async iterator of directory
    for await (const [name] of dir.entries()) {
      if (typeof name === "string" && (name.endsWith(".mp4") || name.endsWith(".mp3"))) {
        setSnap(name.replace(/\.(mp4|mp3)$/i, ""), { state: "cached", progress: 100, error: "" });
      }
    }
  } catch {
    try {
      const raw = localStorage.getItem("yurec-offline-ids");
      if (!raw) return;
      (JSON.parse(raw) as string[]).forEach((id) => setSnap(id, { state: "cached", progress: 100, error: "" }));
    } catch {
      /* ignore */
    }
  }
}

function rememberId(id: string) {
  try {
    const cur = JSON.parse(localStorage.getItem("yurec-offline-ids") || "[]") as string[];
    if (cur.indexOf(id) < 0) cur.push(id);
    localStorage.setItem("yurec-offline-ids", JSON.stringify(cur));
  } catch {
    /* ignore */
  }
}

export function initOffline() {
  if (inited) return;
  inited = true;
  (window as Window & { yurecOfflineEvent?: (ev: { id: string; state: string; progress?: number; error?: string }) => void }).yurecOfflineEvent =
    applyOfflineEvent;
  void markCachedFromNative();
  if (!native()) void markCachedFromOpfs();
}

export function cachedCount() {
  initOffline();
  return items.filter((o) => offlineSnap(o.id).state === "cached").length;
}

export function packBytes() {
  return items.reduce((s, o) => s + (o.size || 0), 0);
}

export function formatBytes(n: number) {
  if (n >= 1073741824) return (n / 1073741824).toFixed(2).replace(".", ",") + " ГБ";
  if (n >= 1048576) return Math.round(n / 1048576) + " МБ";
  if (n >= 1024) return Math.round(n / 1024) + " КБ";
  return n + " Б";
}

function forgetId(id: string) {
  try {
    const cur = (JSON.parse(localStorage.getItem("yurec-offline-ids") || "[]") as string[]).filter((x) => x !== id);
    localStorage.setItem("yurec-offline-ids", JSON.stringify(cur));
  } catch {
    /* ignore */
  }
}

async function removeOpfs(id: string) {
  try {
    const root = await navigator.storage.getDirectory();
    const dir = await root.getDirectoryHandle("yurec-offline");
    for (const ext of ["mp4", "mp3"]) {
      try {
        await dir.removeEntry(id + "." + ext);
      } catch {
        /* ignore */
      }
    }
  } catch {
    /* ignore */
  }
}

export async function removeOffline(item: OfflineItem) {
  initOffline();
  const n = native() as (Native & { remove?: (id: string) => void }) | null;
  if (n && typeof n.remove === "function") n.remove(item.id);
  await removeOpfs(item.id);
  const mem = (window as Window & { __yurecBlob?: Record<string, string> }).__yurecBlob;
  if (mem && mem[item.id]) {
    try {
      URL.revokeObjectURL(mem[item.id]);
    } catch {
      /* ignore */
    }
    delete mem[item.id];
  }
  forgetId(item.id);
  setSnap(item.id, { state: "idle", progress: 0, error: "" });
}

const webQueue: OfflineItem[] = [];
let webRunning = false;
const webAbort = new Map<string, AbortController>();

export function startDownload(item: OfflineItem) {
  initOffline();
  const st = offlineSnap(item.id).state;
  if (st === "cached" || st === "downloading") return;
  const n = native();
  setSnap(item.id, { state: "downloading", progress: 0, error: "" });
  if (n) {
    n.download(
      JSON.stringify({
        id: item.id,
        url: item.url,
        size: item.size,
        sha256: item.sha256,
        ext: offlineExt(item),
      }),
    );
    return;
  }
  if (!webQueue.some((x) => x.id === item.id)) webQueue.push(item);
  void pumpWeb();
}

async function pumpWeb() {
  if (webRunning) return;
  webRunning = true;
  while (webQueue.length) {
    const item = webQueue.shift();
    if (item) await downloadWeb(item);
  }
  webRunning = false;
}

export function startDownloadAll() {
  items.forEach((item) => {
    if (offlineSnap(item.id).state !== "cached") startDownload(item);
  });
}

export function cancelDownload(item: OfflineItem) {
  native()?.cancel(item.id);
  const ac = webAbort.get(item.id);
  if (ac) ac.abort();
  webAbort.delete(item.id);
  for (let i = webQueue.length - 1; i >= 0; i--) {
    if (webQueue[i].id === item.id) webQueue.splice(i, 1);
  }
  setSnap(item.id, { state: "idle", progress: 0, error: "" });
}

export function playExternal(item: OfflineItem) {
  const n = native();
  if (n) {
    n.playExternal(item.id);
    return;
  }
  void playSrc(item).then((src) => {
    if (src) window.open(src, "_blank");
  });
}

export async function playOffline(item: OfflineItem) {
  if (offlinePlayerMode() === "ext") {
    playExternal(item);
    return;
  }
  const src = await playSrc(item);
  if (src) {
    window.dispatchEvent(new CustomEvent("yurec-offline-play", { detail: { src, title: item.title, id: item.id } }));
    return;
  }
  playExternal(item);
}

export async function playSrc(item: OfflineItem): Promise<string> {
  const n = native();
  if (n) return n.playUrl(item.id) || "";
  const mem = (window as Window & { __yurecBlob?: Record<string, string> }).__yurecBlob;
  if (mem && mem[item.id]) return mem[item.id];
  try {
    const root = await navigator.storage.getDirectory();
    const dir = await root.getDirectoryHandle("yurec-offline");
    const ext = offlineExt(item);
    let fh: FileSystemFileHandle;
    try {
      fh = await dir.getFileHandle(item.id + "." + ext);
    } catch {
      fh = await dir.getFileHandle(item.id + "." + (ext === "mp3" ? "mp4" : "mp3"));
    }
    const file = await fh.getFile();
    return URL.createObjectURL(file);
  } catch {
    return "";
  }
}

async function sha256Hex(buf: ArrayBuffer) {
  const digest = await crypto.subtle.digest("SHA-256", buf);
  const bytes = new Uint8Array(digest);
  let out = "";
  for (let i = 0; i < bytes.length; i++) out += bytes[i].toString(16).padStart(2, "0");
  return out;
}

async function downloadWeb(item: OfflineItem) {
  if (offlineSnap(item.id).state !== "downloading") return;
  const ac = new AbortController();
  webAbort.set(item.id, ac);
  try {
    const res = await fetch("/api/offline?mode=file&id=" + encodeURIComponent(item.id), { signal: ac.signal });
    if (!res.ok || !res.body) throw new Error("HTTP " + res.status);
    const total = Number(res.headers.get("content-length") || item.size || 0);
    const reader = res.body.getReader();
    const chunks: Uint8Array[] = [];
    let got = 0;
    let last = -1;
    for (;;) {
      if (ac.signal.aborted) return;
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        chunks.push(value);
        got += value.length;
        const pct = total > 0 ? Math.min(100, Math.floor((got * 100) / total)) : 0;
        if (pct !== last) {
          last = pct;
          setSnap(item.id, { state: "downloading", progress: pct, error: "" });
        }
      }
    }
    if (ac.signal.aborted) return;
    const blob = new Blob(chunks as BlobPart[], { type: offlineMime(item) });
    if (item.size && blob.size !== item.size) throw new Error("Размер не сошёлся");
    if (item.sha256 && blob.size <= 80 * 1024 * 1024) {
      const hex = await sha256Hex(await blob.arrayBuffer());
      if (hex !== item.sha256) throw new Error("SHA256 не сошёлся");
    }
    const ext = offlineExt(item);
    try {
      const root = await navigator.storage.getDirectory();
      const dir = await root.getDirectoryHandle("yurec-offline", { create: true });
      const fh = await dir.getFileHandle(item.id + "." + ext, { create: true });
      const w = await fh.createWritable();
      await w.write(blob);
      await w.close();
    } catch {
      /* OPFS может не быть — играем из памяти в этой сессии */
      (window as Window & { __yurecBlob?: Record<string, string> }).__yurecBlob = {
        ...((window as Window & { __yurecBlob?: Record<string, string> }).__yurecBlob || {}),
        [item.id]: URL.createObjectURL(blob),
      };
    }
    rememberId(item.id);
    setSnap(item.id, { state: "cached", progress: 100, error: "" });
  } catch (e) {
    if (ac.signal.aborted || (e instanceof DOMException && e.name === "AbortError")) {
      setSnap(item.id, { state: "idle", progress: 0, error: "" });
      return;
    }
    setSnap(item.id, { state: "error", progress: 0, error: e instanceof Error ? e.message : "Ошибка" });
  } finally {
    webAbort.delete(item.id);
  }
}
