# public/achievements/

Картинки зашкваров двора. Имя файла = `id` в `src/data/achievements.json`.

`cover.jpg` — обложка раздела, `locked.jpg` — закрытая медаль.

В `1.65.23` добавлена «Экскурсия» — зашквар за пройденное до конца обучение. Кадр собран из фото двора и латунной медали в золотой рамке.

Логика открытия: `src/lib/use-achievements.ts` (React) и `achQualified` в `www/app.js`. Счётчики визитов и цитат лежат в `localStorage` ключе `yurec-ach-meta`.
