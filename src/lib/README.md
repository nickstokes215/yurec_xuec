# src/lib/ — хуки и утилиты

| Файл | Зачем |
|---|---|
| `use-settings.ts` | Тема, вибрация, звук, экран, ярлык, тумблеры меню |
| `use-paid.ts` | Лицензия после доната |
| `use-game.ts`, `game-stats.ts` | Прогресс квеста, кроссвордов, Помойкобола, Алконоида |
| `use-achievements.ts` | Зашквары двора |
| `use-read.ts`, `use-library.ts` | Прочитано / закладки |
| `use-backup.ts`, `use-passport.ts` | Справка двора и паспорт |
| `secret-gate.ts` | Сверка лицензии и чит-кодов по SHA-256. Слова в файле нет |
| `license-key.ts` | Один вход: сначала разработчик, потом лицензия |
| `offline.ts` | Оффлайн-видео с Яндекс.Диска |
| `yurec-brain.ts`, `yurec-chat.ts`, `yurec-chat-store.ts` | Юрец AI |
| `svoya-store.ts`, `svoya-stats.ts` | «Юрца игра»: партия и таблица |
| `zoom.ts` | Лупа по картинкам |

`auth/` — каркас входа, в приложении выключен.
