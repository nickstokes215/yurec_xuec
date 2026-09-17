# ios/ — оболочка iPhone

WKWebView открывает тот же `www`, что и Android. App Store и 99$ не нужны: IPA без подписи Apple, ставится с джейлбрейком (TrollStore, Sideloadly).

| Путь | Зачем |
|---|---|
| `Sources/` | AppDelegate + WebViewController |
| `Resources/` | Info.plist, иконка |
| `project.yml` | XcodeGen: схема, бандл `ru.yurec.xuec` |
| `www/` | Не хранить. Копируется из Android www на сборке |

Пакет: `ru.yurec.xuec`. Версия — `MARKETING_VERSION` в `project.yml` (= номер из changelog).

Сборка: `./scripts/build-ipa.sh` на Mac или GitHub Actions «Сборка IPA» (macos). Готовый файл: `public/yurec_xuec.ipa`.
