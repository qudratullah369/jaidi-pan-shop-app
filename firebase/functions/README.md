# Cloud Function – Send Push Notifications

The Admin Panel writes a document to the `notifications` collection.
This Cloud Function picks it up and delivers the push via Expo Push API
(or Firebase Admin Messaging for pure FCM tokens).

## Deploy

```bash
# From project root (requires Firebase CLI)
firebase login
firebase init functions   # if first time
# Copy sendNotification.js logic into functions/index.js
cd functions && npm install firebase-admin firebase-functions
firebase deploy --only functions
```

## Collections used

- `notifications/{id}` – written by Admin, read by this function
- `deviceTokens/{id}` – written by the mobile app on launch
- `customers/{id}` – used when target = "loyalty"
