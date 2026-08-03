/**
 * Cloud Function template – send push notifications
 *
 * HOW TO DEPLOY:
 * 1. cd firebase && firebase init functions  (if not already)
 * 2. Copy this logic into functions/index.js
 * 3. npm install firebase-admin firebase-functions
 * 4. firebase deploy --only functions
 *
 * This function triggers whenever a new document is added to
 * the `notifications` collection and sends an Expo/FCM push
 * to all registered device tokens (or loyalty-only if target=loyalty).
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');

// admin.initializeApp() is usually called once in index.js

exports.sendPushOnCreate = functions.firestore
  .document('notifications/{notifId}')
  .onCreate(async (snap, context) => {
    const data = snap.data();
    const { title, body, target, screen } = data;

    // Load device tokens
    const tokensSnap = await admin.firestore().collection('deviceTokens').get();
    let tokens = tokensSnap.docs.map((d) => d.data());

    // Optional: filter to loyalty members only
    if (target === 'loyalty') {
      const customersSnap = await admin.firestore().collection('customers').get();
      const loyaltyPhones = new Set(
        customersSnap.docs.map((d) => d.data().phone).filter(Boolean)
      );
      tokens = tokens.filter((t) => t.phone && loyaltyPhones.has(t.phone));
    }

    const expoTokens = tokens
      .map((t) => t.fcmToken)
      .filter((t) => t && t.startsWith('ExponentPushToken'));

    if (expoTokens.length === 0) {
      await snap.ref.update({ status: 'no-tokens' });
      return null;
    }

    // Expo Push API (works for Expo tokens)
    // For pure FCM tokens use admin.messaging().sendEachForMulticast(...)
    const messages = expoTokens.map((to) => ({
      to,
      sound: 'default',
      title,
      body,
      data: screen ? { screen } : {},
    }));

    // Batch in chunks of 100
    const chunkSize = 100;
    let success = 0;
    for (let i = 0; i < messages.length; i += chunkSize) {
      const chunk = messages.slice(i, i + chunkSize);
      const res = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-Encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(chunk),
      });
      const json = await res.json();
      success += (json.data || []).filter((r) => r.status === 'ok').length;
    }

    await snap.ref.update({
      status: 'sent',
      sentCount: success,
      totalTargets: expoTokens.length,
    });

    return null;
  });
