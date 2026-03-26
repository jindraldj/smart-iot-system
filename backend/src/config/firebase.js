// -------------------------------------------------
// firebase.js
// Firebase Admin SDK configuration
// -------------------------------------------------
const admin = require('firebase-admin');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Firebase service account configuration
// You need to set these environment variables:
// - FIREBASE_PROJECT_ID: Your Firebase project ID
// - FIREBASE_CLIENT_EMAIL: Service account client email
// - FIREBASE_PRIVATE_KEY: Service account private key
// - FIREBASE_DATABASE_URL: Firebase Realtime Database URL (optional)

const serviceAccount = {
  project_id: process.env.FIREBASE_PROJECT_ID,
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

// Initialize Firebase Admin SDK
let firebaseApp;
let db;
let realtimeDB;

try {
  if (serviceAccount.project_id && serviceAccount.client_email && serviceAccount.private_key) {
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.FIREBASE_DATABASE_URL,
    });
    
    db = admin.firestore();
    realtimeDB = admin.database();
    
    console.log('✅ Firebase Admin SDK initialized successfully');
  } else {
    console.warn('⚠️  Firebase credentials not found in environment variables');
    console.warn('   Please set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY');
  }
} catch (error) {
  console.error('❌ Failed to initialize Firebase:', error.message);
}

module.exports = {
  firebaseApp,
  admin,
  db,
  realtimeDB,
  isInitialized: !!firebaseApp,
};
