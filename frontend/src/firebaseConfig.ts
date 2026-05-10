// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
import { getFirestore } from "firebase/firestore";
const firebaseConfig = {
  apiKey: "AIzaSyA1qMWwmAME8eVoCSfrFKEjSbLn7QP4IHM",
  authDomain: "attendify-7463d.firebaseapp.com",
  databaseURL: "https://attendify-7463d-default-rtdb.firebaseio.com",
  projectId: "attendify-7463d",
  storageBucket: "attendify-7463d.firebasestorage.app",
  messagingSenderId: "388186950144",
  appId: "1:388186950144:web:a96a75168820410308a6e5",
  measurementId: "G-L2YNLCFEG5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);


export const db = getFirestore(app);
