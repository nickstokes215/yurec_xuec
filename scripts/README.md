# Скрипты

Всё, что собирает, проверяет и генерирует сборник. Само приложение их не подключает.

| Папка / файл | Зачем |
|---|---|
| `build-apk.sh` | Собрать signed APK: копирует `public/` + `src/data` в Android assets |
| `fetch-yt-thumbs.py` | Докачать обложки YouTube в `public/thumbs/` |
| `copy-pglite.mjs`, `migrate.mjs` | База PGLite |
| `grok-pwa-*.mjs` | PWA, OG-карточка, тесты |
| `brand-check.mjs`, `browser-smoke*.mjs`, `browser-guard.mjs` | Смоук и брендинг |
| `crossword/` | Сборка и проверка сеток кроссвордов |
| `press/` | Генерация разворотов газеты (исходники + `shot.mjs`) |
| `secret-gate.test.mjs` | Проверка, что затвор грузится и чужие слова не проходят |
| `pack-svoya.py` | Колода «Юрца игра»: 25 тем × 80 × 5 = 10 000 вопросов в `public/game/svoya-q.json` |

Запуск кроссвордной проверки из корня проекта:

```
node scripts/crossword/validate-cw.mjs
```
