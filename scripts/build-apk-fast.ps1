# Release APK in ~20 min (incremental): build in a short-path copy at C:\i so Windows CMake
# paths stay short, keep its node_modules and native build outputs between runs.
#   npm run build:apk:fast            → D:\app-new\IronLady-local-release.apk
# First run on a new machine: the C:\i copy needs node_modules (step 1 copies them).
$ErrorActionPreference = 'Stop'
$root = 'D:\app-new'
. "$root\scripts\android-build-env.ps1"
$buildRoot = 'C:\i'
$env:EXPO_PUBLIC_PHONE_OTP = 'firebase'
$env:ORG_GRADLE_PROJECT_reactNativeArchitectures = 'arm64-v8a'

Write-Host "[1/4] Sync source to $buildRoot (node_modules and build outputs kept)"
$exclude = @('.git', '.expo', 'node_modules', 'android\app\build', 'android\app\.cxx', 'android\build', 'android\.gradle', '_tmp_*', '.gstack', 'dist', 'web-build', '_pre_pull_backup')
$xd = ($exclude | ForEach-Object { "/XD"; $_ }) -join ' '
cmd /c "robocopy `"$root`" `"$buildRoot`" /MIR $xd /XF *.apk *.log /NFL /NDL /NJH /NJS /NC /NS /NP" | Out-Null
if ($LASTEXITCODE -ge 8) { throw "robocopy failed $LASTEXITCODE" }

Write-Host "[2/4] Sync new/changed packages into $buildRoot\node_modules"
# Packages added since the last build (e.g. a new expo-* module) must reach the copy, including
# their plugin/build folders. Only each package's own android\build and android\.cxx are skipped.
$skip = @()
foreach ($dir in Get-ChildItem "$root\node_modules" -Directory) {
  foreach ($sub in 'android\build', 'android\.cxx') {
    $p = Join-Path $dir.FullName $sub
    if (Test-Path $p) { $skip += $p }
  }
}
$rc = @("$root\node_modules", "$buildRoot\node_modules", '/E', '/XO', '/NFL', '/NDL', '/NJH', '/NJS', '/NP')
if ($skip.Count) { $rc += '/XD'; $rc += $skip }
& robocopy @rc | Out-Null
if ($LASTEXITCODE -ge 8) { throw "node_modules sync failed $LASTEXITCODE" }

Write-Host "[3/4] Short-path CMake settings (C:\i copy only)"
Add-Content -Path (Join-Path $buildRoot 'android\app\build.gradle') -Value @"

// --- added for the local Windows build only (C:\i copy) ---
android {
    defaultConfig {
        externalNativeBuild {
            cmake {
                arguments "-DCMAKE_OBJECT_PATH_MAX=128"
            }
        }
    }
    externalNativeBuild {
        cmake {
            buildStagingDirectory "C:/x"
        }
    }
}
"@

Write-Host "[4/4] Gradle assembleRelease"
Set-Location (Join-Path $buildRoot 'android')
& .\gradlew.bat assembleRelease -x lint -x test
$apk = Join-Path $buildRoot 'android\app\build\outputs\apk\release\app-release.apk'
if ($LASTEXITCODE -eq 0 -and (Test-Path $apk)) {
  Copy-Item $apk "$root\IronLady-local-release.apk" -Force
  Write-Host "APK_OK $root\IronLady-local-release.apk"
  exit 0
}
Write-Host "APK_FAILED"
exit 1
