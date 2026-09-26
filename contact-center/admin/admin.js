import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";

import {
  getAuth,
  onAuthStateChanged,
  signOut,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import {
  getDatabase,
  ref,
  push,
  set,
  update,
  remove,
  onValue,
  get
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

/* =========================
   ADMIN SESSION 24 HOURS
========================= */

const ADMIN_SESSION_DURATION =
  24 * 60 * 60 * 1000;

let adminLogoutTimer =
  null;


function clearAdminSession() {

  localStorage.removeItem(
    "adminLoginAt"
  );

  localStorage.removeItem(
    "adminExpiresAt"
  );

  sessionStorage.removeItem(
    "adminSecondVerifiedUid"
  );

  sessionStorage.removeItem(
    "adminSecondAuthPending"
  );

}


async function forceAdminLogout() {

  if (adminLogoutTimer) {

    clearTimeout(
      adminLogoutTimer
    );

    adminLogoutTimer =
      null;

  }


  clearAdminSession();


  try {

    await signOut(auth);

  } catch (error) {

    console.error(
      "Auto logout failed:",
      error
    );

  }


  location.replace(
    "./login.html"
  );

}


function startAdminSessionTimer() {

  const expiresAt =
    Number(
      localStorage.getItem(
        "adminExpiresAt"
      )
    );


  /*
    Tiada session time.
    Jangan create masa baru di sini.
  */
  if (!expiresAt) {

    forceAdminLogout();

    return;

  }


  const remaining =
    expiresAt -
    Date.now();


  /*
    Sudah cukup / lebih 24 jam.
  */
  if (remaining <= 0) {

    forceAdminLogout();

    return;

  }


  if (adminLogoutTimer) {

    clearTimeout(
      adminLogoutTimer
    );

  }


  /*
    Logout tepat pada expiresAt.
  */
  adminLogoutTimer =
    setTimeout(
      forceAdminLogout,
      remaining
    );

}
/* AUTH GUARD */

export function requireAdmin() {

  onAuthStateChanged(
    auth,
    user => {

      /*
        STEP 1:
        Firebase login belum ada.
      */
      if (!user) {

        sessionStorage.removeItem(
          "adminSecondVerifiedUid"
        );


        location.replace(
          "./login.html"
        );


        return;

      }


      /*
        STEP 2:
        Firebase login sudah ada,
        tetapi 2nd Password
        belum verified.
      */
      const verifiedUid =
        sessionStorage.getItem(
          "adminSecondVerifiedUid"
        );


      if (
        verifiedUid !== user.uid
      ) {

        location.replace(
          "./login.html"
        );


        return;

      }


      /*
        STEP 3:
        Firebase login +
        2nd Password sudah lulus.
      */
     startAdminSessionTimer();

      /* FULL EMAIL */

      const adminEmail =
        document.getElementById(
          "adminEmail"
        );


      if (adminEmail) {

        adminEmail.textContent =
          user.email ||
          "Admin";

      }


      /* TOP NAV USERNAME */

      const adminUsername =
        document.getElementById(
          "adminUsername"
        );


      if (adminUsername) {

        const username =
          user.displayName ||
          user.email
            ?.split("@")[0] ||
          "Admin";


        adminUsername.textContent =
          username;

      }

    }
  );

}

/* =========================
   CHANGE ADMIN PASSWORD
========================= */

export async function changeAdminPassword(
  currentPassword,
  newPassword
) {

  const user =
    auth.currentUser;


  if (
    !user ||
    !user.email
  ) {

    throw new Error(
      "NO_AUTH_USER"
    );

  }


  /* =========================
     VERIFY CURRENT PASSWORD
  ========================= */

  const credential =
    EmailAuthProvider.credential(
      user.email,
      currentPassword
    );


  await reauthenticateWithCredential(
    user,
    credential
  );


  /* =========================
     UPDATE FIREBASE PASSWORD
  ========================= */

  await updatePassword(
    user,
    newPassword
  );

}


/*
  shared-ui.js bukan module,
  jadi expose function ke window.
*/

window.changeAdminPassword =
  changeAdminPassword;
/* =========================
   CHANGE 2ND PASSWORD
========================= */

export async function changeAdminSecondPassword(
  currentCode,
  newCode
) {

  const user =
    auth.currentUser;


  if (!user) {

    throw new Error(
      "NO_AUTH_USER"
    );

  }


  /* Hanya 6 digit */

  if (
    !/^\d{6}$/.test(
      currentCode
    ) ||
    !/^\d{6}$/.test(
      newCode
    )
  ) {

    throw new Error(
      "SECOND_CODE_FORMAT"
    );

  }


  const secondAuthRef =
    ref(
      db,
      `admin_second_auth/${user.uid}`
    );


  /* Ambil data UID sendiri */

  const snapshot =
    await get(
      secondAuthRef
    );


  if (!snapshot.exists()) {

    throw new Error(
      "SECOND_AUTH_NOT_FOUND"
    );

  }


  const data =
    snapshot.val();


  /* Check 2nd password lama */

  if (
    String(
      data?.code || ""
    ) !== currentCode
  ) {
/* Pastikan 2nd Password aktif */

if (
  data?.enabled !== true
) {

  throw new Error(
    "SECOND_AUTH_DISABLED"
  );

}


/* Pastikan code memang tersedia */

if (
  !data?.code ||
  String(data.code).trim() === ""
) {

  throw new Error(
    "SECOND_CODE_NOT_SET"
  );

}
    throw new Error(
      "SECOND_CODE_WRONG"
    );

  }


  /* Tukar code sahaja */

  await update(
    secondAuthRef,
    {
      code:
        newCode
    }
  );

}


window.changeAdminSecondPassword =
  changeAdminSecondPassword;
/* LOGOUT */

export function setupLogout() {

  const logoutButtons =
    document.querySelectorAll(
      "#logoutBtn, #adminUserLogoutBtn"
    );


  if (!logoutButtons.length) {
    return;
  }


  logoutButtons.forEach(
    button => {

      button.addEventListener(
        "click",
        async () => {

          try {

            if (adminLogoutTimer) {

              clearTimeout(
                adminLogoutTimer
              );

              adminLogoutTimer =
                null;

            }


            clearAdminSession();


            await signOut(auth);


            location.replace(
              "./login.html"
            );


          } catch (error) {

            console.error(
              "Logout failed:",
              error
            );

          }

        }
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
  onValue,
  get
};
