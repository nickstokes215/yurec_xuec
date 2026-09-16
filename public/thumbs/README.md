# Миниатюры роликов (`thumbs/`)

Имена как у серий:

- `s01e00.jpg` — пилот
- `s01e02b.jpg` — литерные серии
- `s01e07.jpg` — полный выпуск, `s01e07-teaser.jpg` — тизер
- `s01e29-teaser.jpg` — тизер «Пещерный поиск работы»
- `sms-kletka.jpg` — спецвыпуск «Клетка»
- `song-korol-olimpika.jpg` и другие — по `storySlug` песни

«Знак в голове» и «Попурри» лежат в `../media/` — свои кадры, не YouTube.
Скрипт докачки: `scripts/fetch-yt-thumbs.py`. Поле `thumb` в `src/data/videos.json`.
