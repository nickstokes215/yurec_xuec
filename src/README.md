# src/ — код сборника

Две жизни одного двора:

1. **Веб в превью Grok / `npm run dev`** — React 19 + TanStack Router. Файлы здесь.
2. **Телефон / EXE / сайт на Pages** — не этот React, а снапшот `android/app/src/main/assets/www/app.js`. JSON из `data/` туда кладёт `scripts/pack-www.sh` как `data.js`.

Правишь текст серии — правишь `src/data/stories.json`, потом pack-www. Правишь экран настроек в React — это превью; паритетный экран в `www/app.js` правится отдельно, если меняется оболочка телефона.

| Папка / файл | Зачем |
|---|---|
| [`routes/`](routes/README.md) | Экраны. Имя файла ≈ адрес |
| [`components/`](components/README.md) | Оболочка, кроссворд, карта, оффлайн, салют |
| [`data/`](data/README.md) | JSON канона и хелперы |
| [`lib/`](lib/README.md) | Хуки: прочитано, лицензия, игры, Юрец AI |
| `styles.css` | Тема двора (тёмный двор, золото, медь) |
| `router.tsx` | `getRouter()` для TanStack Start |
| `routeTree.gen.ts` | Генерится роутером, руками не трогать |

`lib/auth/` — заготовка Better Auth из каркаса. Сборник ходит без аккаунтов: лицензия — локальное слово, не логин.
