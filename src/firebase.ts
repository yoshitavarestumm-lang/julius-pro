import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB2OSkXGcOqrDxdFTEw17jYgh9HshcUP_I",
  authDomain: "julius-coach-pro.firebaseapp.com",
  projectId: "julius-coach-pro",
  storageBucket: "julius-coach-pro.firebasestorage.app",
  messagingSenderId: "962507798042",
  appId: "1:962507798042:web:653a1253796648cbc7c3a3"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
