

import {
  initializeApp,
  getApps,
  getApp
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";

import {
  getAuth
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import {
  getDatabase
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js";
const firebaseConfig = {
  apiKey:"API_MAIN_CS",
  authDomain:"support-pwa.firebaseapp.com",
  databaseURL:"https://support-pwa-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId:"support-pwa",
  storageBucket:"support-pwa.firebasestorage.app",
  messagingSenderId:"1036053746669",
  appId: "1:1036053746669:web:952df405b937cefe6d8de4"
};

export const app =
  getApps().length
    ? getApp()
    : initializeApp(firebaseConfig);


export const auth =
  getAuth(app);


export const db =
  getDatabase(app);
