# windows/ — оболочка Windows и Linux

Electron открывает тот же `www`. Windows — portable EXE. Ubuntu — `.deb`.

| Путь | Зачем |
|---|---|
| `main.js` | Окно Chromium 420×860, внешние ссылки в браузер |
| `preload.js` | `__YUREC_SHELL__` (win / linux) и версия |
| `icon.png` | Ярлык, не меньше 256px |
| `package.json` | electron-builder: appId `ru.yurec.xuec`, файлы `yurec_xuec.exe` / `yurec_xuec.deb` |
| `www/` | Не в git. Копируется на сборке |

**Не входят в авторелиз по тегу.** EXE: Actions → «Сборка EXE». DEB: «Сборка DEB». Или явный запрос в чате.
