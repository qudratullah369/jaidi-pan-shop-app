/**
 * Firebase configuration for Jaidi Pan Shop
 *
 * HOW TO CONNECT A REAL PROJECT:
 * 1. Go to https://console.firebase.google.com
 * 2. Create a project (or use existing)
 * 3. Add a Web app → copy the config object
 * 4. Replace the placeholder values below
 * 5. Enable Firestore Database (start in test mode or set rules)
 * 6. Create the collections described in firebase/README.md
 *
 * Until real credentials are added the app runs in DEMO MODE
 * and uses the local menu data as fallback.
 */

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
// import { getAuth } from 'firebase/auth';           // for future auth
// import { getMessaging } from 'firebase/messaging'; // for push later

const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'jaidi-pan-shop.firebaseapp.com',
  projectId: 'jaidi-pan-shop',
  storageBucket: 'jaidi-pan-shop.appspot.com',
  messagingSenderId: '000000000000',
  appId: '1:000000000000:web:xxxxxxxxxxxx',
};

// Detect whether real credentials have been provided
export const isFirebaseConfigured =
  firebaseConfig.apiKey !== 'YOUR_API_KEY' &&
  firebaseConfig.projectId !== 'jaidi-pan-shop';

let app: FirebaseApp | null = null;
let db: Firestore | null = null;

if (isFirebaseConfigured) {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  db = getFirestore(app);
} else {
  console.log(
    '[Jaidi] Firebase not configured – running in DEMO mode with local data.'
  );
}

export { app, db };
export default app;
