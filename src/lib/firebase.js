import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: "chatapp2-60cfa.firebaseapp.com",
  projectId: "chatapp2-60cfa",
  storageBucket: "chatapp2-60cfa.appspot.com",
  messagingSenderId: "477074906601",
  appId: "1:477074906601:web:fbad86070ed139b8e73f78"
};
 

const app = initializeApp(firebaseConfig);

export const auth = getAuth();
export const db = getFirestore();
export const storage = getStorage();