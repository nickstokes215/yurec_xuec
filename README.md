# Жизнь Юрца

Гибридный сборник: веб (Vite + React), Android (WebView), iPhone (WKWebView / PWA), Windows (EXE) и Ubuntu (DEB). Канал [t.me/yurec_xuec](https://t.me/yurec_xuec), автор Константин Смирнов.

Это не «ещё одно приложение с Юрцом». Это двор: серии, песни, визиты, кроссворды, Помойкобол, Алконоид, карта Шотмана и зашквары.

## Что где лежит

| Папка | Зачем |
|---|---|
| [`src/`](src/README.md) | Экраны, компоненты, хуки, JSON текстов |
| [`public/`](public/README.md) | Картинки, голоса, движки игр, APK для скачивания |
| [`android/`](android/README.md) | Оболочка WebView, иконки, подпись |
| [`ios/`](ios/README.md) | Оболочка WKWebView, unsigned IPA для джейлбрейка |
| [`windows/`](windows/README.md) | Оболочка Electron: portable EXE и .deb для Ubuntu |
| [`scripts/`](scripts/README.md) | Сборка APK / IPA / EXE / DEB, кроссворды, QA |
| [`docs/`](docs/README.md) | Карта проекта и исходники картинок |
| `migrations/` | SQL для PGLite (авторизация-заготовка, в сборнике почти не используется) |

Короткий README есть почти в каждой папке — открыл и понял, что внутри.

## Запуск веб-сборника

```
npm install
npm run dev
```

Смотрит на `0.0.0.0:8080`.

## Сборка APK

Нужны JDK 17, Android SDK и файл подписи. Пароль — в `android/keystore.properties` (этот файл в git не класть) либо в переменной `YUREC_STORE_PASS`.

```
./scripts/build-apk.sh
```

Готовый файл: `public/yurec_xuec.apk`. Как устроена подпись — [`android/keystore/README.md`](android/keystore/README.md).

## Сборка IPA

Исходники — [`ios/`](ios/README.md). Unsigned IPA (TrollStore / Sideloadly), без Apple Developer.

```
./scripts/build-ipa.sh
```

На машине без Xcode скрипт только готовит `www`. Сам файл собирает GitHub Actions «Сборка IPA». Готовый файл: `public/yurec_xuec.ipa` и релиз.

## Сборка EXE

Исходники — [`windows/`](windows/README.md). Portable EXE, без магазина Microsoft. Тот же `www`, что в APK.

```
./scripts/build-exe.sh
```

Сам файл собирает GitHub Actions «Сборка EXE» на Windows. Готовый файл — релиз `yurec_xuec.exe`.

## Сборка DEB

Тот же Electron и тот же `www`, пакет для Ubuntu/Debian amd64.

```
./scripts/build-deb.sh
```

Сам файл собирает GitHub Actions «Сборка DEB» на Linux. Готовый файл — релиз `yurec_xuec.deb`. Установка: `sudo apt install ./yurec_xuec.deb`.

## GitHub: сайт, APK, IPA, EXE, DEB

Веб-сборник (компьютер и Safari): [nickstokes215.github.io/yurec_xuec](https://nickstokes215.github.io/yurec_xuec/)

Релизы: [releases](https://github.com/nickstokes215/yurec_xuec/releases)

- APK: [yurec_xuec.apk](https://github.com/nickstokes215/yurec_xuec/releases/latest/download/yurec_xuec.apk)
- IPA: [yurec_xuec.ipa](https://github.com/nickstokes215/yurec_xuec/releases/latest/download/yurec_xuec.ipa)
- EXE: [yurec_xuec.exe](https://github.com/nickstokes215/yurec_xuec/releases/latest/download/yurec_xuec.exe)
- DEB: [yurec_xuec.deb](https://github.com/nickstokes215/yurec_xuec/releases/latest/download/yurec_xuec.deb)

Workflows: «Сайт», «Релиз APK», «Сборка IPA», «Сборка EXE», «Сборка DEB». Тег `1.65` кладёт файлы в релиз.

## iPhone

Без джейлбрейка: Safari → сайт выше → «Поделиться» → «На экран Домой».
С джейлбрейком: IPA из релиза, TrollStore. App Store не нужен.
## Перед тем как выложить исходники

Не публиковать:

- `android/keystore/*.jks` — этим ключом подписаны все релизы
- `android/keystore.properties` — пароль от ключа
- `attachments/`, `screenshots/`, `artifacts/` — черновики и QA

`.gitignore` это уже закрывает. Если копируешь папку руками, а не через git — эти файлы вырежи сам.

Лицензионное слово и чит-коды в коде не лежат открытым текстом: сверка идёт по SHA-256. Это не банковский сейф (приложение клиентское), но grep по репозиторию заветное слово сразу не выдаёт.

## Версия

Номер живёт в [`src/data/changelog.json`](src/data/changelog.json). Журнал с `1.0` хранится целиком. Правила нумерации — в `AGENTS.project.md`.
