# Как устроен сборник «Жизнь Юрца»

Читай это, если забыл. Код не в памяти Grok — он на GitHub: https://github.com/nickstokes215/yurec_xuec

## Одна фраза

Двор — статический HTML/JS плюс картинки. React в `src/` нужен превью в чате Grok. Телефон, EXE, DEB и сайт на Pages едят **один снапшот** `android/app/src/main/assets/www/`. Его собирает `scripts/pack-www.sh` из `public/` + `src/data/*.json`.

Две копии интерфейса:

| Где правишь | Кто видит |
|---|---|
| `src/routes/*.tsx` | Превью Grok, `npm run dev` |
| `android/.../www/app.js` + `index.html` | APK, IPA, EXE, DEB, GitHub Pages |

Тексты серий — один канон: `src/data/stories.json`. После правки JSON всегда `./scripts/pack-www.sh`, потом commit json **и** www вместе.

## Репозиторий — источник правды

1. `git pull origin main`
2. Правки
3. `./scripts/pack-www.sh` если трогал данные или картинки
4. commit + `git push origin main`
5. Если это новая версия: номер в `changelog.json`, тег `1.xx`, `git push origin 1.xx`

Тег поднимает только **APK**. IPA / EXE / DEB — Actions → Run workflow или фраза в чате «собери IPA».

## Номер сборки

Файл: `src/data/changelog.json`

- Поле `version` без буквы v: `1.65`
- `history` — **весь** журнал с `1.0`, старое не выкидывать
- Экран «История изменений» (`src/routes/changelog.tsx`) — структуру не ломать, только номер и пункты
- Gradle `versionName` = этот номер; `versionCode` +1 каждая сборка APK
- Первое слово запроса: **Обновление** → минор (`1.65`→`1.66`); **Исправление** → патч (`1.65`→`1.65.1`)

Правила ещё раз: корневой `AGENTS.project.md`.

## Оболочки

| Файл | Кто | Как |
|---|---|---|
| `yurec_xuec.apk` | Android 5+ | WebView, пакет `ru.yurec.xuec`, авторская подпись |
| сайт Pages | все / iPhone без джейлбрейка | тот же www |
| `yurec_xuec.ipa` | джейлбрейк | WKWebView, без Apple Developer |
| `yurec_xuec.exe` | Windows | Electron portable |
| `yurec_xuec.deb` | Ubuntu amd64 | Electron, пакет `yurec-xuec` |

Нативное в Android тонкое: `MainActivity` (WebView), `YurecOffline` (качка), `QuoteWidget` (цитата на рабочий стол). Новую фичу двора делай в JS/React, не новым Activity.

## Подпись APK

Локально: `android/keystore/nickstokes215.jks` + `android/keystore.properties`. **В git не класть.**

GitHub Actions:

1. Settings репозитория → Secrets and variables → Actions
2. `ANDROID_KEYSTORE_BASE64` = `base64 -w0 android/keystore/nickstokes215.jks`
3. `YUREC_STORE_PASS` = storePassword из properties

Пока секретов нет, workflow «Релиз» кладёт уже лежащий `public/yurec_xuec.apk` (его надо собрать локально `./scripts/build-apk.sh` и закоммитить).

Потеряешь `.jks` — обновления поверх старых APK не встанут.

## Что лежит в www

`pack-www.sh` пишет `data.js` (`window.STORIES`, `VIDEOS`, квесты, герои, газета, кроссворды, цитаты, зашквары, оффлайн, карта) и копирует jpg/mp3/js игр из `public/`. `index.html` и `app.js` в www уже живут — скрипт их не генерит из React.

## Память на телефоне (localStorage)

Все ключи начинаются с `yurec-`. Бэкап («справка») снимает их одним JSON.

| Ключ | Смысл |
|---|---|
| `yurec-read` | какие серии прочитаны |
| `yurec-license` / `yurec-dev` | донат / режим разработчика |
| `yurec-theme` | тема |
| `yurec-vibrate` / `yurec-sound` | мотор и звук |
| `yurec-font` | кегль читалки |
| `yurec-game-endings:{id}` | концовки квеста и кроссвордов |
| `yurec-av-wins` / `yurec-av-stats` | Помойкобол |
| `yurec-ark-wins` / `yurec-ark-stats` | Алконоид |
| `yurec-svoya*` | «Юрца игра» |
| `yurec-achievements` | зашквары |
| `yurec-offline-ids` | какие ролики скачаны |
| чат AI | ключи из `yurec-chat-store.ts` |

Слово лицензии и читы в репозитории не текстом: `src/lib/secret-gate.ts` сравнивает SHA-256.

## Игры

| Хаб | Код |
|---|---|
| Юрцовский квест | JSON `game-*.json`, экран `game.$id.tsx` |
| Кроссворды 1–20 | `crossword.json` + `components/crossword.tsx` |
| Помойкобол | `public/game/av-game.js` |
| Алконоид | `public/game/ark-game.js` |
| Юрца игра | колода `public/game/svoya-q.json` (10 000), `pack-svoya.py` |

## Ссылки, которые не менять без нужды

- Канал: https://t.me/yurec_xuec
- GitHub: https://github.com/nickstokes215/yurec_xuec
- Сайт: https://nickstokes215.github.io/yurec_xuec/
- APK latest: `.../releases/latest/download/yurec_xuec.apk`
- Пакет: `ru.yurec.xuec`

## Чего не делать

- Не править `www` руками и не коммитить его без `pack-www.sh`
- Не выкидывать пункты журнала
- Не коммитить `.jks` и пароль
- Не собирать IPA/EXE/DEB «заодно» с каждой версией — лимиты
- Не публиковать лицензионное слово
- Не ждать, что React-превью само попадёт в APK
