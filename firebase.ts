
import { initializeApp, getApp, getApps, FirebaseApp } from "firebase/app";
import { getDatabase, Database, ref, set } from "firebase/database";
import { getStorage, FirebaseStorage } from "firebase/storage";

/**
 * Helper to safely access environment variables from either import.meta.env (Vite) 
 * or process.env (Node/Sandbox environments).
 */
const getEnv = (key: string): string | undefined => {
  try {
    const metaEnv = (import.meta as any).env;
    if (metaEnv && metaEnv[key]) return metaEnv[key];
  } catch (e) {}

  try {
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return process.env[key];
    }
  } catch (e) {}

  return undefined;
};

const firebaseConfig = {
  apiKey: getEnv('VITE_FIREBASE_API_KEY'),
  authDomain: getEnv('VITE_FIREBASE_AUTH_DOMAIN'),
  databaseURL: getEnv('VITE_FIREBASE_DATABASE_URL'),
  projectId: getEnv('VITE_FIREBASE_PROJECT_ID'),
  storageBucket: getEnv('VITE_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: getEnv('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: getEnv('VITE_FIREBASE_APP_ID'),
};

function hasFirebaseEnv(): boolean {
  return Boolean(
    firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.databaseURL &&
    firebaseConfig.projectId &&
    firebaseConfig.storageBucket &&
    firebaseConfig.messagingSenderId &&
    firebaseConfig.appId
  );
}

let db: Database | null = null;
let storage: FirebaseStorage | null = null;

if (hasFirebaseEnv()) {
  try {
    const app: FirebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    db = getDatabase(app);
    storage = getStorage(app);
    console.info("Firebase initialized successfully for project:", firebaseConfig.projectId);
  } catch (error) {
    console.error("Firebase initialization failed:", error);
  }
} else {
  console.info("Firebase env vars are not set in this environment. Running in local-only mode.");
}

/**
 * Diagnostic tool to verify Realtime Database write permissions.
 * Results appear in the 'connection_test' node of your Firebase console.
 */
export async function testFirebaseConnection(): Promise<{ success: boolean; message: string }> {
  if (!db) return { success: false, message: "Firebase is not initialized (missing env vars)." };
  
  try {
    const testRef = ref(db, 'connection_test/ping');
    await set(testRef, {
      timestamp: Date.now(),
      status: 'online',
      environment: window.location.hostname
    });
    return { success: true, message: "Successfully wrote to Firebase! Check your 'Data' tab." };
  } catch (error: any) {
    console.error("Firebase Test Error:", error);
    return { 
      success: false, 
      message: error.message || "Permission denied. Check your Firebase Security Rules (allow read, write: if true)." 
    };
  }
}

export { db, storage };
