// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyABGeuVcTZmb43qbVCid0f5SGGC4qwVIRI",
  authDomain: "poppy-store-89f48.firebaseapp.com",
  projectId: "poppy-store-89f48",
  storageBucket: "poppy-store-89f48.appspot.com",
  messagingSenderId: "742092357126",
  appId: "1:742092357126:web:3bf4ba4d5b4a8620d74d87",
  measurementId: "G-MN1S52MWJS",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const storage = getStorage(app);

export { storage };
