# Жизнь Юрца

Гибридный сборник: веб (Vite + React) и Android (WebView). Канал [t.me/yurec_xuec](https://t.me/yurec_xuec), автор Константин Смирнов.

Это не «ещё одно приложение с Юрцом». Это двор: серии, песни, визиты, кроссворды, Помойкобол, Алконоид, карта Шотмана и зашквары.

## Что где лежит

| Папка | Зачем |
|---|---|
| [`src/`](src/README.md) | Экраны, компоненты, хуки, JSON текстов |
| [`public/`](public/README.md) | Картинки, голоса, движки игр, APK для скачивания |
| [`android/`](android/README.md) | Оболочка WebView, иконки, подпись |
| [`scripts/`](scripts/README.md) | Сборка APK, кроссворды, QA |
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

## GitHub Releases

APK в релизы кладёт workflow [`.github/workflows/release-apk.yml`](.github/workflows/release-apk.yml).

Наспех: на GitHub → Actions → «Релиз APK» → Run workflow.

Правильно: `git tag 1.63 && git push origin 1.63`.

Скачать последнюю сборку: [releases/latest/download/yurec_xuec.apk](https://github.com/nickstokes215/yurec_xuec/releases/latest/download/yurec_xuec.apk).

## iPhone

Нативного IPA в App Store нет. Веб-сборник ставится с Safari: «Поделиться» → «На экран Домой». Тот же двор, без рамки браузера. Шаги — экран `/apk`.

## Перед тем как выложить исходники

Не публиковать:

- `android/keystore/*.jks` — этим ключом подписаны все релизы
- `android/keystore.properties` — пароль от ключа
- `attachments/`, `screenshots/`, `artifacts/` — черновики и QA

`.gitignore` это уже закрывает. Если копируешь папку руками, а не через git — эти файлы вырежи сам.

Лицензионное слово и чит-коды в коде не лежат открытым текстом: сверка идёт по SHA-256. Это не банковский сейф (приложение клиентское), но grep по репозиторию заветное слово сразу не выдаёт.

## Версия

Номер живёт в [`src/data/changelog.json`](src/data/changelog.json). Журнал с `1.0` хранится целиком. Правила нумерации — в `AGENTS.project.md`.
