import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";

import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import {
  getDatabase,
  ref,
  push,
  set,
  update,
  remove,
  onValue
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js";


const firebaseConfig = {

  apiKey:
    "AIzaSyDl9m6icGPQ_vPh030_-vwBrYFL9sV1jZ8",

  authDomain:
    "support-pwa.firebaseapp.com",

  databaseURL:
    "https://support-pwa-default-rtdb.asia-southeast1.firebasedatabase.app",

  projectId:
    "support-pwa",

  storageBucket:
    "support-pwa.firebasestorage.app",

  messagingSenderId:
    "1036053746669",

  appId:
    "1:1036053746669:web:952df405b937cefe6d8de4"
};


export const app =
  initializeApp(firebaseConfig);

export const auth =
  getAuth(app);

export const db =
  getDatabase(app);


/* AUTH GUARD */

export function requireAdmin() {

  onAuthStateChanged(
    auth,
    user => {

      if (!user) {

        location.replace(
          "./login.html"
        );

        return;
      }


      const adminEmail =
        document
          .getElementById(
            "adminEmail"
          );


      if (adminEmail) {

        adminEmail.textContent =
          user.email || "Admin";

      }

    }
  );

}


/* LOGOUT */

export function setupLogout() {

  const logout =
    document
      .getElementById("logoutBtn");


  if (!logout) {
    return;
  }


  logout.addEventListener(
    "click",
    async () => {

      await signOut(auth);

      location.replace(
        "./login.html"
      );

    }
  );

}


/* SAFE */

export function safe(value = "") {

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


/* FIREBASE EXPORTS */

export {
  ref,
  push,
  set,
  update,
  remove,
  onValue
};
