// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBLDc1ONvZlPiv5VNWuOywWjVtihCvj-IY",
  authDomain: "batuk-ai-tutor.firebaseapp.com",
  projectId: "batuk-ai-tutor",
  storageBucket: "batuk-ai-tutor.firebasestorage.app",
  messagingSenderId: "535638637347",
  appId: "1:535638637347:web:e9e9f1ad31ee130469aa96",
  measurementId: "G-8E73SXRFG2"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db, doc, getDoc, setDoc, signOut };
