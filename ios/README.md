# ios/ — оболочка iPhone

WKWebView открывает тот же `www`, что Android. App Store не нужен: IPA без подписи Apple (TrollStore / Sideloadly).

Без джейлбрейка люди ставят **сайт** в Safari на Домой, не этот IPA.

| Путь | Зачем |
|---|---|
| [`Sources/`](Sources/README.md) | AppDelegate + WebViewController |
| `Resources/` | Info.plist, иконка |
| `project.yml` | XcodeGen, бандл `ru.yurec.xuec`, `MARKETING_VERSION` |
| `www/` | Не в git. Копируется из Android www на сборке |

**Сборка не с тега.** Actions → «Сборка IPA» → Run workflow (macos-15). Или в чате: «собери IPA». Локально без Xcode `./scripts/build-ipa.sh` только готовит www.
