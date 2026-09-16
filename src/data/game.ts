import dayJson from "./game-script.json";
import olimpikJson from "./game-olimpik.json";
import tsarJson from "./game-tsar.json";
import mirageJson from "./game-mirage.json";
import dinnerJson from "./game-dinner.json";
import changelogJson from "./changelog.json";

export type GameStats = Record<string, number>;

export type GameChoice = {
  label: string;
  to: string;
  delta?: GameStats;
  need?: GameStats;
};

export type GameNode = {
  title: string;
  text: string;
  choices?: GameChoice[];
  end?: string;
};

export type GameEndingMeta = {
  id: string;
  title: string;
  rank: string;
};

export type GameScript = {
  id: string;
  number: number;
  shortTitle: string;
  cover: string;
  storySlug: string;
  storyCta: string;
  title: string;
  kicker: string;
  beta: boolean;
  pitch: string;
  start: string;
  stats: { key: string; label: string }[];
  startStats: GameStats;
  endings: GameEndingMeta[];
  nodes: Record<string, GameNode>;
};

export type GameSave = {
  node: string;
  stats: GameStats;
  steps: number;
};

export const LEVELS: GameScript[] = [
  dayJson as unknown as GameScript,
  olimpikJson as unknown as GameScript,
  tsarJson as unknown as GameScript,
  mirageJson as unknown as GameScript,
  dinnerJson as unknown as GameScript,
];

export const QUEST_COVER = `/game/quest.jpg?v=${changelogJson.version}`;
export const CROSSWORDS_COVER = `/game/crosswords.jpg?v=${changelogJson.version}`;
export const AV_COVER = `/game/av.jpg?v=${changelogJson.version}`;
export const ARK_COVER = `/game/ark.jpg?v=${changelogJson.version}`;

export const QUEST_PITCH = [
  "Ты — Юрец. Не читатель саги и не Костя с красной икрой — а сам император панельных джунглей!",
  "Читать про него — одно. Быть им — совсем другое. Это твой уникальный шанс залезть в шкуру помойного короля с куполами и каждый день решать главный вопрос его жизни: шаверма, «Путинка» или снова на смену к Лысому херу.",
  "Почувствуй себя легендой! Принимай решения, будто уже выпил литр «Финляндии».",
  "Логика здесь отдыхает (это же Юрец).",
  "У каждого уровня свой нелинейный сюжет и альтернативные концовки.",
];

export const CROSSWORD_PITCH = [
  "Ты не Юрец. Ты — тот самый дурак с карандашом, который в киоске на Шотмана купил «Метро» и решил, что кроссворд — это судьба.",
  "Золотые клетки орёт Гоша. Лысый хер смотрит через плечо и говорит, что ты никто. Зинаида орёт из бака, что буква «Ы» — это не буква, а образ жизни.",
  "Если не знаешь слово — ври, как Юрец. Если знаешь — всё равно ври. Двор не любит умников. Двор любит буквы.",
  "Чит-код открывает сетку. Золотое слово — нет. Гоша смотрит. Гоша всегда смотрит.",
];

export const AV_CHAIN = ["povar", "lysy", "yasher", "batya", "sveta", "kostya"] as const;

export function avBeatenCount() {
  try {
    const raw = JSON.parse(localStorage.getItem("yurec-av-wins") || "{}") as Record<string, unknown>;
    return AV_CHAIN.reduce((n, id) => n + (Number(raw[id]) > 0 ? 1 : 0), 0);
  } catch {
    return 0;
  }
}

export const ARK_CHAIN = ["flat", "olimp", "maxi", "yard", "boss", "tolik", "pharm", "fsb", "batya", "kostya"] as const;

export function arkBeatenCount() {
  try {
    const raw = JSON.parse(localStorage.getItem("yurec-ark-wins") || "{}") as Record<string, unknown>;
    return ARK_CHAIN.reduce((n, id) => n + (Number(raw[id]) > 0 ? 1 : 0), 0);
  } catch {
    return 0;
  }
}

export const QUEST_HUB_BLURB =
  "Ты — Юрец. Шаверма, «Путинка» или смена к Лысому. Пять сценариев, концовки разные, логика отдыхает.";

export const CROSSWORD_HUB_BLURB =
  "Кроссворд из киоска на Шотмана. Гоша орёт золотые клетки. Не знаешь слово — ври, как Юрец.";

export const AV_HUB_BLURB =
  "Юрец снизу, колобок сверху. Пилюли с помойки, лазер и просрочка. Кто взял яд — сам сдох. Двор орёт с каждого гола.";

export const ARK_HUB_BLURB =
  "Харя Юрца — ракетка. Десять дворов: от квартиры до Кости. Батя с дробовиком, аптека, камера. Юрец всё равно легенда.";

const game = LEVELS[0];

export function getLevel(id: string) {
  return LEVELS.find((l) => l.id === id);
}

export function clampStat(n: number) {
  return Math.max(0, Math.min(100, Math.round(n)));
}

export function applyDelta(stats: GameStats, delta?: GameStats): GameStats {
  const next: GameStats = { ...stats };
  if (!delta) return next;
  for (const key of Object.keys(delta)) {
    next[key] = clampStat((next[key] ?? 0) + (delta[key] ?? 0));
  }
  return next;
}

export function freshStats(script: GameScript = game): GameStats {
  const next: GameStats = {};
  for (const s of script.stats) {
    next[s.key] = clampStat(script.startStats[s.key] ?? 0);
  }
  return next;
}

export function getNode(script: GameScript, id: string) {
  return script.nodes[id];
}

export function endingMeta(script: GameScript, id: string) {
  return script.endings.find((e) => e.id === id);
}

export function endingNode(script: GameScript, id: string) {
  return Object.values(script.nodes).find((n) => n.end === id);
}

export const RANK_TONE: Record<string, string> = {
  триумф: "bg-end-win text-end-win-fg",
  канон: "bg-end-canon text-end-canon-fg",
  позор: "bg-end-shame text-end-shame-fg",
  тишина: "bg-end-quiet text-end-quiet-fg",
  редкая: "bg-end-rare text-end-rare-fg",
  хвастовство: "bg-end-boast text-end-boast-fg",
  "триумф мелкий": "bg-end-small text-end-small-fg",
};

export function meetsNeed(stats: GameStats, need?: GameStats) {
  if (!need) return true;
  return Object.keys(need).every((key) => (stats[key] ?? 0) >= (need[key] ?? 0));
}

export function needHint(script: GameScript, need?: GameStats) {
  if (!need) return "";
  return script.stats
    .filter((s) => need[s.key] != null)
    .map((s) => `${s.label} ${need[s.key]}+`)
    .join(" · ");
}

export function verdictFor(script: GameScript, stats: GameStats) {
  if (script.id === "dinner") {
    const parts: string[] = [];
    const vodka = stats.vodka ?? 0;
    const stew = stats.stew ?? 0;
    const svetka = stats.svetka ?? 0;
    const throne = stats.throne ?? 0;
    if (vodka >= 70) parts.push("«Путинка» вместо чая");
    else if (vodka >= 40) parts.push("перегар как «Шипр»");
    if (stew >= 70) parts.push("мишлен из банки");
    else if (stew >= 40) parts.push("макароны ещё держат");
    if (svetka >= 50) parts.push("ещё целует фотку");
    else if (svetka <= 8) parts.push("сарай без царицы");
    if (throne >= 60) parts.push("князь гвоздей");
    else if (throne >= 30) parts.push("жилетка уже на плечах");
    return parts.length ? parts.join(" · ") : "просто Юрец и его кастрюля";
  }
  if (script.id === "mirage") {
    const parts: string[] = [];
    const vodka = stats.vodka ?? 0;
    const svetka = stats.svetka ?? 0;
    const romance = stats.romance ?? 0;
    const doubt = stats.doubt ?? 0;
    if (vodka >= 70) parts.push("тосты за мираж");
    else if (vodka >= 40) parts.push("романтика на «Путинке»");
    if (svetka >= 70) parts.push("на одной волне");
    else if (svetka >= 40) parts.push("ещё целует портрет");
    else if (svetka <= 12) parts.push("НЛО над сервантом");
    if (romance >= 60) parts.push("люстра как дворец");
    else if (romance >= 30) parts.push("шпроты на скатерти");
    if (doubt >= 55) parts.push("мираж, как НЛО");
    else if (doubt >= 30) parts.push("Костя уже ржёт");
    return parts.length ? parts.join(" · ") : "просто Юрец и его царица";
  }
  if (script.id === "tsar") {
    const parts: string[] = [];
    const vodka = stats.vodka ?? 0;
    const analog = stats.analog ?? 0;
    const svetka = stats.svetka ?? 0;
    const net = stats.net ?? 0;
    if (vodka >= 70) parts.push("Путинка в 1978-м");
    else if (vodka >= 40) parts.push("перегар как антенна");
    if (analog >= 70) parts.push("царь без Wi-Fi");
    else if (analog >= 40) parts.push("диск ещё тёплый");
    else if (analog <= 20) parts.push("почти купил смартфон");
    if (svetka >= 50) parts.push("стихи на газете");
    else if (svetka <= 8) parts.push("SMS так и не ушло");
    if (net >= 60) parts.push("шпионы в розетке");
    else if (net >= 30) parts.push("Зинаида уже в эфире");
    return parts.length ? parts.join(" · ") : "просто Юрец без интернета";
  }
  if (script.id === "olimpik") {
    const parts: string[] = [];
    const vodka = stats.vodka ?? 0;
    const craft = stats.craft ?? 0;
    const boss = stats.boss ?? 0;
    const nerve = stats.nerve ?? 0;
    if (vodka >= 70) parts.push("Путинка в жилетке");
    else if (vodka >= 40) parts.push("перегар как знамя");
    if (craft >= 70) parts.push("фараон линолеума");
    else if (craft >= 40) parts.push("режет, как ниндзя");
    if (boss >= 60) parts.push("лысый уже орёт");
    else if (boss >= 30) parts.push("кабинет не спит");
    if (nerve <= 20) parts.push("смена мертва");
    else if (nerve >= 55) parts.push("ещё в штате, чудом");
    return parts.length ? parts.join(" · ") : "просто Юрец на Челиева";
  }
  const parts: string[] = [];
  const vodka = stats.vodka ?? 0;
  const legend = stats.legend ?? 0;
  const svetka = stats.svetka ?? 0;
  const heat = stats.heat ?? 0;
  if (vodka >= 70) parts.push("Наполеон без бахил");
  else if (vodka >= 40) parts.push("после трёх «Путинок»");
  if (legend >= 70) parts.push("император Шотмана");
  else if (legend >= 40) parts.push("царь линолеума");
  if (svetka >= 50) parts.push("ещё верит в Светку");
  else if (svetka <= 8) parts.push("трубка давно молчит");
  if (heat >= 60) parts.push("на карандаше у ментов");
  else if (heat >= 30) parts.push("район уже шушукается");
  return parts.length ? parts.join(" · ") : "просто Юрец, и этого хватает";
}
