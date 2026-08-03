# Jaidi Pan Shop — Complete Project (v1.0.1)

Customer **Expo React Native** app + **Web Admin Panel** + **Firebase** backend for Jaidi Pan Shop (F-10 Markaz, Islamabad).

**Version:** 1.0.1 (Production Hardening)  
**Brand:** Red `#E8372A` · Green `#2D7D32`  
**WhatsApp orders:** 0322-0971060

---

## What's included

| Area | Contents |
|------|----------|
| Mobile app | Home, Menu, Cart (WhatsApp checkout), Rewards (loyalty), Contact |
| Admin | Menu CRUD, shop settings, promos, loyalty stamps, send notifications |
| Firebase | Auth (admin), Firestore schema, security rules, indexes, push Cloud Function |
| Build | EAS profiles (preview APK, production AAB) |
| Quality | Jest unit tests, DEMO offline fallback |

---

## Project structure

```
jaidi-pan-shop-app/
├── App.tsx
├── app.json
├── eas.json
├── package.json
├── babel.config.js
├── tsconfig.json
├── firebase.json
├── firestore.rules
├── firestore.indexes.json
├── BUILD.md
├── PRIVACY.md
├── CHANGELOG.md
├── README.md
├── admin/
│   ├── index.html
│   ├── css/admin.css
│   └── js/
│       ├── admin.js
│       └── firebase-config.js
├── assets/
├── firebase/
│   ├── README.md
│   ├── firestore.rules
│   ├── firestore.indexes.json
│   └── functions/
│       ├── index.js
│       ├── package.json
│       ├── sendNotification.js
│       └── README.md
└── src/
    ├── __tests__/
    ├── data/
    ├── hooks/
    ├── navigation/
    ├── screens/
    ├── services/
    ├── types/
    └── utils/
```

---

## 1. Installation

```bash
cd jaidi-pan-shop-app
npm install
```

Requirements: Node.js 18+, npm. For device builds: Expo account + EAS CLI.

```bash
npm install -g eas-cli
eas login
```

---

## 2. Run the mobile app (local)

```bash
npx expo start
```

Scan QR with Expo Go, or press `a` for Android emulator.

Until Firebase is configured, the app runs in **DEMO mode** (local menu + AsyncStorage).

---

## 3. Firebase setup

1. Create a project at https://console.firebase.google.com
2. Enable Authentication → Email/Password
3. Create an admin user
4. Create Firestore database
5. Paste web config into:
   - `src/services/firebase.ts`
   - `admin/js/firebase-config.js`
6. Deploy:

```bash
npm install -g firebase-tools
firebase login
firebase use <your-project-id>
firebase deploy --only firestore:rules,firestore:indexes
cd firebase/functions && npm install && cd ../..
firebase deploy --only functions
```

See `firebase/README.md` for schemas and rules.

---

## 4. Admin Panel setup

1. Open `admin/index.html` in a browser (or host the `admin/` folder).
2. DEMO mode: any email/password; data in localStorage.
3. LIVE mode: sign in with the Firebase Email/Password admin user.
4. Tabs: Dashboard, Menu, Settings, Promos, Loyalty, Notify.

---

## 5. Cloud Functions (push)

Admin writes to `notifications/{id}`. Function `sendPushOnCreate` sends Expo pushes to `deviceTokens`.

```bash
cd firebase/functions
npm install
cd ../..
firebase deploy --only functions
```

Requires Blaze plan for outbound HTTPS to Expo push API.

---

## 6. EAS Build

See **BUILD.md** for full details.

```bash
eas init
eas build --platform android --profile preview
eas build --platform android --profile production
```

Replace placeholder assets in `assets/` before store submission.

---

## 7. Testing

```bash
npm test
```

Jest covers phone normalization and cart math.

Manual Preview APK checklist: menu → cart → WhatsApp; loyalty stamps; admin special; notifications; offline/DEMO.

---

## 8. Production pilot checklist

- [ ] Real Firebase config (app + admin)
- [ ] Deploy rules, indexes, functions
- [ ] Real icons / splash
- [ ] Preview APK on a physical phone
- [ ] Host PRIVACY.md at a public URL (Play Store)
- [ ] Do not rely on DEMO admin login in production

---

## Shop details

- Address: Near Maroof Hospital, F-10 Markaz, Islamabad
- Phone / WhatsApp: 0322-0971060
- Facebook: facebook.com/Jaidi.islamabad

---

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for v1.0.1 hardening notes.
