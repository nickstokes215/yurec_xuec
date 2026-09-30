# Жизнь Юрца

Гибридный сборник: веб, Android (APK), iPhone (Safari / IPA), Windows (EXE), Ubuntu (DEB). Канал [t.me/yurec_xuec](https://t.me/yurec_xuec), автор Константин Смирнов.

**Главное хранилище исходников — этот GitHub.** Песочница Grok, ноутбук, любой диск — копии. Не держи уникальный код только в чате.

Это двор: серии, песни, визиты, кроссворды, Помойкобол, Алконоид, карта Шотмана и зашквары.

Через год открой сначала [`docs/HOW.md`](docs/HOW.md) — там зачем каждая часть и как выпускать сборку.

## Что где лежит

| Папка | Зачем |
|---|---|
| [`src/`](src/README.md) | Экраны, компоненты, хуки, JSON текстов (React-превью) |
| [`public/`](public/README.md) | Картинки, голоса, движки игр |
| [`android/`](android/README.md) | WebView, APK, снапшот `www/` |
| [`ios/`](ios/README.md) | WKWebView, unsigned IPA |
| [`windows/`](windows/README.md) | Electron: EXE и DEB |
| [`scripts/`](scripts/README.md) | pack-www, сборки, кроссворды, QA |
| [`.github/`](.github/README.md) | Actions: релиз APK, сайт, кнопки IPA/EXE/DEB |
| [`docs/`](docs/README.md) | HOW.md и исходники картинок |
| [`migrations/`](migrations/README.md) | SQL каркаса Grok, не двор |
| [`server/`](server/README.md) | Middleware превью Grok |

Короткий README есть почти в каждой папке.

## Запуск веб-сборника (разработка)

```
npm install
npm run dev
```

Это React/Vite. Телефонные оболочки едят не Vite, а снапшот `android/app/src/main/assets/www/` (ванильный `app.js`). После правок данных или картинок:

```
./scripts/pack-www.sh
```

## Релиз

Номер живёт в [`src/data/changelog.json`](src/data/changelog.json). **По умолчанию тег собирает только APK.**

```
./scripts/pack-www.sh
git add -A && git commit -m "…" && git push origin main
git tag 1.66 && git push origin 1.66
```

Actions **Релиз** кладёт `yurec_xuec.apk` в [Releases](https://github.com/nickstokes215/yurec_xuec/releases).

- APK (авто): [yurec_xuec.apk](https://github.com/nickstokes215/yurec_xuec/releases/latest/download/yurec_xuec.apk)
- IPA / EXE / DEB — только кнопка в Actions или явный запрос в чат
- Сайт: [nickstokes215.github.io/yurec_xuec](https://nickstokes215.github.io/yurec_xuec/)

Локально APK: `./scripts/build-apk.sh` (JDK 17, SDK, `android/keystore.properties`). Ключ в git не класть — [`android/keystore/README.md`](android/keystore/README.md). Чтобы GitHub сам подписывал APK, один раз положи секреты — [`.github/README.md`](.github/README.md).

## iPhone

Без джейлбрейка: Safari → сайт → «Поделиться» → «На экран Домой».
С джейлбрейком: IPA из релиза (кнопка «Сборка IPA»), TrollStore. App Store не нужен.

## Перед тем как выложить исходники

Не публиковать:

- `android/keystore/*.jks`
- `android/keystore.properties`
- `attachments/`, `screenshots/`, `artifacts/`

`.gitignore` это закрывает.

Лицензионное слово и читы в коде не лежат открытым текстом: сверка SHA-256 в `src/lib/secret-gate.ts`.

## Версия

Номер в `changelog.json`. Журнал с `1.0` хранится целиком. Правила — `AGENTS.project.md`.
