# Подпись APK

Этим ключом подписаны все релизы «Жизнь Юрца». Потеряешь — обновления поверх старых APK не встанут.

## Что должно лежать здесь (и никуда больше)

- `nickstokes215.jks` — хранилище ключа
- Рядом, на уровень выше: `android/keystore.properties`

Шаблон свойств: [`../keystore.properties.example`](../keystore.properties.example).

```
storePassword=...
keyPassword=...
keyAlias=nickstokes215
```

Либо переменные окружения `YUREC_STORE_PASS` / `YUREC_KEY_PASS`.

## Чего не делать

- Не коммитить `.jks` и `keystore.properties`
- Не класть копию ключа во вложения, в `docs/`, в облако «на всякий»
- Не публиковать пароль в README, чатах и тикетах

Сертификат: CN=Konstantin Smirnov, OU=King, O=Dom, L=St. Petersburg, ST=Leningradskaya, C=Russia.
