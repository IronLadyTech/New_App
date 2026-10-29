# Waits for an authorized USB device, then runs expo on that phone (arm64 debug).
$ErrorActionPreference = 'Stop'
. "$PSScriptRoot\android-build-env.ps1"

$adb = if ($env:ANDROID_HOME) { Join-Path $env:ANDROID_HOME 'platform-tools\adb.exe' } else { Join-Path $env:LOCALAPPDATA 'Android\Sdk\platform-tools\adb.exe' }
if (-not (Test-Path $adb)) {
  Write-Host "adb not found. Install Android SDK platform-tools."
  exit 1
}

& $adb kill-server | Out-Null
Start-Sleep -Seconds 1
& $adb start-server | Out-Null

Write-Host ""
Write-Host "On your phone: USB -> File transfer (not tethering), USB debugging ON, allow this PC."
Write-Host "Waiting for device (Ctrl+C to cancel)..."
Write-Host ""

& $adb wait-for-device
$deadline = (Get-Date).AddMinutes(2)
while ((Get-Date) -lt $deadline) {
  $state = & $adb get-state 2>$null
  if ($state -eq 'device') { break }
  if ($state -eq 'unauthorized') {
    Write-Host "Phone connected but UNAUTHORIZED — unlock phone and tap Allow on the USB debugging prompt."
  }
  Start-Sleep -Seconds 2
}

$id = (& $adb devices | Select-String '^\S+\s+device$' | ForEach-Object { ($_ -split '\s+')[0] } | Select-Object -First 1)
if (-not $id) {
  Write-Host "Still no authorized device. Run: adb devices"
  exit 1
}

Write-Host "Using device $id"
$env:ORG_GRADLE_PROJECT_reactNativeArchitectures = 'arm64-v8a'
Set-Location (Join-Path $PSScriptRoot '..')
npx expo run:android -d $id
