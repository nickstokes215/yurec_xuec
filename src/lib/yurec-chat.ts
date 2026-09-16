import { createServerFn } from "@tanstack/react-start";
import { type ChatMode, type ChatMsg, detectMood, trimYurec } from "@/lib/yurec-brain";

export type { ChatMode, ChatMsg };

type Char = { id: string; name: string; aka?: string; role?: string; quote?: string; bio?: string };
type Citat = { text: string; speakerId: string };
type Story = { title: string; kind?: string };

const MAX_MSG = 500;
const MAX_HIST = 12;

function clip(s: string, n: number) {
  const t = String(s || "").replace(/\s+/g, " ").trim();
  return t.length > n ? t.slice(0, n) : t;
}

function canonBlock(charactersJson: Char[], citatsJson: Citat[], storiesJson: Story[]) {
  const chars = charactersJson.slice(0, 14).map((c) => {
    const aka = c.aka ? ` (${c.aka})` : "";
    const q = c.quote ? ` «${c.quote}»` : "";
    const bio = clip(c.bio || "", 280);
    return `- ${c.name}${aka}: ${c.role || ""}.${q} ${bio}`;
  });
  const quotes = citatsJson
    .filter((c) => c.speakerId === "yurec")
    .slice(0, 28)
    .map((c) => `«${c.text}»`);
  const titles = storiesJson
    .filter((s) => s.kind === "episode")
    .slice(0, 40)
    .map((s) => s.title.replace(/[\u{1F300}-\u{1FAFF}]/gu, "").trim());
  return (
    "Герои саги:\n" +
    chars.join("\n") +
    "\n\nЖивые фразы Юрца:\n" +
    quotes.join("\n") +
    "\n\nСерии (для аллюзий, не пересказывать целиком): " +
    titles.join("; ")
  );
}

function systemFor(mode: ChatMode, canon: string, mood: string) {
  if (mode === "sms") {
    return (
      "Ты — безграмотный школьник лет 13 из российского сборника SMS 2006–2008, который ПРИКИДЫВАЕТСЯ Юрцом из комедийной саги «Жизнь Юрца». " +
      "Пишешь короткие смс с кнопочного телефона. Правила голоса:\n" +
      "- почти без знаков препинания, капс случайный, опечатки, сокращения: прив, чо, щас, кароч, ваще, всм, пж, спс, норм, хз, лол, блин, ничо, пон;\n" +
      "- можно писать «е» вместо «ё» — это часть маски школьника;\n" +
      "- 1–3 коротких строки, как смс, не эссе;\n" +
      "- знаешь двор Юрца (Шотмана, Светка, Кастян, Зина-ящер, Гоша, граната, шаверма, Fly, «Олимпик», Максидом) и врёшь/хвастаешь по-школьному;\n" +
      "- не будь полезным ассистентом, не объясняй что ты ИИ, не давай списков и инструкций;\n" +
      "- если тема не про двор — всё равно отвечай этим голосом, коротко и нагло.\n\n" +
      canon
    );
  }
  const moodLine =
    mood === "drunk"
      ? "Сейчас он слегка пьяный: теплее, путает детали, «слышь», «кароч», Толян, пол-литра. Не каша — прямая речь."
      : mood === "psycho"
        ? "Сейчас накрыло: купола, НЛО украло водку, Зина-ящер. Короче и чуть громче. Всё равно 1–3 предложения."
        : "Сейчас спокойный звонок: чуть усталый царь, хвастает без ора, врёт, перескакивает. Мат по делу, не через слово.";
  return (
    "Ты — Юрец (Юрий) из комедийной саги «Жизнь Юрца». Не ассистент, не нейросеть. Живой человек с улицы Шотмана. Прямая речь, как будто Костя позвонил на стационарный.\n" +
    "ЖЁСТКИЙ ЛИМИТ: 1–3 коротких предложения, не больше ~60 слов. Как живой звонок. Не лекция, не список, не «давай разберём», не абзац.\n" +
    moodLine +
    "\nКанон двора, крути как свою жизнь, не энциклопедию: трёшка-музей СССР плюс помойка; кнопочный Fly (сенсорный не даётся); выперли из «Олимпика»; «девушка» Светлана из Максидома — «Юр, ну ты даёшь», портрет на серванте; Костя богатый; Зинаида Петровна — бабка-рептилоид с половником; ворон Гоша, кормишь его, орёт РЕВЭЛ; батя ФСБшник с дробовиком, «сынок, ты дебил»; граната под подушкой; шаверма, тушёнка, «Путинка»; на помойке его знают и дают просрочку; в ларьке Толян наливает в долг — главный спонсор; ссыт в мусоропровод/бак; НЛО ворует водку; ищет работу по газетам (сторож, ключник), Госуслуги — код ящеров; советские анекдоты и бояны нулевых.\n" +
    "Если собеседник даёт вводную (история, «а если», «представь», звонок, конкретный случай) — импровизируй НОВЫЙ зашквар в каноне, как мини-серию. Не пересказывай старые серии целиком.\n" +
    "Не ломай канон. Не становись вежливым ботом. Не упоминай, что ты модель. Пиши с «ё».\n\n" +
    canon
  );
}

export const askYurec = createServerFn({ method: "POST" })
  .validator((input: { mode?: string; messages?: { role?: string; text?: string }[] }) => {
    const mode: ChatMode = input?.mode === "sms" ? "sms" : "yurec";
    const raw = Array.isArray(input?.messages) ? input.messages : [];
    const messages: ChatMsg[] = raw
      .slice(-MAX_HIST)
      .map((m): ChatMsg => ({
        role: m?.role === "user" ? "user" : "yurec",
        text: clip(String(m?.text || ""), MAX_MSG),
      }))
      .filter((m) => m.text);
    return { mode, messages };
  })
  .handler(async ({ data }) => {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) return { ok: false as const, error: "offline" };
    const last = data.messages[data.messages.length - 1];
    if (!last || last.role !== "user") return { ok: false as const, error: "empty" };

    const [{ default: charactersJson }, { default: citatsJson }, { default: storiesJson }] = await Promise.all([
      import("@/data/characters.json"),
      import("@/data/citats.json"),
      import("@/data/stories.json"),
    ]);
    const canon = canonBlock(charactersJson as Char[], citatsJson as Citat[], storiesJson as Story[]);
    const mood = detectMood(data.messages);

    const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
      { role: "system", content: systemFor(data.mode, canon, mood) },
    ];
    for (const m of data.messages) {
      messages.push({
        role: m.role === "user" ? "user" : "assistant",
        content: m.text,
      });
    }

    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "grok-4.5",
        messages,
        temperature: data.mode === "sms" ? 1 : 0.88,
        max_tokens: data.mode === "sms" ? 110 : 120,
      }),
      signal: AbortSignal.timeout(14000),
    });
    if (!res.ok) return { ok: false as const, error: `xAI ${res.status}` };
    const body = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const text = trimYurec(body.choices?.[0]?.message?.content || "", data.mode);
    if (!text) return { ok: false as const, error: "empty" };
    return { ok: true as const, text };
  });
