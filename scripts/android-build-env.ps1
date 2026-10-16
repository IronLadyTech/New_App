# Source before npm run android (or run migrate-android-to-d.ps1 once):
#   . .\scripts\android-build-env.ps1
$androidRoot = "D:\Android"
$env:ANDROID_AVD_HOME = "$androidRoot\avd"
$env:GRADLE_USER_HOME = "$androidRoot\.gradle"
$env:ANDROID_USER_HOME = $androidRoot
$env:TEMP = "$androidRoot\temp"
$env:TMP = "$androidRoot\temp"
if (Test-Path "$androidRoot\Sdk\platform-tools") {
  $env:ANDROID_HOME = "$androidRoot\Sdk"
  $env:ANDROID_SDK_ROOT = "$androidRoot\Sdk"
}
New-Item -ItemType Directory -Force -Path $env:GRADLE_USER_HOME, $env:ANDROID_AVD_HOME, $env:TEMP | Out-Null
Write-Host "GRADLE_USER_HOME=$env:GRADLE_USER_HOME"
Write-Host "ANDROID_AVD_HOME=$env:ANDROID_AVD_HOME"
if ($env:ANDROID_HOME) { Write-Host "ANDROID_HOME=$env:ANDROID_HOME" }
