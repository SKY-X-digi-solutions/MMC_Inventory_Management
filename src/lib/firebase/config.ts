import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAnHKW8C0WDtVPMRdN1OwtE470nI_3jLqA",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "maruthimotorsyamaha-15414.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "maruthimotorsyamaha-15414",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "maruthimotorsyamaha-15414.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "135354775102",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:135354775102:web:b7247636807a5bbaeec36f",
  measurementId: process.env.NEXT_PUBLIC_MeasurementId || "G-7W7SDLFRFG",
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(
  app,
  process.env.NEXT_PUBLIC_FIREBASE_DATABASE_ID || "tests"
);
export const storage = getStorage(app);

export default app;

