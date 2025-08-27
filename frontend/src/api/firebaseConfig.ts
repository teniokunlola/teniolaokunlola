import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

export const firebaseConfig = {
  apiKey: "AIzaSyCdc44sa8ZymgJrW6GpFzef173bwe8BFfw",
  authDomain: "teniola-site.firebaseapp.com",
  projectId: "teniola-site",
  storageBucket: "teniola-site.appspot.com",
  messagingSenderId: "1052847508101",
  appId: "1:1052847508101:web:491d83be23969e110b37ec",
  measurementId: "G-TYRDFF3WXB"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export { app };
export const auth = getAuth(app);