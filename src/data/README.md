# Данные сборника (`src/data/`)

Тексты и каталог. APK получает их упакованными в `android/app/src/main/assets/www/data.js`.

| Файл | Содержание |
|---|---|
| `stories.json` | Тексты серий / визитов / песен / бонусов |
| `videos.json` | Ролики медиа. `thumb` — путь к картинке в `public/` |
| `characters.json` | Карточки героев. `photo` → `public/characters/{id}.jpg` |
| `press.json` | Два выпуска газеты |
| `crossword.json` | Сетки №1–№20. Обложка `public/covers/crossword-N.jpg` |
| `game-script.json` | Квест, уровень 1 |
| `game-olimpik.json` | Уровень 2 |
| `game-tsar.json` | Уровень 3 |
| `game-mirage.json` | Уровень 4 |
| `game-dinner.json` | Уровень 5 |
| `quotes.json` | Голосовые цитаты (`src` → `public/quotes/*.mp3`) |
| `citats.json` | Цитатник |
| `achievements.json` | Зашквары двора |
| `yard-map.json` | Слои и пины карты двора |
| `offline-index.json` | Список файлов Яндекс.Диска |
| `svoya-meta.ts` / `svoya.ts` | Правила, истории финала, разбор колоды. Сама колода — `public/game/svoya-q.json` |
| `catalog.ts` / `game.ts` / `crossword.ts` / `quotes.ts` / `citats.ts` / `yard-map.ts` | Типы и хелперы |

Не клади ключи лицензии и чит-коды в эти JSON — сверка в `src/lib/secret-gate.ts`.
