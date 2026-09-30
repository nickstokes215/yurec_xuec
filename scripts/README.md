# scripts/

Сборка и генерация. Приложение эти файлы не импортирует.

| Файл / папка | Зачем |
|---|---|
| `pack-www.sh` | Канон: `public/` + `src/data` → `android/.../www/`. Нужен перед релизом и сайтом |
| `build-apk.sh` | pack-www + Gradle signed APK → `public/yurec_xuec.apk` |
| `build-ipa.sh` | Готовит `ios/www`. IPA — Actions на Mac |
| `build-exe.sh` | Готовит `windows/www`. EXE — Actions на Windows |
| `build-deb.sh` | Готовит www. DEB — Actions на Linux |
| [`crossword/`](crossword/README.md) | Сетки кроссвордов |
| [`press/`](press/README.md) | Развороты газеты |
| [`qa/`](qa/README.md) | Старые смоуки |
| `pack-svoya.py` | Колода 10 000 вопросов → `public/game/svoya-q.json` |
| `fetch-yt-thumbs.py` | Обложки YouTube в `public/thumbs/` |
| `secret-gate.test.mjs` | Хеши на месте, чужие слова не проходят |
| `brand-check.mjs`, `browser-smoke*.mjs` | Карточка OG и смоук превью |
| `grok-pwa-*.mjs` | PWA превью Grok, не двор |
| `copy-pglite.mjs`, `migrate.mjs` | База каркаса |

Релиз на GitHub: [`.github/README.md`](../.github/README.md).
