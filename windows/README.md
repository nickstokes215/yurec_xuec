# windows/ — оболочка Windows и Linux

Electron открывает тот же `www`, что Android и iPhone. Windows — оффлайн EXE. Ubuntu — `.deb`. Магазин Microsoft и Snap не нужны.

| Путь | Зачем |
|---|---|
| `main.js` | Окно Chromium, внешние ссылки в системный браузер |
| `preload.js` | Флаг `__NATIVE_SHELL__` (win / linux) |
| `icon.png` | Иконка ярлыка |
| `www/` | Не хранить. Копируется из Android www на сборке |

Пакет: `ru.yurec.xuec` / `yurec-xuec`. Версия = номер из `changelog.json` (semver `1.65.0`).

Сборка: `./scripts/build-exe.sh` или `./scripts/build-deb.sh` готовит `www`. Сами файлы собирает GitHub Actions «Сборка EXE» и «Сборка DEB». Релиз: `yurec_xuec.exe` и `yurec_xuec.deb`.
