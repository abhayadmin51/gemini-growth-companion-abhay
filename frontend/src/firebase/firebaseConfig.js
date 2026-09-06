import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDZ6gVAztw9VBT-w-OhLtK5bvm3ypMjYs4",
  authDomain: "gemini-growth-companion-abhay.firebaseapp.com",
  projectId: "gemini-growth-companion-abhay",
  storageBucket: "gemini-growth-companion-abhay.firebasestorage.app",
  messagingSenderId: "99085792761",
  appId: "1:99085792761:web:c26df523cef1de791d7928"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);