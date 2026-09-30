# android/app/

Единственный Gradle-модуль. Пакет `ru.yurec.xuec`, minSdk 21 (Android 5), target 34.

Java:

| Класс | Зачем |
|---|---|
| `MainActivity` | Полноэкранный WebView на `https://appassets.androidplatform.net/assets/www/index.html`. Системная «назад», файл-chooser, не гасить экран, смена иконки comedy/horror |
| `YurecOffline` | Скачивание роликов, шаринг в JS |
| `QuoteWidget` | Виджет «цитата дня» на рабочий стол |

www — копия двора. Сборка его не компилирует из React, а кладёт как статику.
