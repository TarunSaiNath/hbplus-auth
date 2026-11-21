import AsyncStorage from "@react-native-async-storage/async-storage";
import { getApp, getApps, initializeApp } from "firebase/app";
import * as FirebaseAuth from "firebase/auth";
import { initializeFirestore } from "firebase/firestore";

// getReactNativePersistence exists in the React Native build of firebase/auth
// but is missing from its typings, so we read it through an `any` cast.
const { initializeAuth, getAuth, getReactNativePersistence } =
  FirebaseAuth as any;

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const isFirstInit = getApps().length === 0;
const app = isFirstInit ? initializeApp(firebaseConfig) : getApp();

// Phones have no browser storage, so Firebase saves the login in AsyncStorage
export const auth: FirebaseAuth.Auth = isFirstInit
  ? initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    })
  : getAuth(app);

// Same database setup as src/config/firebase.ts
export const db = initializeFirestore(
  app,
  { experimentalAutoDetectLongPolling: true },
  "default",
);

export { app };
