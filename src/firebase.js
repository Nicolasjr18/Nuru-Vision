import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC5N4or0M7tM8aNDeZEY6l3LhpoQBzppxQ",
  authDomain: "nuru-vision-col.firebaseapp.com",
  projectId: "nuru-vision-col",
  storageBucket: "nuru-vision-col.firebasestorage.app",
  messagingSenderId: "564122915516",
  appId: "1:564122915516:web:257e1381ee84d9364376b9"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
