#!/bin/sh
# Собирает подписанный APK. GitHub: workflow «Релиз» (тег) или «Релиз APK».
set -eu
ROOT="$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
export ANDROID_HOME="${ANDROID_HOME:-$ROOT/.android-sdk}"
export ANDROID_SDK_ROOT="$ANDROID_HOME"
export JAVA_HOME="${JAVA_HOME:-/usr/lib/jvm/java-17-openjdk-amd64}"
export GRADLE_USER_HOME="${GRADLE_USER_HOME:-$ROOT/.gradle-home}"
GRADLE="${GRADLE:-$ROOT/.gradle-dist/gradle-8.7/bin/gradle}"

sh "$ROOT/scripts/pack-www.sh"

python3 - <<'PY'
import json, pathlib, re
ver = json.load(open("src/data/changelog.json"))["version"]
p = pathlib.Path("android/app/build.gradle")
text = p.read_text()
text = re.sub(r'versionName\s+"[^"]+"', 'versionName "%s"' % ver, text, count=1)
p.write_text(text)
print("versionName", ver)
PY

if [ -z "${YUREC_STORE_PASS:-}" ] && [ ! -f android/keystore.properties ]; then
  echo "Нет пароля авторской подписи. Задай YUREC_STORE_PASS или android/keystore.properties" >&2
  exit 1
fi
if [ ! -f android/keystore/nickstokes215.jks ]; then
  echo "Нет android/keystore/nickstokes215.jks" >&2
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
