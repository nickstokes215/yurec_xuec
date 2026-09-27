#!/bin/sh
# Готовит www для Linux .deb. Сам пакет собирает GitHub Actions «Сборка DEB».
set -eu
cd /workspace
WWW_SRC="android/app/src/main/assets/www"
test -f "$WWW_SRC/index.html"
rm -rf windows/www
cp -a "$WWW_SRC" windows/www
VER=$(python3 -c "import json; print(json.load(open('src/data/changelog.json'))['version'])")
python3 - <<PY
from pathlib import Path
import re
p = Path("windows/package.json")
text = p.read_text()
ver = "$VER"
sem = ver if ver.count(".") >= 2 else ver + ".0"
text = re.sub(r'"version":\s*"[^"]+"', '"version": "%s"' % sem, text, count=1)
p.write_text(text)
print("linux deb version", sem)
PY
echo "www скопирован в windows/www ($VER). DEB: Actions → «Сборка DEB»." >&2
