const FILE_NAME = "Жизнь Юрца.json";

export type BackupFile = {
  kind: "yurec-spravka";
  version: number;
  at: string;
  keys: Record<string, string>;
};

function allYurec(): Record<string, string> {
  const out: Record<string, string> = {};
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k || !k.startsWith("yurec-")) continue;
      const v = localStorage.getItem(k);
      if (v != null) out[k] = v;
    }
  } catch {
    /* ignore */
  }
  return out;
}

export function makeBackup(): BackupFile {
  return {
    kind: "yurec-spravka",
    version: 1,
    at: new Date().toISOString(),
    keys: allYurec(),
  };
}

export async function exportBackup(): Promise<string> {
  const pack = makeBackup();
  const text = JSON.stringify(pack, null, 2);
  const native = (window as Window & { YurecNative?: { saveBackup?: (name: string, json: string) => string | void } }).YurecNative;
  if (native && typeof native.saveBackup === "function") {
    const r = native.saveBackup(FILE_NAME, text);
    if (r === "need") return "need";
    return "native";
  }
  const blob = new Blob([text], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = FILE_NAME;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 2000);
  return "file";
}

export function parseBackup(text: string): BackupFile {
  const raw = JSON.parse(text) as unknown;
  if (!raw || typeof raw !== "object") throw new Error("Пустой файл");
  const o = raw as Record<string, unknown>;
  const keys = o.keys;
  if (!keys || typeof keys !== "object") throw new Error("Нет прогресса в файле");
  const clean: Record<string, string> = {};
  for (const [k, v] of Object.entries(keys as Record<string, unknown>)) {
    if (!k.startsWith("yurec-")) continue;
    if (typeof v === "string") clean[k] = v;
  }
  if (!Object.keys(clean).length) throw new Error("В справке пусто");
  return {
    kind: "yurec-spravka",
    version: typeof o.version === "number" ? o.version : 1,
    at: typeof o.at === "string" ? o.at : "",
    keys: clean,
  };
}

export function applyBackup(pack: BackupFile) {
  const old: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith("yurec-")) old.push(k);
  }
  for (const k of old) localStorage.removeItem(k);
  for (const [k, v] of Object.entries(pack.keys)) localStorage.setItem(k, v);
  try {
    window.dispatchEvent(new Event("yurec-license-changed"));
    window.dispatchEvent(new Event("yurec-progress"));
    window.dispatchEvent(new Event("yurec-endings"));
    window.dispatchEvent(new Event("yurec-av-wins"));
    window.dispatchEvent(new Event("yurec-ark-wins"));
  } catch {
    /* ignore */
  }
}
