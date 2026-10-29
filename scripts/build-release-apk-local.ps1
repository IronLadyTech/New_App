# Local release APK via C:\i (short path). Requires Windows long paths OR succeeds when CMake paths fit.
$ErrorActionPreference = 'Stop'
. "$PSScriptRoot\android-build-env.ps1"

function Remove-TreeForce([string]$Path) {
  if (-not (Test-Path -LiteralPath $Path)) { return }
  $empty = Join-Path $env:TEMP ("empty_" + [guid]::NewGuid().ToString('N'))
  New-Item -ItemType Directory -Force -Path $empty | Out-Null
  cmd /c "robocopy `"$empty`" `"$Path`" /MIR /R:0 /W:0 /NFL /NDL /NJH /NJS" | Out-Null
  Remove-Item -LiteralPath $empty -Force -ErrorAction SilentlyContinue
  cmd /c "rmdir /s /q `"\\?\$((Resolve-Path -LiteralPath $Path).Path)`"" 2>$null
}

$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
& node (Join-Path $root 'scripts\verify-notification-android.js') | Out-Null

$buildRoot = 'C:\i'
$env:EXPO_PUBLIC_PHONE_OTP = if ($env:EXPO_PUBLIC_PHONE_OTP) { $env:EXPO_PUBLIC_PHONE_OTP } else { 'firebase' }
$env:ORG_GRADLE_PROJECT_reactNativeArchitectures = 'arm64-v8a'

Write-Host "Syncing to $buildRoot ..."
$exclude = @(
  '.git', '.expo', 'node_modules', 'android\app\build', 'android\app\.cxx', 'android\build',
  'android\.gradle', '_tmp_*', '.gstack', 'dist', 'web-build'
)
$xd = ($exclude | ForEach-Object { "/XD"; $_ }) -join ' '
cmd /c "robocopy `"$root`" `"$buildRoot`" /MIR $xd /NFL /NDL /NJH /NJS /NC /NS /NP" | Out-Null
if ($LASTEXITCODE -ge 8) { throw "robocopy failed $LASTEXITCODE" }

Write-Host "npm ci in $buildRoot (fresh node_modules on short path)..."
Set-Location $buildRoot
& npm ci --no-audit --no-fund
if ($LASTEXITCODE -ne 0) { throw "npm ci failed $LASTEXITCODE" }

Remove-TreeForce (Join-Path $buildRoot 'android\app\.cxx')

Set-Location (Join-Path $buildRoot 'android')
Write-Host "Gradle assembleRelease from $buildRoot\android ..."
& .\gradlew.bat assembleRelease -x lint -x test
$apk = Join-Path $buildRoot 'android\app\build\outputs\apk\release\app-release.apk'
if (Test-Path $apk) {
  Copy-Item $apk (Join-Path $root 'IronLady-local-release.apk') -Force
  Write-Host "OK: $root\IronLady-local-release.apk"
  exit 0
}
Write-Host "Build failed. Enable long paths (Admin + reboot), then retry:"
Write-Host '  Set-ItemProperty HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem LongPathsEnabled -Type DWord -Value 1'
exit 1
