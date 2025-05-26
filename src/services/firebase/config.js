// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const analytics = getAnalytics(app);