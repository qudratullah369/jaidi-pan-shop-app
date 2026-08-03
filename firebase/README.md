# Firebase Setup for Jaidi Pan Shop

## Collections

```
Firestore
├── menu/{itemId}
│   name, desc, price, cat, available, featured, order
├── settings/shop
│   isOpen, waitMinutes, todaySpecial{name,price},
│   phone, whatsapp, address, tagline, facebook, mapsUrl
├── promotions/{promoId}
│   title, description, active
├── orders/          (future)
├── users/           (future)
└── loyalty/         (future)
```

## Connect the Admin Panel (Phase 4)

1. Create a project at https://console.firebase.google.com
2. **Authentication** → Sign-in method → enable **Email/Password**
3. Create an admin user (Authentication → Users → Add user)
4. **Firestore Database** → Create database (start in test mode, then tighten rules)
5. Open `admin/js/firebase-config.js` and paste your web app config
6. Open `src/services/firebase.ts` in the Expo app and paste the **same** config
7. Reload the Admin Panel — the badge should switch from **DEMO** to **LIVE**

### Suggested security rules (after testing)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /menu/{item} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /settings/{doc} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /promotions/{promo} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## Behaviour

- **No config** → Admin + mobile app both run in DEMO mode (local data)
- **Config present** → Admin uses Firebase Auth + Firestore; mobile app reads the same collections
- First login to Admin automatically seeds the `menu` collection and `settings/shop` document if they are empty

## End-to-end flow after connection

1. Owner opens Admin → signs in
2. Changes price / special / open status
3. Data is written to Firestore
4. Customer opens (or refreshes) the Expo app
5. `useShopData` fetches the latest menu & settings
6. Customers see the update without an app release

## Loyalty Collections (Phase 5)

```
customers/{customerId}
  name: string
  phone: string          # normalized e.g. 923001234567
  totalStamps: number
  totalOrders: number
  createdAt, updatedAt

rewards/{rewardId}
  customerId: string
  customerPhone: string
  stampsUsed: number
  rewardType: string     # e.g. "Free Meetha Pan"
  redeemedAt: timestamp

settings/loyalty         # optional
  stampsRequired: 10
  rewardLabel: "Free Meetha Pan"
```

### Rules addition

```
match /customers/{id} {
  allow read: if true;
  allow write: if request.auth != null;
}
match /rewards/{id} {
  allow read: if true;
  allow write: if request.auth != null;
}
```

## Push Notifications (Phase 6)

### Collections

```
deviceTokens/{tokenId}
  fcmToken: string       # Expo push token or FCM token
  phone: string | null   # linked after loyalty login
  platform: "android" | "ios"
  updatedAt: timestamp

notifications/{id}
  title: string
  body: string
  target: "all" | "loyalty"
  screen: string | null  # deep link screen name
  status: "queued" | "sent" | "no-tokens"
  createdAt: timestamp
  sentCount?: number
```

### Flow

1. App launches → requests permission → saves Expo push token to `deviceTokens`
2. Admin sends notification → writes doc to `notifications`
3. Cloud Function (`firebase/functions/sendNotification.js`) triggers → sends via Expo Push API
4. Customer taps notification → app opens the target screen (Menu / Rewards / etc.)

### Production requirements

- Physical device (simulator cannot receive push)
- EAS Build with a real `projectId` in app.json
- Optional: `google-services.json` for pure FCM on Android
- Deployed Cloud Function (see `firebase/functions/`)
