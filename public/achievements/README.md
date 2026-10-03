# public/achievements/

Картинки зашкваров двора. Имя файла = `id` в `src/data/achievements.json`.

`cover.jpg` — обложка раздела, `locked.jpg` — закрытая медаль.

В `1.65.2` список вырос до 50. Старые 20 кадров не трогали. Новые 30 собраны из фото двора (герои, карты, иконки, обложки) с золотой рамкой.

Логика открытия: `src/lib/use-achievements.ts` (React) и `achQualified` в `www/app.js`. Счётчики визитов и цитат лежат в `localStorage` ключе `yurec-ach-meta`.
