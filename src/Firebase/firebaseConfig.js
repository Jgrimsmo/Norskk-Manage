// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCxNbCNhBIWKtZPVv2PMUUqyI_lxVLQCwE",
  authDomain: "norskk-management.firebaseapp.com",
  projectId: "norskk-management",
  storageBucket: "norskk-management.firebasestorage.app",
  messagingSenderId: "461452601792",
  appId: "1:461452601792:web:011f0c11f329dc56054025",
  measurementId: "G-R6LTEW01PB"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
