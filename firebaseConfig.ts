// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBppawrVg0nqStBmGOQEHUI0ZwrCQPMjQw",
  authDomain: "kharcha-402d5.firebaseapp.com",
  projectId: "kharcha-402d5",
  storageBucket: "kharcha-402d5.firebasestorage.app",
  messagingSenderId: "559995030088",
  appId: "1:559995030088:web:cd7ff9ba6129601e73667d",
  measurementId: "G-1WFVEDZF4F" // You can leave this here but it's not used
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Export 'auth' so you can use it in other parts of your app
export { app, auth };

