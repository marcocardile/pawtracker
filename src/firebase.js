// Import Firebase SDKs necessari
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

// Configurazione Firebase
const firebaseConfig = {
  apiKey: "AIzaSyC4N2KPCbl163tDv9wUF3xWDl1g3I36Nt0",
  authDomain: "pawtracker-91924.firebaseapp.com",
  projectId: "pawtracker-91924",
  storageBucket: "pawtracker-91924.appspot.com",
  messagingSenderId: "809681347512",
  appId: "1:809681347512:web:3c0284634b2d915394654d",
  measurementId: "G-VZS2BVYLZQ" // Analytics (opzionale)
};

// Inizializza Firebase
const app = initializeApp(firebaseConfig);

// Esporta i servizi utilizzabili nell'app
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Inizializza Firebase Analytics solo se disponibile
export const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;

export default app;
