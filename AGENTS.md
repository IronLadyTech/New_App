# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.

# Shipping changes to phones

Installed APKs (version 1.1.0+) receive JavaScript updates over the air (EAS Update, channel
`preview`). Decide which path a change needs **before** building anything.

## 1. JavaScript / asset change → over-the-air update (~2 min, no APK)

Screens, components, hooks, utils, services, text, images, styles — anything under the JS bundle.

```
npm run ota -- "short description of the change"
```

- Phones download it on next open and apply it behind the splash (or on next return to the app).
- Check on the phone: Profile → bottom line shows `update xxxxxxxx` — compare with the
  "Android update ID" the command prints.
- Before publishing, bundle once to catch errors:
  `npx expo export --platform android --output-dir <temp folder>`
- `scripts/ota.js` sets `EXPO_PUBLIC_PHONE_OTP=firebase`; never publish with plain `eas update`
  (it would switch login back to demo codes).

## 2. Native change → new APK (~20 min)

A new or upgraded native package (`expo-*`, `react-native-*` with Android code), a permission,
anything in `android/`, `app.json` plugins, or an Expo SDK upgrade.

1. Bump the runtime version in **both** places, same value (e.g. `1.1.0` → `1.2.0`):
   - `app.json` → `expo.version` and `expo.runtimeVersion` (a literal string — this is a bare
     project, runtime version *policies* are rejected by EAS Update)
   - `android/app/src/main/res/values/strings.xml` → `expo_runtime_version`
   - also `versionCode` +1 in `app.json` and `android/app/build.gradle` (and `versionName`)
2. `npm run build:apk:fast` → `D:\app-new\IronLady-local-release.apk`
3. Send that APK to testers (Drive link). Old APKs never receive JS built for the new runtime.

Never edit `android/` with `expo prebuild` — native files are maintained by hand here.

## Rules

- Never commit `.env`, `*.apk`, or `dist/`.
- Animations: Reanimated shared values / worklets on the UI thread, never React state per frame.
- Login: Firebase SMS only proves the phone number; learners then sign in with the account token
  from `resolvePhoneAccess` (see `screens/auth/VerifyOtpScreen.js`). Signing in with the phone
  credential alone creates an empty phone-only account.
