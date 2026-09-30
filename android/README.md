# android/ — оболочка телефона

WebView открывает `app/src/main/assets/www/`. Картинки и JSON туда кладёт `scripts/pack-www.sh`. Gradle (`scripts/build-apk.sh` или Actions **Релиз**) заворачивает www в APK.

| Путь | Зачем |
|---|---|
| [`app/`](app/README.md) | Модуль приложения |
| `app/src/main/java/ru/yurec/xuec/` | MainActivity (WebView), оффлайн, виджет цитаты |
| `app/src/main/res/` | Иконки comedy/horror, строки, тема, виджет |
| `app/src/main/assets/www/` | Снапшот двора. Не править руками |
| `keystore/` | Авторская подпись. **В git не класть** `.jks` |
| `keystore.properties` | Пароль. **В git не класть** |
| `keystore.properties.example` | Шаблон без пароля |
| `app/build.gradle` | `applicationId ru.yurec.xuec`, `versionName`, `versionCode` |

`versionName` должен совпадать с `src/data/changelog.json`. `versionCode` растёт на 1 с каждой новой сборкой, иначе Android не обновит поверх.

Сестра на iPhone — [`ios/`](../ios/README.md). На Windows — [`windows/`](../windows/README.md).
