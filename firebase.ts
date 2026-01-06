
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDf7ELRI1NWXEQwSHGz-_6DmFjYkSfxZkc",
  authDomain: "devtonic-safety-manager.firebaseapp.com",
  projectId: "devtonic-safety-manager",
  storageBucket: "devtonic-safety-manager.firebasestorage.app",
  messagingSenderId: "874198473298",
  appId: "1:874198473298:web:b362b1fa6672753b179d8b",
  measurementId: "G-FEQDLCWY2Q"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
