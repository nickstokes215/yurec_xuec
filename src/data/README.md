# src/data/ — канон двора

Тексты и каталог. Веб React импортирует JSON напрямую. APK/IPA/EXE/сайт получают копию в `www/data.js` через `scripts/pack-www.sh`.

После правки JSON для телефона всегда: `./scripts/pack-www.sh` и коммит `www` + json вместе.

| Файл | Содержание |
|---|---|
| `changelog.json` | Номер сборки, дата, **весь** журнал с 1.0. Правила нумерации — корневой `AGENTS.project.md` |
| `stories.json` | Серии, визиты, песни, бонусы. `kind`, `slug`, текст, обложка |
| `videos.json` | Ролики медиа. `thumb` → файл в `public/` |
| `characters.json` | Герои. `photo` → `public/characters/{id}.jpg` |
| `press.json` | Два выпуска газеты, страницы `public/press/p47-*.jpg` и `p52-*.jpg` |
| `crossword.json` | Сетки №1–№20. Обложка `public/covers/crossword-N.jpg` |
| `game-script.json` | Квест, день (уровень 1) |
| `game-olimpik.json` | Уровень 2 |
| `game-tsar.json` | Уровень 3 |
| `game-mirage.json` | Уровень 4 |
| `game-dinner.json` | Уровень 5 |
| `quotes.json` | Голосовые фразы, `src` → `public/quotes/*.mp3` |
| `citats.json` | Цитатник (текст, кто сказал) |
| `achievements.json` | Зашквары: id, вкус, подсказка, картинка |
| `yard-map.json` | Слои и пины карты |
| `offline-index.json` | Что можно скачать с Яндекс.Диска |
| `svoya-meta.ts` / `svoya.ts` | Правила и разбор колоды. Колода — `public/game/svoya-q.json` |
| `catalog.ts` | Типы, поиск, ссылки GitHub/Telegram/YouTube |
| `game.ts` | Хаб игр, цепи Помойкобола и Алконоида |
| `crossword.ts` / `quotes.ts` / `citats.ts` / `yard-map.ts` / `achievements.ts` | Обёртки JSON |

Не клади ключи лицензии и читы в эти JSON.
