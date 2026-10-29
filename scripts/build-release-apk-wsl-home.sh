#!/usr/bin/env bash
set -euo pipefail

# Linux Node (Windows npm breaks on \\wsl$ paths during postinstall).
NODE_VER="${NODE_VER:-v22.13.1}"
NODE_DIR="$HOME/.local/node-${NODE_VER}-linux-x64"
if [[ ! -x "$NODE_DIR/bin/node" ]]; then
  echo "Installing Node $NODE_VER for WSL..."
  mkdir -p "$HOME/.local"
  TAR="node-${NODE_VER}-linux-x64.tar.xz"
  curl -fsSL "https://nodejs.org/dist/${NODE_VER}/${TAR}" \
    | tar -xJ -C "$HOME/.local"
fi
export PATH="$NODE_DIR/bin:$PATH"

# Gradle Java wrapper (Windows JDK via java.exe).
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

WIN_ROOT="/mnt/d/app-new"
BUILD_ROOT="$HOME/ironlady-apk"
SRC="$WIN_ROOT"
OUT_APK="$WIN_ROOT/IronLady-local-release.apk"

echo "Syncing project to $BUILD_ROOT ..."
mkdir -p "$BUILD_ROOT"
rsync -a --delete \
  --exclude node_modules --exclude .git --exclude .expo \
  --exclude android/app/build --exclude android/app/.cxx --exclude android/build \
  --exclude android/.gradle --exclude _tmp_* --exclude .gstack \
  "$SRC/" "$BUILD_ROOT/"

echo "npm install (Linux node $(node -v))..."
cd "$BUILD_ROOT"
rm -rf node_modules
npm install --no-audit --no-fund

echo "Gradle assembleRelease..."
cd "$BUILD_ROOT/android"
rm -rf app/.cxx || true
chmod +x gradlew
./gradlew assembleRelease -x lint -x test

APK="$BUILD_ROOT/android/app/build/outputs/apk/release/app-release.apk"
if [[ -f "$APK" ]]; then
  cp -f "$APK" "$OUT_APK"
  echo "OK: $OUT_APK"
else
  echo "APK missing after build"
  exit 1
fi
