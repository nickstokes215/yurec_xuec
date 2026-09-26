# windows/ — оболочка Windows

Electron открывает тот же `www`, что Android и iPhone. Это оффлайн EXE: двор внутри файла, интернет не обязателен. Магазин Microsoft не нужен.

| Путь | Зачем |
|---|---|
| `main.js` | Окно Chromium, внешние ссылки в системный браузер |
| `preload.js` | Флаг `__NATIVE_SHELL__=win` |
| `icon.png` | Иконка ярлыка |
| `www/` | Не хранить. Копируется из Android www на сборке |

Пакет: `ru.yurec.xuec`. Версия = номер из `changelog.json` (semver `1.65.0`).

Сборка: `./scripts/build-exe.sh` готовит `www`. Сам `.exe` собирает GitHub Actions «Сборка EXE» на Windows. Готовый файл: релиз `yurec_xuec.exe`.
