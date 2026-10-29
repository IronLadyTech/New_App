#!/usr/bin/env bash
set -euo pipefail
export JAVA_HOME="/mnt/c/Program Files/Microsoft/jdk-21.0.12.8-hotspot"
export PATH="$JAVA_HOME/bin:$PATH"
export ANDROID_HOME="/mnt/c/Users/Magvig/AppData/Local/Android/Sdk"
export ANDROID_SDK_ROOT="$ANDROID_HOME"
export EXPO_PUBLIC_PHONE_OTP="${EXPO_PUBLIC_PHONE_OTP:-firebase}"
export ORG_GRADLE_PROJECT_reactNativeArchitectures=arm64-v8a
BUILD_ROOT="${BUILD_ROOT:-/mnt/c/i}"
ROOT="/mnt/d/app-new"
cd "$BUILD_ROOT/android"
rm -rf app/.cxx || true
chmod +x gradlew
./gradlew assembleRelease -x lint -x test
APK="$BUILD_ROOT/android/app/build/outputs/apk/release/app-release.apk"
if [[ -f "$APK" ]]; then
  cp -f "$APK" "$ROOT/IronLady-local-release.apk"
  echo "OK: $ROOT/IronLady-local-release.apk"
else
  echo "APK missing after build"
  exit 1
fi
