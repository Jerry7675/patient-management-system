import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAIqBEJKoAplcz2g_sfshumGZqWtOCDwCA",
  authDomain: "patient-management-syatem.firebaseapp.com",
  databaseURL: "https://patient-management-syatem-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "patient-management-syatem",
  storageBucket: "patient-management-syatem.firebasestorage.app",
  messagingSenderId: "89456362335",
  appId: "1:89456362335:web:4e586969fd5847989fecea",
  measurementId: "G-M4PLVXBDYY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);