#!/usr/bin/env python3
"""Собрать колоду «Юрца игра»: 25 тем × 5 ячеек × 80 = 10 000.

Ячейка 1 — паспорт двора. 2 — клички и места. 3 — серии и события.
4 — био, кроссворды, точные фразы. 5 — ложь vs канон.
Имена не дублируются в тексте вопроса и на кнопках.
"""
from __future__ import annotations

import json
import random
import re
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path("/workspace")
OUT = ROOT / "public" / "game" / "svoya-q.json"

CATS = [
    ("shotman", "ШОТМАН"),
    ("treshka", "ТРЁШКА"),
    ("olimpik", "ОЛИМПИК"),
    ("maxidom", "МАКСИДОМ"),
    ("sveta", "СВЕТКА"),
    ("batya", "БАТЯ"),
    ("zina", "ЗИНАИДА"),
    ("gosha", "ГОША"),
    ("kostya", "КОСТЯ"),
    ("tolik", "ТОЛИК"),
    ("fly", "FLY"),
    ("sensor", "СЕНСОР"),
    ("gazeta", "ГАЗЕТА"),
    ("shaverma", "ШАВЕРМА"),
    ("vodka", "ВОДКА"),
    ("srok", "ПРОСРОЧКА"),
    ("kupola", "КУПОЛА"),
    ("nlo", "НЛО"),
    ("arsenal", "АРСЕНАЛ"),
    ("apteka", "АПТЕКА"),
    ("bonch", "БОНЧ"),
    ("gosuslugi", "ГОСУСЛУГИ"),
    ("pomoyka", "ПОМОЙКА"),
    ("lysy", "ЛЫСЫЙ"),
    ("canon", "КАНОН"),
]
CAT_IDS = [c[0] for c in CATS]
RNG = random.Random(215)

EMOJI = re.compile(
    r"[\U0001F300-\U0001FAFF\U00002700-\U000027BF\U00002600-\U000026FF\U0000FE00-\U0000FE0F\U0000200D]"
)

BAN_PREFIX = (
    "не клюй на бред",
    "лох путает бред",
    "юрец врёт. правда",
    "какой ответ — враки",
    "светка закатила бы",
    "батя сказал бы «дебил»",
    "гоша каркнул бы иначе",
    "дорогая ячейка.",
    "если читал сагу.",
    "канон двора.",
    "подвох.",
    "надо помнить серию.",
    "без фольги.",
)
BAN_SUB = (
    "кто из списка",
    "не чужой",
    "кто здесь «",
    "в этом списке как герой",
    "набор ",
)


def clean(s: str) -> str:
    s = EMOJI.sub("", s or "")
    s = re.sub(r"[\u2190-\u21FF\u2300-\u23FF\u2460-\u24FF\u25A0-\u25FF\u2600-\u27BF\u2B00-\u2BFF\uFE0F\u200D]", "", s)
    s = s.replace("\u200b", " ").replace("\xa0", " ").replace("\ufeff", "")
    return " ".join(s.split()).strip(" -–—|")


def is_junk(q: str) -> bool:
    low = q.casefold()
    if any(low.startswith(p) for p in BAN_PREFIX):
        return True
    if any(s in low for s in BAN_SUB):
        return True
    # четыре имени и в тексте, и на кнопках
    if q.count(",") >= 3 and (" — " in q or ":" in q) and ("кто" in low or "вайб" in low or "где " in low):
        return True
    return False


def clip(s: str, n: int = 92) -> str:
    s = clean(s)
    if len(s) <= n:
        return s
    cut = s[: n - 1]
    if " " in cut:
        cut = cut.rsplit(" ", 1)[0]
    return cut.rstrip(".,;:") + "…"


def load(name: str):
    return json.loads((ROOT / "src" / "data" / name).read_text(encoding="utf-8"))


def shuffle_row(ok: str, bads: list[str]) -> tuple[list[str], int]:
    opts = [ok] + [b for b in bads if b and b != ok]
    seen: set[str] = set()
    uniq: list[str] = []
    for o in opts:
        k = o.casefold()
        if k in seen:
            continue
        seen.add(k)
        uniq.append(o)
    for p in ("это не канон", "бред из головы Юрца", "реклама «Радуги»", "сон после «Путинки»"):
        if len(uniq) >= 4:
            break
        if p.casefold() not in seen:
            uniq.append(p)
            seen.add(p.casefold())
    uniq = uniq[:4]
    if len(uniq) < 4:
        return [], 0
    order = [0, 1, 2, 3]
    RNG.shuffle(order)
    out = [uniq[i] for i in order]
    return out, out.index(uniq[0])


class Pack:
    def __init__(self) -> None:
        self.rows: dict[tuple[str, int], list[tuple[str, list[str], int]]] = defaultdict(list)
        self.seen_q: set[tuple[str, str]] = set()

    def add(self, cat: str, tier: int, q: str, ok: str, bads: list[str]) -> bool:
        q = clean(q)
        ok = clip(ok, 88)
        if not q or not ok or cat not in CAT_IDS or tier not in (1, 2, 3, 4, 5):
            return False
        if len(q) < 12 or is_junk(q):
            return False
        bads = [clip(b, 88) for b in bads if b]
        a, idx = shuffle_row(ok, bads)
        if not a:
            return False
        key = (q.casefold(), a[idx].casefold())
        if key in self.seen_q:
            return False
        self.seen_q.add(key)
        self.rows[(cat, tier)].append((q, a, idx))
        return True

    def count(self, cat: str, tier: int) -> int:
        return len(self.rows[(cat, tier)])


def tag_cat(tag: str) -> str | None:
    t = (tag or "").casefold()
    table = {
        "шотмана": "shotman", "шотман": "shotman", "светлана": "sveta", "светка": "sveta",
        "максидом": "maxidom", "олимпик": "olimpik", "гоша": "gosha", "fly": "fly",
        "костя": "kostya", "кастян": "kostya", "батя": "batya", "зинаида": "zina",
        "зина": "zina", "толик": "tolik", "ларёк": "tolik", "лысый": "lysy",
        "нло": "nlo", "водка": "vodka", "шаверма": "shaverma", "аптека": "apteka",
        "госуслуг": "gosuslugi", "помойк": "pomoyka", "газета": "gazeta",
        "пятёроч": "srok", "пятероч": "srok", "бонч": "bonch", "неско": "bonch",
        "гранат": "arsenal", "дробов": "arsenal", "купол": "kupola", "фольг": "kupola",
        "сенсор": "sensor", "xaiomi": "sensor", "трёшк": "treshka",
    }
    for k, v in table.items():
        if k in t:
            return v
    return None


def char_cats(cid: str) -> list[str]:
    table: dict[str, list[str]] = {
        "yurec": ["shotman", "treshka", "canon"],
        "svetlana": ["sveta", "maxidom"],
        "kostya": ["kostya"],
        "zhenya": ["canon"],
        "zinaida": ["zina"],
        "nlo": ["nlo", "kupola"],
        "povar": ["shaverma"],
        "lyudmila": ["apteka"],
        "batya": ["batya", "arsenal"],
        "gosha": ["gosha", "pomoyka"],
        "pero": ["gosha"],
        "lysy": ["lysy", "olimpik"],
        "olimpik": ["olimpik"],
        "zhiletka": ["olimpik"],
        "computer": ["gosuslugi", "treshka"],
        "larek": ["tolik", "vodka"],
        "tolik": ["tolik", "vodka"],
        "angela": ["tolik"],
        "svetdom": ["sveta"],
        "kurtka": ["sveta"],
        "portret": ["sveta", "treshka"],
        "kvartira": ["treshka", "shotman"],
        "lift": ["shotman"],
        "sosed": ["shotman"],
        "fly": ["fly"],
        "phone": ["fly", "treshka"],
        "xiaomi": ["sensor"],
        "raduga": ["kupola", "treshka"],
        "gazeta": ["gazeta"],
        "vodka": ["vodka"],
        "granata": ["arsenal"],
        "drobovik": ["arsenal", "batya"],
        "pomoyka": ["pomoyka"],
        "bamsi": ["shotman"],
        "leva": ["shotman"],
        "nitka": ["shotman"],
    }
    return table.get(cid, ["canon"])


def story_cats(s: dict) -> list[str]:
    cats: list[str] = []
    for t in s.get("tags") or []:
        c = tag_cat(str(t))
        if c:
            cats.append(c)
    blob = " ".join([s.get("title") or "", s.get("excerpt") or "", " ".join(s.get("tags") or [])]).casefold()
    keys = {
        "maxidom": ["максидом", "дрел"],
        "sveta": ["светк", "светлан"],
        "olimpik": ["олимпик", "линолеум", "лысый"],
        "batya": ["батя", "фсб", "подписк"],
        "zina": ["зинаид", "ящер", "половник"],
        "gosha": ["гоша", "ревэл", "ворон"],
        "kostya": ["костя", "кастян", "икр"],
        "tolik": ["толик", "ларёк", "ларек"],
        "fly": ["fly", "кнопочн", "sms"],
        "sensor": ["сенсор", "xaiomi", "сяоми", "косар"],
        "gazeta": ["газет", "вечерний шотман"],
        "shaverma": ["шаверм", "лаваш", "гриль"],
        "vodka": ["водк", "путинк", "финлянд"],
        "srok": ["пятёроч", "пятероч", "просроч", "тушён"],
        "kupola": ["купол", "фольг", "заговор"],
        "nlo": ["нло", "тарелк", "луна"],
        "arsenal": ["гранат", "дробов"],
        "apteka": ["аптек", "людмил", "мишка косолап"],
        "bonch": ["бонч", "неско", "ключн"],
        "gosuslugi": ["госуслуг", "интернет", "hh"],
        "pomoyka": ["помойк", "бак"],
        "lysy": ["лысый"],
        "shotman": ["шотман", "хрущёв", "панел"],
        "treshka": ["трёшк", "сервант", "радуга"],
    }
    for cat, words in keys.items():
        if any(w in blob for w in words):
            cats.append(cat)
    cats.append("canon")
    return list(dict.fromkeys(cats))


def hand_seed(p: Pack) -> None:
    seed = [
        ("shotman", 1, "На какой улице живёт Юрец?", "на Шотмана", ["на Невском", "на Дыбенко", "в Купчино"]),
        ("shotman", 1, "В каком городе сага?", "Санкт-Петербург", ["Москва", "Казань", "Самара"]),
        ("shotman", 1, "Какой район у двора Юрца?", "Невский", ["Центральный", "Василеостровский", "Курортный"]),
        ("shotman", 1, "Что за дом у Юрца?", "серая девятиэтажка / хрущёвка", ["элитная новостройка", "особняк на Крестовском", "вагончик у дачи"]),
        ("shotman", 2, "Куда Юрец ссыт по канону?", "в мусоропровод", ["в Неву", "соседу в ящик", "в кассу Максидома"]),
        ("shotman", 2, "Как Юрец зовёт районные дома?", "панельные джунгли / холопы", ["небоскрёбы Газпрома", "кремлёвские стены", "дача Кости"]),
        ("treshka", 1, "Сколько комнат в хате Юрца?", "трёшка", ["студия", "коммуналка на восемь", "барак"]),
        ("treshka", 1, "Чем воняет трёшка по канону?", "тушёнка и «Путинка»", ["лаванда", "новый ремонт", "океан"]),
        ("olimpik", 1, "Откуда выперли Юрца?", "из «Олимпика»", ["из Максидома", "из Эрмитажа", "из ФСБ"]),
        ("olimpik", 2, "Кто выпер Юрца из «Олимпика»?", "Лысый хер", ["Светка", "Батя", "Толик"]),
        ("maxidom", 1, "Где работает Светлана?", "в «Максидоме», продаёт дрели", ["на рынке овощами", "в «Олимпике» на кассе", "в аптеке"]),
        ("sveta", 1, "Как Юрец зовёт Светлану?", "Светка", ["Людмила Ивановна", "Анжела", "Зинаида"]),
        ("sveta", 2, "Какая фирменная фраза у Светки?", "Юр, ну ты даёшь", ["Сынок, ты дебил", "РЕВЭЛ", "Не вздумай"]),
        ("batya", 1, "Кем Юрец величает батю?", "капитан ФСБ", ["директор Максидома", "повар шавермы", "участковый"]),
        ("batya", 2, "Какая фраза у Бати?", "Сынок, ты дебил", ["Юр, ну ты даёшь", "Бери лаваш и вали", "РЕВЭЛ"]),
        ("zina", 1, "Кто такая Зинаида Петровна?", "соседка с половником", ["фармацевтка", "менеджер Максидома", "жена Кости"]),
        ("gosha", 1, "Кто такой Гоша?", "облезлый ворон без хвоста", ["друг с икрой", "охранник склада", "директор Олимпика"]),
        ("gosha", 1, "Что каркает Гоша?", "РЕВЭЛ", ["кар-кар", "сынок ты дебил", "ну ты даёшь"]),
        ("kostya", 1, "Кто такой Костя в саге?", "богатый друг, ест икру", ["сосед с завода", "повар шавермы", "батя из ФСБ"]),
        ("kostya", 2, "Что Костя отвечает на дичь Юрца?", "не вздумай", ["РЕВЭЛ", "вали", "приятного дня"]),
        ("tolik", 1, "Кто такой Толик?", "казначей ларька, спонсор запоя", ["лысый из Олимпика", "ворон", "друг с икрой"]),
        ("fly", 1, "Какой телефон у Юрца главный?", "кнопочный Fly", ["iPhone", "Xaiomi MegaUltra 5G", "радиола"]),
        ("sensor", 1, "Как Юрец зовёт сенсорный смартфон?", "Xaiomi / лопатофон", ["Fly", "Nokia 3310", "Радуга"]),
        ("gazeta", 1, "Как называется дворная газета?", "«Вечерний Шотман»", ["«Коммерсантъ»", "«Метро»", "«Спорт-Экспресс»"]),
        ("shaverma", 1, "Что орёт Юрец у гриля?", "шаверму в лаваше", ["суши", "устрицы", "фуа-гра"]),
        ("vodka", 1, "Какая водка канон двора?", "«Путинка» / «Финляндия»", ["Grey Goose", "Absolut", "Beluga"]),
        ("srok", 1, "Чем Юрец питается чаще всего?", "просрочка и тушёнка", ["икра и устрицы", "диета Кости", "меню «Пушкина»"]),
        ("kupola", 1, "Из чего купола Юрца?", "фольга", ["золото", "бетон", "картон Максидома"]),
        ("nlo", 1, "Что ворует НЛО у Юрца?", "водку", ["дрель Светки", "икру Кости", "жилетку"]),
        ("arsenal", 1, "Что лежит у Юрца под подушкой?", "граната времён ВОВ", ["паспорт", "ключи от Максидома", "ноутбук"]),
        ("apteka", 1, "Как зовут фармацевтку?", "Людмила Ивановна", ["Светлана", "Зинаида", "Анжела"]),
        ("bonch", 1, "Куда Юрец устроился ключником?", "в Бонч-Бруевича", ["в Эрмитаж", "в Кремль", "в Максидом"]),
        ("gosuslugi", 1, "Что Юрец думает про Госуслуги?", "код ящеров", ["удобный портал", "сайт Кости", "казино"]),
        ("pomoyka", 1, "Где казна двора?", "три бака / помойка", ["сейф Кости", "касса Максидома", "ФСБ"]),
        ("lysy", 1, "Кто выпер Юрца с работы?", "Лысый хер", ["Светка", "Батя", "Гоша"]),
        ("canon", 1, "Как называется сага?", "Жизнь Юрца", ["Игра престолов", "Улицы разбитых фонарей", "Реальные пацаны"]),
        ("canon", 2, "Как называется пилот саги?", "Пилот", ["Граната в лаваше", "Мираж Светланы", "Аптечная любовь"]),
        ("canon", 3, "Как называется серия S01E01?", "Граната в лаваше", ["Пилот", "Лысый хер из Олимпика", "Царь без Интернета"]),
        ("canon", 3, "Как называется серия S01E02?", "Лысый хер из Олимпика", ["Пилот", "Граната в лаваше", "Мираж Светланы"]),
        ("canon", 3, "Как называется серия S01E04?", "Мираж Светланы", ["Аптечная любовь", "Пилот", "Пособие по безработице"]),
        ("canon", 3, "Как называется серия S01E11?", "Аптечная любовь", ["Мираж Светланы", "Пилот", "Царь без Интернета"]),
        ("sveta", 5, "Юрец врёт, что Светка торгует овощами. По канону она продаёт…", "дрели в «Максидоме»", ["капусту на рынке", "водку в ларьке", "рецепты в аптеке"]),
        ("nlo", 5, "Что из этого ЛОЖЬ про НЛО?", "тарелка официально трудоустроила Юрца в Максидом", ["водка — цель миссии", "Юрец — любимый экспонат", "летают на Луну"]),
        ("fly", 5, "Что из этого ЛОЖЬ про Fly?", "на Fly Юрец сидит в TikTok сутками", ["кнопочный шаттл", "SMS Косте на 160 символов", "сенсор Юрцу не даётся"]),
        ("batya", 5, "Что из этого ЛОЖЬ про Батю?", "он директор «Максидома» и продаёт дрели", ["капитан ФСБ по легенде Юрца", "говорит «сынок, ты дебил»", "вытаскивал из мусарни в пилоте"]),
        ("gosha", 5, "Что из этого ЛОЖЬ про Гошу?", "Гоша — кот Светки с родословной", ["ворон без хвоста", "каркает РЕВЭЛ", "живёт на шкафу"]),
    ]
    for row in seed:
        p.add(*row)


def from_characters(p: Pack, chars: list[dict]) -> None:
    names = [c["name"] for c in chars]
    roles = [c.get("role") or "" for c in chars if c.get("role")]
    vibes = [c.get("vibe") or "" for c in chars if c.get("vibe")]
    for c in chars:
        cats = char_cats(c["id"])
        name = c["name"]
        role = clean(c.get("role") or "")
        vibe = clean(c.get("vibe") or "")
        aka = clean((c.get("aka") or "").split(",")[0])
        quote = clean(c.get("quote") or "")
        others = [n for n in names if n != name]
        RNG.shuffle(others)
        oroles = [r for r in roles if r != role][:8]
        ovibes = [v for v in vibes if v != vibe][:8]
        bio = clean(c.get("bio") or "")
        bits = [s.strip() for s in re.split(r"(?<=[.!?])\s+", bio) if len(s.strip()) > 24][:5]
        for cat in cats:
            if role:
                p.add(cat, 1, f"Кто из них «{clip(role, 48)}»?", name, others[:3])
                p.add(cat, 1, f"Как зовут героя с ролью «{clip(role, 48)}»?", name, others[:3])
                p.add(cat, 2, f"{name} в картотеке двора — это кто?", role, oroles[:3] or others[:3])
            if vibe:
                p.add(cat, 2, f"У кого вайб «{clip(vibe, 40)}»?", name, others[:3])
                p.add(cat, 2, f"Какой вайб у {name} в паспорте двора?", vibe, ovibes[:3] or others[:3])
            if aka:
                p.add(cat, 2, f"Как ещё зовут: {name}?", aka, others[:3])
                p.add(cat, 2, f"Кто прячется под кличкой «{clip(aka, 40)}»?", name, others[:3])
            if quote:
                p.add(cat, 3, f"Кто сказал: «{clip(quote, 64)}»?", name, others[:3])
            for qot in [clean(x) for x in (c.get("quotes") or []) if clean(x)][:8]:
                p.add(cat, 3, f"Чья это фраза: «{clip(qot, 70)}»?", name, others[:3])
            for bit in bits:
                p.add(cat, 4, f"О ком в паспорте двора: «{clip(bit, 110)}»?", name, others[:3])
            for ref in c.get("refs") or []:
                lab = clean(ref.get("label") or "")
                if lab:
                    p.add(cat, 3, f"Какая серия в картотеке у {name}: {clip(lab, 48)} — про кого карточка?", name, others[:3])


def from_stories(p: Pack, stories: list[dict]) -> None:
    eps = [s for s in stories if s.get("kind") == "episode"]
    songs = [s for s in stories if s.get("kind") == "song"]
    codes, titles = [], []
    for s in eps:
        code, title = clean(s.get("code") or ""), clean(s.get("title") or "")
        if code and title:
            codes.append(code)
            titles.append(title)
    for s in eps:
        code, title = clean(s.get("code") or ""), clean(s.get("title") or "")
        if not code or not title:
            continue
        cats = story_cats(s)[:5]
        bad_t = [x for x in titles if x != title]
        bad_c = [x for x in codes if x != code]
        RNG.shuffle(bad_t)
        RNG.shuffle(bad_c)
        excerpt = clean(s.get("excerpt") or "")
        prev_t, nxt_t = (bad_t[0] if bad_t else "Пилот"), (bad_t[1] if len(bad_t) > 1 else "Мираж Светланы")
        prev_c, nxt_c = (bad_c[0] if bad_c else "S01E00"), (bad_c[1] if len(bad_c) > 1 else "S01E04")
        for cat in cats:
            p.add(cat, 3, f"Как называется серия {code}?", title, bad_t[:3])
            p.add(cat, 3, f"Серия «{clip(title, 52)}» — это какой номер?", code, bad_c[:3])
            p.add(cat, 4, f"Какой код у серии «{clip(title, 48)}»?", code, bad_c[:3])
            if excerpt:
                p.add(cat, 4, f"Какая серия начинается так: «{clip(excerpt, 100)}»?", title, bad_t[:3])
            p.add(cat, 5, f"Какая пара код — название верная?", f"{code} — {title}", [f"{code} — {prev_t}", f"{prev_c} — {title}", f"{nxt_c} — {nxt_t}"])
    song_titles = [clean(s.get("title") or "") for s in songs if clean(s.get("title") or "")]
    for s in songs:
        title = clean(s.get("title") or "")
        if not title:
            continue
        others = [x for x in song_titles if x != title]
        RNG.shuffle(others)
        cats = [c for c in (tag_cat(str(t)) for t in (s.get("tags") or [])) if c] or ["canon"]
        for cat in list(dict.fromkeys(cats + ["canon"]))[:3]:
            p.add(cat, 3, f"Как называется песня двора «{clip(title, 44)}»?", title, others[:3])
            p.add(cat, 4, f"Какая песня Юрца называется точно «{clip(title, 40)}»?", title, others[:3])
    for s in stories:
        if s.get("kind") not in ("visit", "sms"):
            continue
        title = clean(s.get("title") or "")
        if title:
            p.add("canon", 3, f"Что это в сборнике: «{clip(title, 52)}»?", "спецвыпуск / визит / SMS", ["обычная серия S01E00", "кроссворд киоска", "уровень квеста"])


def from_citats(p: Pack, citats: list[dict], chars: list[dict]) -> None:
    names = [c["name"] for c in chars]
    by_slug: dict[str, str] = {}
    stories = load("stories.json")
    for s in stories:
        by_slug[s.get("slug") or ""] = clean(s.get("title") or "")
    for it in citats:
        text = clean(it.get("text") or "")
        sp = clean(it.get("speaker") or "")
        slug = it.get("slug") or ""
        title = by_slug.get(slug) or ""
        if not text or not sp:
            continue
        others = [n for n in names if n != sp][:8]
        RNG.shuffle(others)
        cats = char_cats(it.get("speakerId") or "") or ["canon"]
        for cat in cats[:3] + ["canon"]:
            p.add(cat, 3, f"Кто в цитатнике орёт: «{clip(text, 70)}»?", sp, others[:3])
            if title:
                p.add(cat, 4, f"В какой серии звучит: «{clip(text, 64)}»?", title, [t for t in list(by_slug.values()) if t != title][:3])
            p.add(cat, 5, f"Юрец врёт, что фразу «{clip(text, 56)}» сказали не {sp}. Кто сказал по канону?", sp, others[:3])


def from_crossword(p: Pack, cws: list[dict]) -> None:
    secrets = [clean(cw.get("secret") or "") for cw in cws if clean(cw.get("secret") or "")]
    for cw in cws:
        num = clean(cw.get("shortTitle") or cw.get("title") or "")
        secret = clean(cw.get("secret") or "")
        words = cw.get("words") or []
        answers = [clean(w.get("answer") or "") for w in words if clean(w.get("answer") or "")]
        others_s = [s for s in secrets if s != secret]
        RNG.shuffle(others_s)
        if secret and num:
            p.add("canon", 4, f"Какое золотое слово у {num}?", secret, others_s[:3])
            p.add("canon", 5, f"Золотое слово {num} — какое? Не путай сетки.", secret, others_s[:3])
        for w in words:
            ans = clean(w.get("answer") or "")
            clue = clean(w.get("clue") or "")
            if not ans or not clue:
                continue
            bads = [a for a in answers if a != ans]
            RNG.shuffle(bads)
            p.add("canon", 4, f"{num}. «{clip(clue, 80)}» — какое слово?", ans, bads[:3])
            p.add("canon", 5, f"{num}, дорогая ячейка. «{clip(clue, 72)}» — какое слово в сетке?", ans, bads[:3])
            blob = (clue + " " + ans).casefold()
            for cat, keys in {
                "shotman": ["шотман", "улиц", "парадн"],
                "gosha": ["гоша", "ворон", "ревэл"],
                "sveta": ["светк", "светлан"],
                "olimpik": ["олимпик", "лысый"],
                "maxidom": ["максидом", "дрел"],
                "vodka": ["водк", "путинк"],
                "pomoyka": ["помойк", "бак"],
                "zina": ["зина", "половник"],
                "tolik": ["толик", "ларёк"],
                "batya": ["батя", "фсб"],
                "fly": ["fly", "телефон"],
                "nlo": ["нло", "тарел"],
                "arsenal": ["гранат", "дробов"],
            }.items():
                if any(k in blob for k in keys):
                    p.add(cat, 4, f"{num}. «{clip(clue, 72)}» — какое слово?", ans, bads[:3])
                    p.add(cat, 5, f"{num}, дорогая ячейка. «{clip(clue, 64)}» — какое слово в сетке?", ans, bads[:3])


def from_yard(p: Pack, yard: dict) -> None:
    pins = []
    for layer in yard.get("layers") or []:
        lid = layer.get("id") or ""
        lcat = {"peter": "shotman", "yard": "shotman", "flat": "treshka"}.get(lid, "shotman")
        for pin in layer.get("pins") or []:
            pins.append((lcat, pin))
    labels = [clean(pin.get("label") or "") for _, pin in pins]
    extra_map = {
        "nlo": "nlo", "gosha": "gosha", "gosha-sky": "gosha", "maxidom": "maxidom",
        "olimpik": "olimpik", "zinaida": "zina", "larek": "tolik", "pomoyka": "pomoyka",
        "bak": "pomoyka", "fly": "fly", "granata": "arsenal", "drobovik": "arsenal",
        "vodka": "vodka", "portret": "sveta", "kurtka": "sveta", "apteka": "apteka",
        "gazeta": "gazeta", "raduga": "kupola", "zhiletka": "olimpik", "pero": "gosha",
        "pyaterochka": "srok", "khrushchevka": "treshka", "shotman": "shotman", "iskrovsky": "sveta",
    }
    for lcat, pin in pins:
        lab = clean(pin.get("label") or "")
        blurb = clean(pin.get("blurb") or "")
        extra = extra_map.get(pin.get("id") or "", lcat)
        others = [x for x in labels if x and x != lab]
        RNG.shuffle(others)
        if blurb and lab:
            p.add(extra, 2, f"Что на карте двора подписано «{lab}»?", clip(blurb, 80), others[:3])
            p.add(extra, 3, f"Какой пин карты: «{clip(blurb, 100)}»?", lab, others[:3])
            p.add(extra, 4, f"На карте двора. О чём облачко: «{clip(blurb, 90)}»?", lab, others[:3])


def from_achievements(p: Pack, ach: dict) -> None:
    items = ach.get("items") or []
    titles = [clean(it.get("title") or "") for it in items]
    for it in items:
        title = clean(it.get("title") or "")
        hint = clean(it.get("hint") or it.get("blurb") or "")
        if not title:
            continue
        others = [t for t in titles if t != title]
        RNG.shuffle(others)
        p.add("canon", 4, f"Как называется зашквар двора: «{clip(hint, 80)}»?", title, others[:3])
        if hint:
            p.add("canon", 5, f"Зашквар «{title}». Что надо сделать по канону двора?", clip(hint, 70), others[:3])


def combo_identity(p: Pack, chars: list[dict]) -> None:
    names = [c["name"] for c in chars]
    for c in chars:
        name, role, vibe = c["name"], c.get("role") or "", c.get("vibe") or ""
        others = [n for n in names if n != name]
        for cat in char_cats(c["id"]):
            if role:
                bad = RNG.sample(others, 3)
                p.add(cat, 1, f"Кто из них «{clip(role, 42)}»?", name, bad)
                p.add(cat, 1, f"Карточка с ролью «{clip(role, 42)}» — кто это?", name, RNG.sample(others, 3))
            if vibe:
                p.add(cat, 2, f"У кого вайб «{clip(vibe, 36)}»?", name, RNG.sample(others, 3))


def combo_lies(p: Pack, chars: list[dict]) -> None:
    pool = []
    for c in chars:
        name = c["name"]
        truths = []
        if c.get("role"):
            truths.append(f"{name} — {c['role']}")
        if c.get("vibe"):
            truths.append(f"вайб: {c['vibe']}")
        if c.get("aka"):
            truths.append(f"ещё зовут {c['aka'].split(',')[0].strip()}")
        bio = clean(c.get("bio") or "")
        truths.extend([s.strip() for s in re.split(r"(?<=[.!?])\s+", bio) if len(s.strip()) > 18][:4])
        quotes = [clean(x) for x in ([c.get("quote") or ""] + list(c.get("quotes") or [])) if clean(x)]
        if quotes:
            truths.append(f"говорил: «{clip(quotes[0], 50)}»")
        pool.append((name, char_cats(c["id"]), truths))
    for name, cats, truths in pool:
        if len(truths) < 3:
            continue
        others = [x for x in pool if x[0] != name]
        for j, (oname, _ocats, otr) in enumerate(others):
            if not otr:
                continue
            lie = otr[j % len(otr)]
            if name in lie:
                lie = f"{name} на самом деле {lie}"
            trip = [truths[k % len(truths)] for k in (j, j + 1, j + 2)]
            for cat in cats:
                p.add(cat, 5, f"Что из этого ЛОЖЬ про {name}?", clip(lie, 80), [clip(t, 80) for t in trip])
                p.add(cat, 4, f"Какой факт про {name} из паспорта двора?", clip(trip[0], 80), [clip(lie, 80), clip(trip[1], 80), clip(trip[2], 80)])


def fill_episode_matrix(p: Pack, stories: list[dict]) -> None:
    eps = []
    for s in stories:
        if s.get("kind") != "episode":
            continue
        code, title = clean(s.get("code") or ""), clean(s.get("title") or "")
        if code and title:
            eps.append((code, title, story_cats(s), clean(s.get("excerpt") or "")))
    n = len(eps)
    for i, (code, title, cats, excerpt) in enumerate(eps):
        prev, nxt, far = eps[(i - 1) % n], eps[(i + 1) % n], eps[(i + 7) % n]
        for cat in list(dict.fromkeys(cats + ["canon"]))[:3]:
            p.add(cat, 3, f"{code} в сборнике — это какая история?", title, [prev[1], nxt[1], far[1]])
            p.add(cat, 4, f"Не путай номера. «{clip(title, 44)}» идёт под каким кодом?", code, [prev[0], nxt[0], far[0]])
            p.add(cat, 5, f"Какая пара код–название СЛОМАНА?", f"{code} — {prev[1]}", [f"{code} — {title}", f"{prev[0]} — {prev[1]}", f"{nxt[0]} — {nxt[1]}"])
            if excerpt:
                p.add(cat, 4, f"Узнай серию по абзацу: «{clip(excerpt, 96)}»", title, [prev[1], nxt[1], far[1]])


def fill_remaining(p: Pack) -> None:
    chars = load("characters.json")
    names = [c["name"] for c in chars]
    stories = load("stories.json")
    eps = []
    for s in stories:
        if s.get("kind") != "episode":
            continue
        code, title = clean(s.get("code") or ""), clean(s.get("title") or "")
        if code and title:
            eps.append((code, title, story_cats(s)))
    for cat, title in CATS:
        related = [c for c in chars if cat in char_cats(c["id"])]
        if not related:
            related = chars[:8]
        for c in related:
            others = [n for n in names if n != c["name"]]
            role, name = c.get("role") or "герой двора", c["name"]
            p.add(cat, 1, f"Кто из них «{clip(role, 40)}»?", name, RNG.sample(others, 3))
            p.add(cat, 2, f"{name} в теме «{title}» — какая роль?", role, [x.get("role") or x["name"] for x in RNG.sample([z for z in chars if z["name"] != name], 3)])
        cat_eps = [e for e in eps if cat in e[2]] or eps
        for code, etitle, _c in cat_eps:
            others = [e for e in cat_eps if e[1] != etitle] or [e for e in eps if e[1] != etitle]
            if len(others) < 3:
                continue
            bad = [e[1] for e in RNG.sample(others, 3)]
            p.add(cat, 3, f"Серия {code} в этой теме — какое название?", etitle, bad)
            p.add(cat, 3, f"Под каким кодом серия «{clip(etitle, 40)}»?", code, [e[0] for e in RNG.sample(others, 3)])
        for c in related:
            truths = [f"{c['name']} — {c.get('role')}", f"вайб {c.get('vibe') or 'двор'}"]
            bio = clean(c.get("bio") or "")
            truths += [s.strip() for s in re.split(r"(?<=[.!?])\s+", bio) if len(s.strip()) > 16][:3]
            for other in RNG.sample(chars, min(12, len(chars))):
                if other["name"] == c["name"]:
                    continue
                lie = f"{c['name']} — {other.get('role')}"
                trip = (truths + [f"ещё зовут {(c.get('aka') or c['name']).split(',')[0]}"])[:3]
                p.add(cat, 5, f"Что из этого ЛОЖЬ про {c['name']}?", lie, [clip(t, 80) for t in trip])
                p.add(cat, 4, f"Какая строка про {c['name']} из паспорта?", clip(trip[0], 80), [lie] + [clip(t, 80) for t in trip[1:3]])


def trim_and_id(p: Pack) -> tuple[list, list[str]]:
    out: list = []
    report: list[str] = []
    chars = load("characters.json")
    names = [c["name"] for c in chars]
    for cat, title in CATS:
        for t in range(1, 6):
            good = []
            seen: set[tuple] = set()
            for q, a, ok in p.rows[(cat, t)]:
                if is_junk(q):
                    continue
                key = (q.casefold(), a[ok].casefold(), tuple(x.casefold() for x in a))
                if key in seen:
                    continue
                seen.add(key)
                good.append((q, a, ok))
            if len(good) < 80:
                report.append(f"SHORT {cat}:{t} = {len(good)}")

            def score_row(row: tuple) -> float:
                q = row[0]
                low = q.casefold()
                score = float(len(q))
                if t >= 4:
                    if "ложь" in low:
                        score += 80
                    if "кроссворд" in low or "золотое" in low or "сказал" in low:
                        score += 30
                if t == 3 and ("серия" in low or "код" in low or "назван" in low):
                    score += 40
                if t <= 2 and 16 <= len(q) < 90:
                    score += 40
                if "ложь" in low and t <= 2:
                    score -= 80
                return -score

            good.sort(key=score_row)
            picked: list = []
            stem_n: dict[str, int] = defaultdict(int)
            cap = 18 if t >= 3 else 24
            for row in good:
                stem = " ".join(row[0].split()[:4]).casefold()
                if stem_n[stem] >= cap:
                    continue
                picked.append(row)
                stem_n[stem] += 1
                if len(picked) >= 80:
                    break
            if len(picked) < 80:
                have = {(x[0].casefold(), x[1][x[2]].casefold()) for x in picked}
                for row in good:
                    if len(picked) >= 80:
                        break
                    k = (row[0].casefold(), row[1][row[2]].casefold())
                    if k in have:
                        continue
                    picked.append(row)
                    have.add(k)
            if len(picked) < 80:
                extra = []
                donors = [1, 2] if t <= 2 else ([3, 4] if t == 3 else [4, 5, 3])
                for ot in donors:
                    if ot != t:
                        extra.extend(p.rows[(cat, ot)])
                RNG.shuffle(extra)
                have = {(x[0].casefold(), x[1][x[2]].casefold()) for x in picked}
                for q, a, ok in extra:
                    if len(picked) >= 80:
                        break
                    if is_junk(q):
                        continue
                    k = (q.casefold(), a[ok].casefold())
                    if k in have:
                        continue
                    picked.append((q, a, ok))
                    have.add(k)
            if len(picked) < 80:
                report.append(f"STILL {cat}:{t} = {len(picked)}")
                related = [c for c in chars if cat in char_cats(c["id"])] or chars[:8]
                have = {(x[0].casefold(), x[1][x[2]].casefold()) for x in picked}
                guard = 0
                while len(picked) < 80 and guard < 400:
                    guard += 1
                    hero = related[guard % len(related)]
                    others = [n for n in names if n != hero["name"]]
                    bad = RNG.sample(others, 3)
                    role = hero.get("role") or "герой двора"
                    if t <= 2:
                        q = f"Тема «{title}»: кто «{clip(role, 40)}»?"
                    elif t == 3:
                        q = f"Тема «{title}»: {hero['name']} — это кто?"
                        bad = [c.get("role") or c["name"] for c in RNG.sample([z for z in chars if z["name"] != hero["name"]], 3)]
                    else:
                        q = f"Что из этого ЛОЖЬ про {hero['name']}?"
                        bad = [f"{hero['name']} — {role}", f"вайб {hero.get('vibe') or 'двор'}", f"ещё зовут {(hero.get('aka') or hero['name']).split(',')[0]}"]
                    ok = hero["name"] if t <= 3 else f"{hero['name']} — {RNG.choice([z for z in chars if z['name'] != hero['name']]).get('role')}"
                    if t == 3:
                        ok = role
                    a, idx = shuffle_row(ok, bad)
                    if not a or is_junk(q):
                        continue
                    k = (q.casefold(), a[idx].casefold())
                    if k in have:
                        continue
                    have.add(k)
                    picked.append((q, a, idx))
            for i, (q, a, ok) in enumerate(picked[:80]):
                out.append([f"{cat}:{t}:{i:02d}", cat, t, q, a, ok])
    return out, report


def main() -> None:
    chars = load("characters.json")
    stories = load("stories.json")
    citats = load("citats.json")
    cws = load("crossword.json")
    yard = load("yard-map.json")
    ach = load("achievements.json")
    p = Pack()
    hand_seed(p)
    from_characters(p, chars)
    from_stories(p, stories)
    from_citats(p, citats, chars)
    from_crossword(p, cws)
    from_yard(p, yard)
    from_achievements(p, ach)
    combo_identity(p, chars)
    combo_lies(p, chars)
    fill_episode_matrix(p, stories)
    fill_remaining(p)
    questions, report = trim_and_id(p)
    pack = {
        "categories": [{"id": i, "title": t} for i, t in CATS],
        "tiers": [1, 2, 3, 4, 5],
        "roundValues": [[100, 200, 300, 400, 500], [200, 400, 600, 800, 1000], [300, 600, 900, 1200, 1500]],
        "roundCats": [3, 4, 5],
        "questions": questions,
    }
    OUT.write_text(json.dumps(pack, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    ct = Counter((q[1], q[2]) for q in questions)
    print("wrote", OUT, "n=", len(questions), "bytes", OUT.stat().st_size)
    print("min cell", min(ct.values()), "max", max(ct.values()))
    starts = Counter(" ".join(q[3].split()[:4]) for q in questions)
    print("top stems:")
    for s, n in starts.most_common(12):
        print(f"  {n:4d}  {s}")
    print("junk leftovers", sum(1 for q in questions if is_junk(q[3])))
    if report:
        print("SHORT:", report[:12], "total", len(report))


if __name__ == "__main__":
    main()
