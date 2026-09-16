import storiesJson from "./stories.json";
import videosJson from "./videos.json";
import changelogJson from "./changelog.json";
import charactersJson from "./characters.json";
import pressJson from "./press.json";

export type StoryKind = "episode" | "visit" | "sms" | "song";

export type Story = {
  slug: string;
  code: string;
  season: number;
  number: number;
  suffix: string;
  title: string;
  date: string;
  telegramId: number;
  telegramUrl?: string;
  youtubeId: string | null;
  body: string;
  kind: StoryKind;
  minutes: number;
  tags: string[];
  excerpt: string;
  paid?: boolean;
};

export type MediaKind = "episode" | "short" | "song" | "other" | "press" | "call";

export type Video = {
  id: string;
  title: string;
  code: string;
  storySlug?: string;
  kind: MediaKind;
  date: string;
  thumb?: string;
  telegramId?: number;
  mediaType?: "youtube" | "image";
  caption?: string;
  duration?: string;
};

export type SmsMessage = { at: string; text: string };

export type ChangelogEntry = {
  version: string;
  at: string;
  items: string[];
};

export type CharacterRef = { slug: string; label: string };

export type Character = {
  id: string;
  name: string;
  aka: string;
  role: string;
  group: string;
  quote: string;
  quotes: string[];
  bio: string;
  vibe: string;
  photo: string;
  refs: CharacterRef[];
};

export type PressPage = { src: string; title: string; caption: string };

export type PressIssue = {
  id: string;
  number: number;
  title: string;
  date: string;
  kicker: string;
  cover: string;
  pitch: string;
  headline?: string;
  pages: PressPage[];
};

export const stories = storiesJson as Story[];
export const videos = videosJson as Video[];
export const characters = charactersJson as Character[];
export const PRESS_ISSUES = pressJson as PressIssue[];

export const APP_VERSION = changelogJson.version;
export const BUILD_AT = changelogJson.buildAt;
export const CHANGELOG = changelogJson.history as ChangelogEntry[];

export const KIND_BANNERS: Record<"all" | StoryKind, string> = {
  all: `/og.jpg?v=${changelogJson.version}`,
  episode: `/banners/episode.jpg?v=${changelogJson.version}`,
  song: `/banners/song.jpg?v=${changelogJson.version}`,
  visit: `/banners/visit.jpg?v=${changelogJson.version}`,
  sms: `/banners/sms.jpg?v=${changelogJson.version}`,
};

export const KIND_LABEL: Record<StoryKind, string> = {
  episode: "Серия",
  visit: "Визит",
  sms: "Спецвыпуск",
  song: "Песня",
};

export const TELEGRAM_URL = "https://t.me/yurec_xuec";
export const YOUTUBE_URL = "https://www.youtube.com/@yurec_xuec/videos";
export const YOUTUBE_SHORTS = "https://www.youtube.com/@yurec_xuec/shorts";
export const YOUTUBE_CHANNEL = "https://www.youtube.com/@yurec_xuec";

export const DONATION_AMOUNT = "1000 ₽";
export const DONATION_COMMENT = "Жизнь Юрца";
export const DONATION_CARD = "2200 7001 4728 7493";
export const DONATION_BANK = "Т-Банк";
export const DONATION_TG = "https://t.me/nick_stokes";

const bySlug = new Map(stories.map((s) => [s.slug, s]));

export function getStory(slug: string) {
  return bySlug.get(slug);
}

export function getCharacter(id: string) {
  return characters.find((c) => c.id === id);
}

export const CHAR_GROUPS = [
  { id: "all", label: "Все" },
  { id: "двор", label: "Двор" },
  { id: "банда", label: "Банда" },
  { id: "семья", label: "Семья" },
  { id: "друзья", label: "Друзья" },
  { id: "любовь", label: "Любовь" },
  { id: "работа", label: "Работа" },
  { id: "бестиарий", label: "Дом" },
] as const;

/** Во вкладке «Дом» эти id всегда в хвосте. Во «Всех» остаётся порядок массива. */
export const HOME_TAIL_IDS = ["zhiletka", "pero", "portret", "kurtka"] as const;
/** Во вкладке «Двор» этот id всегда в хвосте. */
export const DVOR_TAIL_IDS = ["svetdom"] as const;

const GROUP_TAILS: Record<string, readonly string[]> = {
  бестиарий: HOME_TAIL_IDS,
  двор: DVOR_TAIL_IDS,
};

export function charactersForGroup(group: string): Character[] {
  if (group === "all") return characters;
  const list = characters.filter((c) => c.group === group);
  const tailIds = GROUP_TAILS[group];
  if (!tailIds) return list;
  const tailSet = new Set<string>(tailIds);
  const rest = list.filter((c) => !tailSet.has(c.id));
  const tail = tailIds.map((id) => list.find((c) => c.id === id)).filter(
    (c): c is Character => Boolean(c),
  );
  return [...rest, ...tail];
}

export function youtubeWatchUrl(id: string) {
  return `https://www.youtube.com/watch?v=${id}`;
}

export function youtubeThumb(id: string) {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}

export function bakedThumb(id: string) {
  const v = videos.find((x) => x.id === id);
  if (v?.thumb) return v.thumb.split("?")[0];
  return `/thumbs/${id}.jpg`;
}

export function coverFallback(kind: MediaKind | string) {
  if (kind === "song") return KIND_BANNERS.song;
  return KIND_BANNERS.episode;
}

export function videoCover(video: Video) {
  if (video.thumb) return video.thumb;
  if (video.mediaType === "image") return "";
  if (video.id) return bakedThumb(video.id);
  return "";
}

export function isYoutubeMedia(video: Video) {
  return video.mediaType !== "image";
}

export const MEDIA_CATS = [
  {
    id: "video",
    kind: "episode" as const,
    label: "Видео",
    kicker: "Радуга",
    hint: "серии",
    image: `/media/tile-video.jpg?v=${changelogJson.version}`,
  },
  {
    id: "shorts",
    kind: "short" as const,
    label: "Shorts",
    kicker: "Лента",
    hint: "шортсы",
    image: `/media/tile-shorts.jpg?v=${changelogJson.version}`,
  },
  {
    id: "songs",
    kind: "song" as const,
    label: "Песни",
    kicker: "Магнитофон",
    hint: "песни",
    image: `/media/tile-songs.jpg?v=${changelogJson.version}`,
  },
  {
    id: "press",
    kind: "press" as const,
    label: "Газета",
    kicker: "Пресса",
    hint: "выпуски",
    image: `/media/tile-press.jpg?v=${changelogJson.version}`,
  },
  {
    id: "call",
    kind: "call" as const,
    label: "Звонки",
    kicker: "Трубка",
    hint: "записи",
    image: `/media/tile-calls.jpg?v=${changelogJson.version}`,
  },
  {
    id: "other",
    kind: "other" as const,
    label: "Другое",
    kicker: "Альбом",
    hint: "приколы",
    image: `/media/tile-other.jpg?v=${changelogJson.version}`,
  },
] as const;

export type MediaCatId = (typeof MEDIA_CATS)[number]["id"];

export function getMediaCat(id: string) {
  return MEDIA_CATS.find((c) => c.id === id);
}

export function getPressIssue(id: string) {
  return PRESS_ISSUES.find((i) => i.id === id);
}

export function formatRuDate(iso: string) {
  const [y, m, d] = String(iso || "").split("-");
  if (!y || !m || !d) return iso;
  return `${d}.${m}.${y}`;
}

export function pressTitle(issue: { number: number; date: string; headline?: string }) {
  const base = `Выпуск №${issue.number} от ${formatRuDate(issue.date)}`;
  return issue.headline ? `${base} — ${issue.headline}` : base;
}

export function mediaByCat(id: string) {
  const cat = getMediaCat(id);
  if (!cat) return [];
  return videos.filter((v) => v.kind === cat.kind);
}

export function telegramPostUrl(id: number) {
  if (!id) return TELEGRAM_URL;
  return `${TELEGRAM_URL}/${id}`;
}

export function storyTelegramHref(story: { telegramUrl?: string; telegramId?: number }) {
  if (story.telegramUrl) return story.telegramUrl;
  if (story.telegramId) return telegramPostUrl(story.telegramId);
  return "";
}

export function ruCount(n: number, kind: StoryKind | "all"): string {
  const n10 = n % 10;
  const n100 = n % 100;
  const form = (one: string, few: string, many: string) => {
    if (n10 === 1 && n100 !== 11) return `${n} ${one}`;
    if (n10 >= 2 && n10 <= 4 && (n100 < 12 || n100 > 14)) return `${n} ${few}`;
    return `${n} ${many}`;
  };
  if (kind === "all") return form("публикация", "публикации", "публикаций");
  if (kind === "episode") return form("рассказ", "рассказа", "рассказов");
  if (kind === "song") return form("песня", "песни", "песен");
  if (kind === "visit") return form("визит", "визита", "визитов");
  return form("бонус", "бонуса", "бонусов");
}

export function formatCode(story: Story) {
  if (story.kind === "episode") return displayEpisodeCode(story.code, story.title);
  return KIND_LABEL[story.kind];
}

function fold(value: string) {
  return value.toLowerCase().replaceAll("ё", "е").replaceAll("Ё", "е");
}

export type SortMode = "old" | "new" | "az" | "za";
export const SORT_MODES: SortMode[] = ["old", "new", "az", "za"];
const SORT_KEY = "yurec-sort-mode";
const SORT_LEGACY = "yurec-newest";

export function readSortMode(): SortMode {
  try {
    const stored = localStorage.getItem(SORT_KEY);
    if (stored === "old" || stored === "new" || stored === "az" || stored === "za") return stored;
    if (localStorage.getItem(SORT_LEGACY) === "1") return "new";
  } catch {
    /* ignore */
  }
  return "old";
}

export function writeSortMode(mode: SortMode) {
  try {
    localStorage.setItem(SORT_KEY, mode);
    localStorage.setItem(SORT_LEGACY, mode === "new" ? "1" : "0");
  } catch {
    /* ignore */
  }
}

export function cycleSortMode(mode: SortMode): SortMode {
  const i = SORT_MODES.indexOf(mode);
  return SORT_MODES[(i + 1) % SORT_MODES.length];
}

export function channelForCat(id: string): { href: string; kind: "yt" | "tg" } {
  if (id === "video") return { href: YOUTUBE_URL, kind: "yt" };
  if (id === "shorts" || id === "songs") return { href: YOUTUBE_SHORTS, kind: "yt" };
  return { href: TELEGRAM_URL, kind: "tg" };
}

export type EpisodeKey = {
  season: number;
  episode: number;
  suffix: number;
  teaser: number;
};

export function parseEpisodeCode(code?: string, title?: string): EpisodeKey | null {
  const src = `${code || ""} ${title || ""}`;
  const match = src.match(/s\s*(\d+)\s*e\s*(\d+)([a-z])?/i);
  if (!match) return null;
  const teaser = /\(тизер\)|\bтизер\b/i.test(src) ? 0 : 1;
  const suffix = match[3] ? match[3].toLowerCase().charCodeAt(0) - 96 : 0;
  return {
    season: Number(match[1]),
    episode: Number(match[2]),
    suffix,
    teaser,
  };
}

export function displayEpisodeCode(code?: string, title?: string) {
  const key = parseEpisodeCode(code, title);
  if (!key) return code || "";
  const letter = key.suffix ? String.fromCharCode(96 + key.suffix) : "";
  return `s${String(key.season).padStart(2, "0")}e${String(key.episode).padStart(2, "0")}${letter}`;
}

export function mediaStamp(item: { code?: string; title?: string; duration?: string; kind?: string; mediaType?: string }) {
  const code = displayEpisodeCode(item.code, item.title) || item.code || "";
  if (item.mediaType === "image" || /^фото$/i.test(String(item.code || ""))) return code;
  if (item.duration && code) return `${code} · ${item.duration}`;
  return item.duration || code;
}

export function episodeRank(code?: string, title?: string) {
  const key = parseEpisodeCode(code, title);
  if (!key) return null;
  return key.season * 1_000_000 + key.episode * 1_000 + key.suffix * 10 + key.teaser;
}

function isEpisodeItem(item: { code?: string; title?: string; kind?: string }) {
  if (item.kind && item.kind !== "episode") return false;
  return episodeRank(item.code, item.title) != null;
}

function alphaTitle(item: { code?: string; title?: string }) {
  return String(item.title || "")
    .replace(/s\s*\d+\s*e\s*\d+[a-z]?\s*[—\-:.]?\s*/i, "")
    .trim();
}

export function applyOrder<T extends { date: string; title?: string; code?: string; kind?: string }>(
  list: T[],
  mode: SortMode,
) {
  const copy = list.slice();
  if (mode === "az" || mode === "za") {
    copy.sort((a, b) => {
      const t = alphaTitle(a).localeCompare(alphaTitle(b), "ru", { sensitivity: "base" });
      return mode === "za" ? -t : t;
    });
    return copy;
  }

  const newest = mode === "new";
  const episodes = copy.filter((item) => isEpisodeItem(item));
  const others = copy.filter((item) => !isEpisodeItem(item));

  if (others.length === 0) {
    copy.sort((a, b) => {
      const ra = episodeRank(a.code, a.title);
      const rb = episodeRank(b.code, b.title);
      if (ra != null && rb != null && ra !== rb) return newest ? rb - ra : ra - rb;
      const d = a.date.localeCompare(b.date);
      if (d) return newest ? -d : d;
      return String(a.title || "").localeCompare(String(b.title || ""), "ru");
    });
    return copy;
  }

  if (episodes.length === 0) {
    copy.sort((a, b) => {
      const d = a.date.localeCompare(b.date);
      if (d) return newest ? -d : d;
      return String(a.title || "").localeCompare(String(b.title || ""), "ru");
    });
    return copy;
  }

  episodes.sort((a, b) => (episodeRank(a.code, a.title) ?? 0) - (episodeRank(b.code, b.title) ?? 0));
  others.sort((a, b) => {
    const d = a.date.localeCompare(b.date);
    if (d) return d;
    return String(a.title || "").localeCompare(String(b.title || ""), "ru");
  });

  const result = episodes.slice();
  for (const extra of others) {
    let idx = result.length;
    for (let i = 0; i < result.length; i++) {
      if (isEpisodeItem(result[i]) && result[i].date > extra.date) {
        idx = i;
        break;
      }
    }
    result.splice(idx, 0, extra);
  }
  return newest ? result.reverse() : result;
}

export function searchMedia<T extends { title?: string; code?: string; kicker?: string }>(
  list: T[],
  query: string,
) {
  const q = fold(query.trim());
  if (!q) return list;
  return list.filter((item) =>
    fold([item.title, item.code, item.kicker].filter(Boolean).join(" ")).includes(q),
  );
}

export function searchStories(query: string, kind?: StoryKind | "all", tag?: string) {
  const q = fold(query.trim());
  return stories.filter((s) => {
    if (kind && kind !== "all" && s.kind !== kind) return false;
    if (tag && !s.tags.includes(tag)) return false;
    if (!q) return true;
    return fold([s.title, s.code, s.excerpt, s.body, s.tags.join(" ")].join("\n")).includes(q);
  });
}

export function adjacentStories(slug: string) {
  const episodes = stories
    .filter((s) => s.kind === "episode")
    .slice()
    .sort((a, b) => (episodeRank(a.code, a.title) ?? 0) - (episodeRank(b.code, b.title) ?? 0));
  const idx = episodes.findIndex((s) => s.slug === slug);
  if (idx < 0) {
    const allIdx = stories.findIndex((s) => s.slug === slug);
    return {
      prev: allIdx > 0 ? stories[allIdx - 1] : undefined,
      next: allIdx >= 0 && allIdx < stories.length - 1 ? stories[allIdx + 1] : undefined,
    };
  }
  return {
    prev: idx > 0 ? episodes[idx - 1] : undefined,
    next: idx < episodes.length - 1 ? episodes[idx + 1] : undefined,
  };
}

const SMS_DATE = /^(\d{1,2} [а-яё]+ \d{4}, \d{1,2}:\d{2})(?:\s*[:—]\s*(.*))?$/i;

export function parseSmsThread(body: string) {
  const intro: string[] = [];
  const messages: SmsMessage[] = [];
  let current: SmsMessage | null = null;
  let started = false;
  for (const raw of body.split("\n")) {
    const line = raw.trim();
    const match = line.match(SMS_DATE);
    if (match) {
      if (current?.text) messages.push(current);
      current = { at: match[1], text: (match[2] || "").trim() };
      started = true;
      continue;
    }
    if (!started) {
      if (line) intro.push(line);
      continue;
    }
    if (!line) {
      if (current?.text) {
        messages.push(current);
        current = null;
      }
      continue;
    }
    if (!current) continue;
    current.text = current.text ? `${current.text}\n${line}` : line;
  }
  if (current?.text) messages.push(current);
  return { intro, messages };
}

export const stats = {
  stories: stories.length,
  episodes: stories.filter((s) => s.kind === "episode").length,
  videos: videos.length,
  songs: stories.filter((s) => s.kind === "song").length,
  sms: stories.filter((s) => s.kind === "sms").length,
};

