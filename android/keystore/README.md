# Подпись APK

Этим ключом подписаны все релизы «Жизнь Юрца». Потеряешь — обновления поверх старых APK не встанут.

## Что должно лежать здесь (и никуда больше)

- `nickstokes215.jks` — хранилище ключа
- Рядом, на уровень выше: `android/keystore.properties`

Шаблон: [`../keystore.properties.example`](../keystore.properties.example).

```
storePassword=...
keyPassword=...
keyAlias=nickstokes215
```

Либо `YUREC_STORE_PASS` / `YUREC_KEY_PASS`.

## GitHub Actions

Чтобы workflow **Релиз** собирал APK сам, один раз в репозитории:

Settings → Secrets and variables → Actions

| Секрет | Откуда |
|---|---|
| `ANDROID_KEYSTORE_BASE64` | `base64 -w0 android/keystore/nickstokes215.jks` |
| `YUREC_STORE_PASS` | `storePassword` |

Токен чата Grok секреты писать не умеет — только руками в браузере. Пока секретов нет, в релиз уходит `public/yurec_xuec.apk`, собранный локально.

## Чего не делать

- Не коммитить `.jks` и `keystore.properties`
- Не класть копию ключа во вложения, в `docs/`, в облако «на всякий»
- Не публиковать пароль в README, чатах и тикетах

Сертификат: CN=Konstantin Smirnov, OU=King, O=Dom, L=St. Petersburg, ST=Leningradskaya, C=Russia.
