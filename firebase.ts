
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCXPs9jhyobUz1RFF0TV8M42PEmFDBpwVE",
  authDomain: "gzi-sbo-app.firebaseapp.com",
  projectId: "gzi-sbo-app",
  storageBucket: "gzi-sbo-app.firebasestorage.app",
  messagingSenderId: "166879604426",
  appId: "1:166879604426:web:31cdd866205a4630578e33",
  measurementId: "G-X8D67LFNKW"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
