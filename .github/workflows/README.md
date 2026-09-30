# Workflows

YAML здесь. Крутятся на GitHub, не на телефоне автора.

| Файл | Имя в Actions | Триггер | Что делает |
|---|---|---|---|
| `release.yml` | Релиз | тег `*` или кнопка | **Собирает APK** из исходников, кладёт в Release |
| `release-apk.yml` | Релиз APK | кнопка | Кладёт уже лежащий `public/yurec_xuec.apk` (без Gradle) |
| `build-ipa.yml` | Сборка IPA | **только кнопка** | Unsigned IPA, macos-15 |
| `build-exe.yml` | Сборка EXE | **только кнопка** | Portable EXE, windows-latest |
| `build-deb.yml` | Сборка DEB | **только кнопка** | `.deb` Ubuntu amd64 |
| `pages.yml` | Сайт | push `www` в `main` или кнопка | GitHub Pages |

Тег не поднимает IPA/EXE/DEB — так бережём лимиты Actions.

## Откуда берётся двор внутри файла

Общий снапшот: `scripts/pack-www.sh` → `android/app/src/main/assets/www/`.

- APK: Gradle пакует этот www в WebView.
- IPA: копия в `ios/www`, XcodeGen + xcodebuild.
- EXE / DEB: копия в `windows/www`, electron-builder.
- Сайт: тот же www → `_site`.

Не собирай «разный двор» для разных оболочек. Номер — `src/data/changelog.json`.
