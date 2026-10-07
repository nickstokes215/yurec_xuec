# src/routes/ — экраны

Файл = адрес. `__root.tsx` — html-оболочка, тема, PreviewHostBridge. `index.tsx` — главная.

Вложенные маршруты с точкой: `game.av.tsx` → `/game/av`. Динамика: `story.$slug.tsx` → `/story/s01e07`.

| Файл | Экран |
|---|---|
| `index.tsx` | Главная: чипы видов, поиск, цитата дня, карточки |
| `story.$slug.tsx` | Читалка. Прочитано, закладка, голос, лупа обложки |
| `saved.tsx` | Закладки |
| `characters.tsx` | Оболочка вкладки героев |
| `characters.index.tsx` | Список карточек, долгий тап — порядок |
| `characters.$id.tsx` | Карточка одного героя |
| `characters.map.tsx` | Карта двора / Петербург / квартира |
| `game.tsx` | Оболочка вкладки игр |
| `game.index.tsx` | Хаб: квест, кроссворды, Помойкобол, Алконоид, Юрца игра |
| `game.quest.tsx` | Выбор уровня Юрцовского квеста |
| `game.$id.tsx` | Сам квест (ветка JSON) |
| `game.crosswords.tsx` | Список сеток №1–№20 |
| `game.av.tsx` | Помойкобол |
| `game.ark.tsx` | Алконоид |
| `game.svoya.tsx` | «Своя игра» двора |
| `videos.tsx` | Оболочка медиа |
| `videos.index.tsx` | Плитки разделов |
| `videos.$cat.tsx` | Ролики одной полки, газета |
| `press.$id.tsx` | Разворот газеты, зум и свайп |
| `citats.tsx` | Цитатник |
| `chat.tsx` | Юрец AI: разговор и SMS |
| `settings.tsx` | Тема, звук, бэкап, скачать, виджет, чит-коды в админке |
| `about.tsx` | Инфо, дисклеймер, ссылки дальше |
| `changelog.tsx` | Журнал с 1.0, структура экрана не менять |
| `ideas.tsx` | Нереализованные идеи. Сейчас один пункт |
| `donate.tsx` | Карта, комментарий, две картинки |
| `offline.tsx` | Менеджер оффлайн-видео |
| `apk.tsx` | Как поставить: APK / IPA / EXE / DEB / сайт |
| `passport.tsx` | Цифры двора |
| `zashkvary.tsx` | Медали-зашквары |
| `channel.tsx` | Ссылки на Telegram и YouTube |
| `login.tsx` | Каркас входа, в сборнике не нужен |
| `api/auth/$.ts` | Better Auth, не двор |

Нижнее меню рисует [`../components/app-shell.tsx`](../components/app-shell.tsx).
