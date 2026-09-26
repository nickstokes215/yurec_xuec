#!/bin/sh
# Готовит www для Windows-оболочки. Сам .exe собирает GitHub Actions «Сборка EXE».
set -eu
cd /workspace
WWW_SRC="android/app/src/main/assets/www"
test -f "$WWW_SRC/index.html"
rm -rf windows/www
cp -a "$WWW_SRC" windows/www
VER=$(python3 -c "import json; print(json.load(open('src/data/changelog.json'))['version'])")
python3 - <<PY
from pathlib import Path
p = Path("windows/package.json")
text = p.read_text()
ver = "$VER"
sem = ver if ver.count(".") >= 2 else ver + ".0"
import re
text = re.sub(r'"version":\s*"[^"]+"', '"version": "%s"' % sem, text, count=1)
p.write_text(text)
print("windows version", sem)
PY
if ! command -v npm >/dev/null 2>&1; then
  echo "www скопирован в windows/www. EXE соберёт GitHub Actions (windows)." >&2
  exit 0
fi
echo "www скопирован в windows/www ($VER). EXE: Actions → «Сборка EXE»." >&2
