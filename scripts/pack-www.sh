#!/bin/sh
# Пакует двор в android/app/src/main/assets/www/
# Это общий снапшот для APK, IPA, EXE, DEB и GitHub Pages.
# Источник правды: public/ (картинки, голоса, движки) + src/data/*.json (тексты).
# Не править www руками — этот скрипт перезапишет.
set -eu
ROOT="$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
WWW="android/app/src/main/assets/www"
mkdir -p "$WWW"

python3 - << 'PY'
import json
st=[s for s in json.load(open("src/data/stories.json")) if s.get("kind") != "sketch"]
vd=json.load(open("src/data/videos.json"))
gm=json.load(open("src/data/game-script.json"))
ol=json.load(open("src/data/game-olimpik.json"))
ts=json.load(open("src/data/game-tsar.json"))
mg=json.load(open("src/data/game-mirage.json"))
dn=json.load(open("src/data/game-dinner.json"))
ch=json.load(open("src/data/changelog.json"))
chars=json.load(open("src/data/characters.json"))
pr=json.load(open("src/data/press.json"))
cw=json.load(open("src/data/crossword.json"))
if isinstance(cw, dict):
    cw=[cw]
quotes=json.load(open("src/data/quotes.json"))
citats=json.load(open("src/data/citats.json"))
ach=json.load(open("src/data/achievements.json"))
off=json.load(open("src/data/offline-index.json"))
yard=json.load(open("src/data/yard-map.json"))
out=open("android/app/src/main/assets/www/data.js","w")
out.write("window.STORIES=")
json.dump(st,out,ensure_ascii=False,separators=(",",":"))
out.write(";\nwindow.VIDEOS=")
json.dump(vd,out,ensure_ascii=False,separators=(",",":"))
out.write(";\nwindow.YUREC_GAME=")
json.dump(gm,out,ensure_ascii=False,separators=(",",":"))
out.write(";\nwindow.YUREC_LEVELS=")
json.dump([gm, ol, ts, mg, dn],out,ensure_ascii=False,separators=(",",":"))
out.write(";\nwindow.YUREC_APP=")
json.dump(ch,out,ensure_ascii=False,separators=(",",":"))
out.write(";\nwindow.YUREC_CHARACTERS=")
json.dump(chars,out,ensure_ascii=False,separators=(",",":"))
out.write(";\nwindow.YUREC_PRESS=")
json.dump(pr,out,ensure_ascii=False,separators=(",",":"))
out.write(";\nwindow.YUREC_CROSSWORDS=")
json.dump(cw,out,ensure_ascii=False,separators=(",",":"))
out.write(";\nwindow.YUREC_CROSSWORD=")
json.dump(cw[0] if cw else {},out,ensure_ascii=False,separators=(",",":"))
out.write(";\nwindow.YUREC_QUOTES=")
json.dump(quotes,out,ensure_ascii=False,separators=(",",":"))
out.write(";\nwindow.YUREC_CITATS=")
json.dump(citats,out,ensure_ascii=False,separators=(",",":"))
out.write(";\nwindow.YUREC_ACHIEVEMENTS=")
json.dump(ach,out,ensure_ascii=False,separators=(",",":"))
out.write(";\nwindow.YUREC_OFFLINE=")
json.dump(off,out,ensure_ascii=False,separators=(",",":"))
out.write(";\nwindow.YUREC_YARD=")
json.dump(yard,out,ensure_ascii=False,separators=(",",":"))
out.write(";\n")
PY

copy_dir() {
  mkdir -p "$WWW/$1"
  cp -f "public/$1/"*$2 "$WWW/$1/" 2>/dev/null || true
}

copy_dir characters .jpg
copy_dir quotes .mp3
copy_dir thumbs .jpg
copy_dir media .jpg
copy_dir banners .jpg
copy_dir covers .jpg
copy_dir donate .jpg
copy_dir achievements .jpg
copy_dir press .jpg
mkdir -p "$WWW/game"
cp -f public/game/*.jpg "$WWW/game/"
cp -f public/game/av-game.js "$WWW/game/av-game.js"
cp -f public/game/ark-game.js "$WWW/game/ark-game.js"
cp -f public/game/secret-gate.js "$WWW/game/secret-gate.js"
cp -f public/game/svoya-q.json "$WWW/game/svoya-q.json"
mkdir -p "$WWW/maps/thumbs"
cp -f public/maps/*.jpg "$WWW/maps/"
cp -f public/maps/thumbs/*.jpg "$WWW/maps/thumbs/"
mkdir -p "$WWW/icons"
cp -f public/icons/*.jpg "$WWW/icons/"
cp -f public/og.jpg "$WWW/og.jpg"
cp -f public/easter-horror.jpg "$WWW/easter-horror.jpg"
cp -f public/favicon.svg "$WWW/favicon.svg"
cp -f public/yurec-icon.jpg "$WWW/yurec-icon.jpg"

test -f "$WWW/index.html"
test -f "$WWW/data.js"
echo "www упакован: $WWW"
