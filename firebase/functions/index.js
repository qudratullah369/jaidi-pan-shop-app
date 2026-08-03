/**
 * Jaidi Pan Shop – Cloud Functions
 *
 * Deploy:
 *   cd firebase/functions && npm install
 *   firebase deploy --only functions
 *
 * Requires Firebase CLI and a project with Blaze plan for outbound HTTP (Expo push).
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

/**
 * When Admin creates a notifications/{id} document, send Expo push messages
 * to registered device tokens.
 */
exports.sendPushOnCreate = functions.firestore
  .document('notifications/{notifId}')
  .onCreate(async (snap) => {
    const data = snap.data() || {};
    const title = data.title || 'Jaidi Pan Shop';
    const body = data.body || '';
    const target = data.target || 'all';
    const screen = data.screen || null;

    const db = admin.firestore();
    const tokensSnap = await db.collection('deviceTokens').get();
    let tokenDocs = tokensSnap.docs.map((d) => d.data());

    if (target === 'loyalty') {
      const customersSnap = await db.collection('customers').get();
      const loyaltyPhones = new Set(
        customersSnap.docs.map((d) => d.data().phone).filter(Boolean)
      );
      tokenDocs = tokenDocs.filter((t) => t.phone && loyaltyPhones.has(t.phone));
    }

    const expoTokens = tokenDocs
      .map((t) => t.fcmToken)
      .filter((t) => typeof t === 'string' && t.startsWith('ExponentPushToken'));

    if (expoTokens.length === 0) {
      await snap.ref.update({
        status: 'no-tokens',
        sentCount: 0,
        totalTargets: 0,
      });
      return null;
    }

    const messages = expoTokens.map((to) => ({
      to,
      sound: 'default',
      title,
      body,
      data: screen ? { screen } : {},
    }));

    let success = 0;
    const chunkSize = 100;
    for (let i = 0; i < messages.length; i += chunkSize) {
      const chunk = messages.slice(i, i + chunkSize);
      try {
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
      } catch (err) {
        functions.logger.error('Expo push failed', err);
      }
    }

    // Admin SDK bypasses security rules
    await snap.ref.update({
      status: 'sent',
      sentCount: success,
      totalTargets: expoTokens.length,
    });

    return null;
  });
