# android/ — оболочка телефона

WebView открывает `app/src/main/assets/www/`. Картинки и движки туда копирует `scripts/build-apk.sh` из `public/` и `src/data`.

| Путь | Зачем |
|---|---|
| `app/src/main/java/ru/yurec/xuec/` | MainActivity, оффлайн, ярлык, не гасить экран |
| `app/src/main/res/` | Иконки comedy/horror, строки, тема |
| `app/src/main/assets/www/` | Снапшот веба для APK. Не править руками — перезапишется сборкой |
| `keystore/` | Авторская подпись. В git не класть. См. `keystore/README.md` |
| `keystore.properties` | Пароль подписи. В git не класть |
| `keystore.properties.example` | Шаблон без пароля |

Пакет: `ru.yurec.xuec`. Версия — `app/build.gradle` (`versionName` = номер из `changelog.json`).
