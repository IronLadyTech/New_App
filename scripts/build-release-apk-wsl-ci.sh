#!/usr/bin/env bash
# Gradle release APK using C:\i (Windows npm ci already done). Linux Node for autolinking only.
set -euo pipefail

NODE_VER="${NODE_VER:-v22.13.1}"
NODE_DIR="$HOME/.local/node-${NODE_VER}-linux-x64"
if [[ ! -x "$NODE_DIR/bin/node" ]]; then
  mkdir -p "$HOME/.local"
  TAR="node-${NODE_VER}-linux-x64.tar.xz"
  curl -fsSL "https://nodejs.org/dist/${NODE_VER}/${TAR}" | tar -xJ -C "$HOME/.local"
fi
export PATH="$NODE_DIR/bin:$PATH"

JDK_WRAP="$HOME/.ironlady-jdk"
mkdir -p "$JDK_WRAP/bin"
if [[ ! -x "$JDK_WRAP/bin/java" ]]; then
  cat > "$JDK_WRAP/bin/java" <<'EOF'
#!/usr/bin/env bash
exec "/mnt/c/Program Files/Microsoft/jdk-21.0.12.8-hotspot/bin/java.exe" "$@"
EOF
  chmod +x "$JDK_WRAP/bin/java"
fi
export JAVA_HOME="$JDK_WRAP"
export PATH="$JAVA_HOME/bin:$PATH"

export ANDROID_HOME="/mnt/c/Users/Magvig/AppData/Local/Android/Sdk"
export ANDROID_SDK_ROOT="$ANDROID_HOME"
export EXPO_PUBLIC_PHONE_OTP="${EXPO_PUBLIC_PHONE_OTP:-firebase}"
export ORG_GRADLE_PROJECT_reactNativeArchitectures=arm64-v8a

BUILD_ROOT="/mnt/c/i"
WIN_OUT="/mnt/d/app-new/IronLady-local-release.apk"

cd "$BUILD_ROOT/android"
rm -rf app/.cxx || true
chmod +x gradlew
./gradlew assembleRelease -x lint -x test

APK="$BUILD_ROOT/android/app/build/outputs/apk/release/app-release.apk"
if [[ -f "$APK" ]]; then
  cp -f "$APK" "$WIN_OUT"
  echo "OK: $WIN_OUT"
else
  echo "APK missing"
  exit 1
fi
