# ru.yurec.xuec

Нативный слой тонкий: двор живёт в JS.

- `MainActivity.java` — WebView, мост `__NATIVE_SHELL__='android'`, громкость, вибрация через JS-интерфейс, выбор файла для бэкапа.
- `YurecOffline.java` — качка по URL из `offline-index.json`.
- `QuoteWidget.java` — читает ту же цитату, что настройки; тап открывает цитатник.

Новую фичу двора лучше делать в `www/app.js` / `src/`, а не новым Activity.
