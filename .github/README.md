# .github/ — как живёт репозиторий

**Исходники на GitHub главные.** Песочница Grok, ноутбук, любой диск — копии. Не держи уникальный код только в чате.

Перед правкой: `git pull origin main`. После: commit + `git push origin main`.

## Релиз (по умолчанию только APK)

1. Правки текстов, картинок, кода в `main`.
2. `./scripts/pack-www.sh` — упаковать двор в `android/app/src/main/assets/www/` (это едят сайт, APK, IPA, EXE, DEB).
3. Commit + push `main`. Сайт на Pages обновится сам, если изменился `www`.
4. Тег = номер из `src/data/changelog.json`, без «v»:

```
git tag 1.66
git push origin 1.66
```

5. Actions → **Релиз** собирает APK на GitHub и кладёт `yurec_xuec.apk` в [Releases](https://github.com/nickstokes215/yurec_xuec/releases).

IPA, EXE, DEB **не** стартуют с тега. Нужны — Actions → «Сборка IPA» / «Сборка EXE» / «Сборка DEB» → Run workflow. Или напиши в чат «собери IPA».

Сайт: https://nickstokes215.github.io/yurec_xuec/

## Секреты для APK на GitHub

Подпись нельзя класть в git. Один раз: **Settings → Secrets and variables → Actions**.

| Секрет | Как получить |
|---|---|
| `ANDROID_KEYSTORE_BASE64` | `base64 -w0 android/keystore/nickstokes215.jks` |
| `YUREC_STORE_PASS` | пароль из `android/keystore.properties` (`storePassword`) |

Пока секретов нет, job берёт уже лежащий `public/yurec_xuec.apk` (собранный локально). IPA/EXE/DEB секретов не требуют.

## Кнопки вручную

| Workflow | Когда |
|---|---|
| Релиз | тег или «собрать APK на GitHub» |
| Релиз APK | положить уже готовый `public/yurec_xuec.apk`, без Gradle |
| Сборка IPA | iPhone / джейлбрейк |
| Сборка EXE | Windows |
| Сборка DEB | Ubuntu |
| Сайт | перевыложить Pages |

Карта YAML — [`workflows/README.md`](workflows/README.md).
