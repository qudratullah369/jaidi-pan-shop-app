/**
 * Firebase configuration for Jaidi Admin Panel
 *
 * SETUP:
 * 1. Go to https://console.firebase.google.com
 * 2. Create / select your project
 * 3. Project Settings → Your apps → Add Web app
 * 4. Copy the config object and paste below
 * 5. Enable Authentication → Email/Password
 * 6. Create an admin user in Authentication
 * 7. Enable Firestore Database
 *
 * Until real values are provided the panel runs in DEMO mode
 * (localStorage) and accepts any login credentials.
 */

const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'jaidi-pan-shop.firebaseapp.com',
  projectId: 'jaidi-pan-shop',
  storageBucket: 'jaidi-pan-shop.appspot.com',
  messagingSenderId: '000000000000',
  appId: '1:000000000000:web:xxxxxxxxxxxx',
};

// Detect real credentials
window.FIREBASE_CONFIGURED =
  firebaseConfig.apiKey !== 'YOUR_API_KEY' &&
  firebaseConfig.projectId !== 'jaidi-pan-shop';

window.firebaseConfig = firebaseConfig;
