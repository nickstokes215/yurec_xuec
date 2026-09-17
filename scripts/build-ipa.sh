#!/bin/sh
# Собирает unsigned IPA. На Linux без Xcode — только готовит www; сам .ipa
# собирает GitHub Actions «Сборка IPA» на macos-15.
set -eu
cd /workspace
WWW_SRC="android/app/src/main/assets/www"
test -f "$WWW_SRC/index.html"
rm -rf ios/www
cp -a "$WWW_SRC" ios/www
if ! command -v xcodegen >/dev/null 2>&1 || ! command -v xcodebuild >/dev/null 2>&1; then
  echo "Xcode нет в этой среде. IPA соберёт GitHub Actions (macos)." >&2
  echo "www скопирован в ios/www. Дальше: Actions → «Сборка IPA»." >&2
  exit 0
fi
cd ios
xcodegen generate
xcodebuild \
  -project Yurec.xcodeproj \
  -scheme Yurec \
  -configuration Release \
  -sdk iphoneos \
  -destination 'generic/platform=iOS' \
  -derivedDataPath build \
  CODE_SIGN_IDENTITY="" \
  CODE_SIGNING_REQUIRED=NO \
  CODE_SIGNING_ALLOWED=NO \
  CODE_SIGN_ENTITLEMENTS="" \
  build
APP="build/Build/Products/Release-iphoneos/Yurec.app"
test -d "$APP"
rm -rf Payload
mkdir Payload
cp -R "$APP" Payload/Yurec.app
zip -qry /workspace/public/yurec_xuec.ipa Payload
ls -lh /workspace/public/yurec_xuec.ipa
