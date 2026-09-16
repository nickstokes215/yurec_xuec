#!/bin/sh
set -eu
cd /workspace
export ANDROID_HOME="${ANDROID_HOME:-/workspace/.android-sdk}"
export ANDROID_SDK_ROOT="$ANDROID_HOME"
export JAVA_HOME="${JAVA_HOME:-/usr/lib/jvm/java-17-openjdk-amd64}"
export GRADLE_USER_HOME="${GRADLE_USER_HOME:-/workspace/.gradle-home}"
GRADLE="${GRADLE:-/workspace/.gradle-dist/gradle-8.7/bin/gradle}"

mkdir -p android/app/src/main/assets/www
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
mkdir -p android/app/src/main/assets/www/characters
cp -f public/characters/*.jpg android/app/src/main/assets/www/characters/
mkdir -p android/app/src/main/assets/www/quotes
cp -f public/quotes/*.mp3 android/app/src/main/assets/www/quotes/
mkdir -p android/app/src/main/assets/www/thumbs
python3 scripts/fetch-yt-thumbs.py || echo "yt thumbs: часть обложек не скачалась, сборка идёт дальше" >&2
cp -f public/thumbs/*.jpg android/app/src/main/assets/www/thumbs/
mkdir -p android/app/src/main/assets/www/media
cp -f public/media/*.jpg android/app/src/main/assets/www/media/
mkdir -p android/app/src/main/assets/www/banners
cp -f public/banners/*.jpg android/app/src/main/assets/www/banners/
mkdir -p android/app/src/main/assets/www/covers
cp -f public/covers/*.jpg android/app/src/main/assets/www/covers/
mkdir -p android/app/src/main/assets/www/donate
cp -f public/donate/*.jpg android/app/src/main/assets/www/donate/
mkdir -p android/app/src/main/assets/www/achievements
cp -f public/achievements/*.jpg android/app/src/main/assets/www/achievements/
mkdir -p android/app/src/main/assets/www/press
cp -f public/press/*.jpg android/app/src/main/assets/www/press/
mkdir -p android/app/src/main/assets/www/game
cp -f public/game/*.jpg android/app/src/main/assets/www/game/
cp -f public/game/av-game.js android/app/src/main/assets/www/game/av-game.js
cp -f public/game/ark-game.js android/app/src/main/assets/www/game/ark-game.js
cp -f public/game/secret-gate.js android/app/src/main/assets/www/game/secret-gate.js
cp -f public/game/svoya-q.json android/app/src/main/assets/www/game/svoya-q.json
mkdir -p android/app/src/main/assets/www/maps
cp -f public/maps/*.jpg android/app/src/main/assets/www/maps/
mkdir -p android/app/src/main/assets/www/maps/thumbs
cp -f public/maps/thumbs/*.jpg android/app/src/main/assets/www/maps/thumbs/
cp -f public/og.jpg android/app/src/main/assets/www/og.jpg
cp -f public/easter-horror.jpg android/app/src/main/assets/www/easter-horror.jpg
mkdir -p android/app/src/main/assets/www/icons
cp -f public/icons/*.jpg android/app/src/main/assets/www/icons/
cp -f public/favicon.svg android/app/src/main/assets/www/favicon.svg
cp -f public/yurec-icon.jpg android/app/src/main/assets/www/yurec-icon.jpg

if [ -z "${YUREC_STORE_PASS:-}" ] && [ ! -f android/keystore.properties ]; then
  echo "Нет пароля авторской подписи. Задай YUREC_STORE_PASS или android/keystore.properties" >&2
  exit 1
fi
"$GRADLE" -p android assembleRelease --no-daemon
APK="android/app/build/outputs/apk/release/app-release.apk"
test -f "$APK"
mkdir -p public artifacts
cp "$APK" public/yurec_xuec.apk
cp "$APK" artifacts/yurec_xuec.apk
rm -f public/zhizn-yurtsa.apk artifacts/zhizn-yurtsa.apk
ls -lh public/yurec_xuec.apk
