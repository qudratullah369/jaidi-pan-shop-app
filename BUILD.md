# Jaidi Pan Shop – EAS Build Guide

## Prerequisites

1. Node.js 18+ and npm
2. Expo account → https://expo.dev/signup
3. EAS CLI:
   ```bash
   npm install -g eas-cli
   eas login
   ```
4. (Optional) Android Studio for local testing

## One-time setup

```bash
cd jaidi-pan-shop-app
npm install

# Link this folder to an Expo project
eas init
# → creates/updates projectId in app.json

# Or manually:
# 1. Create project at https://expo.dev
# 2. Paste the projectId into app.json → extra.eas.projectId
# 3. Set "owner" to your Expo username
```

### Firebase (recommended before production build)

1. Paste real config into `src/services/firebase.ts`
2. Paste the same config into `admin/js/firebase-config.js`
3. For Android FCM: download `google-services.json` from Firebase Console
   → Project Settings → Your apps → Android → place at project root
4. Uncomment / add in `app.json` android section:
   ```json
   "googleServicesFile": "./google-services.json"
   ```

### Replace placeholder icons

Current `assets/` files are solid red placeholders. Replace with real designs:

| File | Size | Notes |
|------|------|-------|
| `assets/icon.png` | 1024×1024 | App icon |
| `assets/adaptive-icon.png` | 1024×1024 | Android adaptive (safe zone in center) |
| `assets/splash.png` | ~1284×2778 | Splash screen |
| `assets/notification-icon.png` | 96×96 | White silhouette on transparent preferred |
| `assets/favicon.png` | 48×48 | Web |

You can use the Grok-generated “J + leaf” icon from earlier sessions.

## Build commands

### Preview APK (internal testing – easiest install)

```bash
eas build --platform android --profile preview
```

When finished, Expo gives a download URL + QR code. Install on any Android phone.

### Production APK (direct install, not for Play Store)

```bash
eas build --platform android --profile production-apk
```

### Production AAB (Google Play Store)

```bash
eas build --platform android --profile production
```

### Development client (optional)

```bash
eas build --platform android --profile development
```

## After the build

1. Download the APK/AAB from the Expo dashboard
2. For APK: transfer to phone → enable “Install unknown apps” → install
3. For AAB: upload to Google Play Console → Internal testing track first

## Submit to Play Store (optional)

```bash
# Create a service account in Google Play Console and download JSON key
# Save as google-service-account.json in project root

eas submit --platform android --profile production
```

## Production checklist

- [ ] Real Firebase config in mobile app + admin
- [ ] Firestore security rules deployed
- [ ] Cloud Function for push notifications deployed (optional but recommended)
- [ ] Real app icons & splash (not solid red placeholders)
- [ ] `projectId` and `owner` set in `app.json`
- [ ] Version bumped (`version` in app.json, `versionCode` auto-increments with production profile)
- [ ] Privacy Policy URL ready (required by Play Store)
- [ ] Tested: menu, cart/WhatsApp, loyalty, admin, offline mode
- [ ] Push notifications tested on a physical device with a production/preview build

## Versioning

- `app.json` → `version`: user-facing (e.g. `"1.0.0"`)
- Android `versionCode`: auto-incremented by EAS on production builds (`autoIncrement: true`)
- iOS `buildNumber`: manage manually or via EAS

## Troubleshooting

| Issue | Fix |
|-------|-----|
| “projectId missing” | Run `eas init` or paste ID into app.json |
| Push not received | Need physical device + preview/production build (not Expo Go alone for full FCM) |
| Icon looks wrong | Use 1024×1024 PNG, no transparency for `icon.png` |
| Build fails on credentials | Run `eas credentials` and follow prompts |
