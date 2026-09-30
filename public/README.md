# public/ — то, что видит приложение

Картинки, звуки и движки игр. Сюда смотрит веб (`npm run dev`). В телефонный снапшот их копирует `scripts/pack-www.sh` → `android/app/src/main/assets/www/`.

После добавления файла: pack-www, commit `public/` **и** `www`.

| Папка | Зачем |
|---|---|
| `characters/` | Аватары. Имя файла = id в `src/data/characters.json` |
| `covers/` | Кроссворды `crossword-1.jpg`…`20`, уровни квеста `level-1`…`5`, цитатник, паспорт, чат |
| `press/` | Газета: `p47-*.jpg` выпуск №47, `p52-*.jpg` №52 |
| `thumbs/` | Миниатюры серий и песен: `s01e00.jpg`, `song-*.jpg` |
| `media/` | Плитки медиа и свои обложки |
| `banners/` | Шапки чипов: серии / песни / визиты / бонусы |
| `quotes/` | Голоса героев, mp3 |
| `icons/` | Ярлык comedy / horror |
| `game/` | Обложки хабов, `av-game.js`, `ark-game.js`, `secret-gate.js`, колода `svoya-q.json` |
| `donate/` | Картинки доната |
| `achievements/` | Зашквары: обложка, закрытая медаль, открытые |
| `maps/` | Двор, Петербург, квартира |

Корень: `og.jpg`, `easter-horror.jpg`, `yurec-icon.jpg`, `favicon.svg`, иногда `yurec_xuec.apk` (запас, если GitHub ещё не умеет подписывать). IPA/EXE/DEB в эту папку не класть.

`__grok/` — служебное превью/PWA, руками не трогать.
