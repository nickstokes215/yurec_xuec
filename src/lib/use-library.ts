import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { listBookmarks, listProgress, saveProgress, toggleBookmark } from "@/lib/library";
import { markStoryRead, canAutoMark } from "@/lib/use-read";
import { getStory } from "@/data/catalog";

const BOOK_KEY = "yurec-bookmarks";
const LAST_KEY = "yurec-last";

let lastSent = { slug: "", at: 0, percent: -1 };
let lastLocal = { slug: "", at: 0, percent: -1 };
const lastListeners = new Set<() => void>();

function emitLast() {
  lastListeners.forEach((fn) => fn());
}

function readList(key: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export type LastRead = { slug: string; percent: number };

let snapRaw: string | null | undefined;
let snapVal: LastRead | null = null;

function parseLast(raw: string | null): LastRead | null {
  if (!raw) return null;
  const parsed = JSON.parse(raw) as LastRead;
  const percent = Number(parsed?.percent);
  if (parsed && typeof parsed.slug === "string" && Number.isFinite(percent)) {
    return { slug: parsed.slug, percent };
  }
  return null;
}

export function readLast(): LastRead | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LAST_KEY);
    if (raw === snapRaw) return snapVal;
    snapRaw = raw;
    snapVal = parseLast(raw);
    return snapVal;
  } catch {
    snapRaw = null;
    snapVal = null;
    return null;
  }
}

export function writeLast(slug: string, percent: number) {
  try {
    localStorage.setItem(LAST_KEY, JSON.stringify({ slug, percent }));
  } catch {
    /* ignore */
  }
  emitLast();
}

function subscribeLast(cb: () => void) {
  lastListeners.add(cb);
  if (typeof window !== "undefined") window.addEventListener("storage", cb);
  return () => {
    lastListeners.delete(cb);
    if (typeof window !== "undefined") window.removeEventListener("storage", cb);
  };
}

export function useLastRead() {
  return useSyncExternalStore(subscribeLast, readLast, () => null);
}

export function useBookmarks() {
  const { user, isPending } = useCurrentUserState();
  const [slugs, setSlugs] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setSlugs(readList(BOOK_KEY));
    setReady(true);
  }, []);

  useEffect(() => {
    if (isPending || !user) return;
    void listBookmarks()
      .then((rows) => {
        const next = rows.map((r) => r.story_slug);
        setSlugs(next);
        try {
          localStorage.setItem(BOOK_KEY, JSON.stringify(next));
        } catch {
          /* ignore */
        }
      })
      .catch(() => {
        /* keep local */
      });
  }, [user, isPending]);

  const has = useCallback((slug: string) => slugs.includes(slug), [slugs]);

  const toggle = useCallback(
    async (slug: string) => {
      const next = slugs.includes(slug) ? slugs.filter((s) => s !== slug) : [slug, ...slugs];
      setSlugs(next);
      try {
        localStorage.setItem(BOOK_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      if (user) {
        try {
          await toggleBookmark({ data: slug });
        } catch {
          /* local copy remains */
        }
      }
    },
    [slugs, user],
  );

  return { slugs, has, toggle, ready };
}

export function persistProgress(slug: string, percent: number, signedIn: boolean) {
  if (percent < 3) return;
  const story = getStory(slug);
  if (percent >= 90 && canAutoMark(slug) && (!story || story.kind === "episode")) markStoryRead(slug);
  const now = Date.now();
  const jump = Math.abs(percent - lastLocal.percent);
  if (
    lastLocal.slug !== slug ||
    jump >= 2 ||
    percent >= 98 ||
    now - lastLocal.at > 400
  ) {
    lastLocal = { slug, at: now, percent };
    writeLast(slug, percent);
  }
  if (!signedIn) return;
  if (
    lastSent.slug === slug &&
    now - lastSent.at < 2500 &&
    Math.abs(percent - lastSent.percent) < 10 &&
    percent < 98
  ) {
    return;
  }
  lastSent = { slug, at: now, percent };
  void saveProgress({ data: { slug, percent } }).catch(() => undefined);
}

export function useContinueStory() {
  const { user, isPending } = useCurrentUserState();
  const local = useLastRead();
  const [remote, setRemote] = useState<LastRead | null>(null);

  useEffect(() => {
    if (isPending || !user) return;
    void listProgress()
      .then((rows) => {
        const top = rows[0];
        if (top) setRemote({ slug: top.story_slug, percent: top.percent });
      })
      .catch(() => undefined);
  }, [user, isPending]);

  const pick = usableLast(remote) ?? usableLast(local);
  return pick;
}

function usableLast(x: LastRead | null): LastRead | null {
  if (!x || !x.slug) return null;
  if (x.percent <= 3 || x.percent >= 99) return null;
  return x;
}
