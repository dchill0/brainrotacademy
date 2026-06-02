import { initializeApp } from "firebase/app";

import {
  getAuth,
  GoogleAuthProvider
} from "firebase/auth";

import {
  getFirestore
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCEQOI1FzocAfHxy70kiGyfT7mKySu5AVI",
  authDomain: "brainrotacademy-8d820.firebaseapp.com",
  projectId: "brainrotacademy-8d820",
  storageBucket: "brainrotacademy-8d820.firebasestorage.app",
  messagingSenderId: "787416352737",
  appId: "1:787416352737:web:d83a3e246d9f3e4d47f4a0",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const db = getFirestore(app);