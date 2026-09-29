import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";

import {
  getAuth,
  onAuthStateChanged,
  signOut,
  setPersistence,
  browserSessionPersistence,
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

await setPersistence(
  auth,
  browserSessionPersistence
);

export const db =
  getDatabase(app);
/* =========================
   CURRENT ADMIN PROFILE
========================= */

let currentAdminProfile =
  null;


export function getCurrentAdminProfile() {

  return currentAdminProfile;

}



export function isSuperAdmin() {

  return (
    currentAdminProfile?.role ===
    "superadmin"
  );

}

export function getAdminAllowedSiteIds() {

  const sites =
    currentAdminProfile?.sites || {};


  return Object
    .entries(sites)
    .filter(
      ([, allowed]) =>
        allowed === true
    )
    .map(
      ([siteId]) =>
        String(siteId)
    );

}


export function getAdminSelectedSiteId() {

  const selectedSites =
    typeof window.getAdminSelectedSites === "function"
      ? window.getAdminSelectedSites()
      : [];


  if (
    Array.isArray(selectedSites) &&
    selectedSites.length === 1
  ) {

    return String(
      selectedSites[0]
    );

  }


  return "";

}


export function getAdminSitePath(
  siteId,
  childPath = ""
) {

  const cleanSiteId =
    normalizeSiteId(
      siteId
    );


  if (!cleanSiteId) {

    throw new Error(
      "SITE_REQUIRED"
    );

  }


  const cleanChild =
    String(
      childPath || ""
    )
      .replace(/^\/+|\/+$/g, "");


  return cleanChild
    ? `sites/${cleanSiteId}/${cleanChild}`
    : `sites/${cleanSiteId}`;

}


export async function getAdminSites(
  includeDisabled = false
) {

  if (!currentAdminProfile) {

    throw new Error(
      "ADMIN_PROFILE_NOT_READY"
    );

  }


  const snapshot =
    await get(
      ref(
        db,
        "sites_registry"
      )
    );


  if (!snapshot.exists()) {
    return [];
  }


  const registry =
    snapshot.val() || {};


  const allowedSiteIds =
    getAdminAllowedSiteIds();


  return Object
    .entries(registry)
    .filter(
      ([siteId, site]) => {

        /*
          Site Admin hanya boleh
          nampak assigned sites.
        */

        if (
          !isSuperAdmin() &&
          !allowedSiteIds.includes(
            String(siteId)
          )
        ) {

          return false;

        }


        /*
          Selector biasa hanya
          perlukan site Active.

          Site Management boleh
          pass true supaya Disabled
          site juga kelihatan.
        */

        if (
          !includeDisabled &&
          site?.enabled !== true
        ) {

          return false;

        }


        return true;

      }
    )
    .map(
      ([siteId, site]) => ({

        id:
          String(siteId),

        value:
          String(siteId),

        name:
          site?.name ||
          String(siteId),

        label:
          site?.name ||
          String(siteId),

        enabled:
          site?.enabled === true,

        order:
          Number(
            site?.order || 999
          ),

        createdAt:
          Number(
            site?.createdAt || 0
          )

      })
    )
    .sort(
      (a, b) =>
        a.order - b.order ||
        a.name.localeCompare(
          b.name
        )
    );

}


/*
  Normalize Site ID.

  Contoh:
  "SPM 888" -> "spm-888"
*/

export function normalizeSiteId(
  value
) {

  return String(
    value || ""
  )
    .trim()
    .toLowerCase()
    .replace(
      /[^a-z0-9_-]+/g,
      "-"
    )
    .replace(
      /^-+|-+$/g,
      ""
    );

}


/*
  CREATE SITE

  Hanya Superadmin boleh panggil.
*/

export async function createAdminSite({
  siteId,
  name
}) {

  if (!isSuperAdmin()) {

    throw new Error(
      "SUPERADMIN_REQUIRED"
    );

  }


  const cleanId =
    normalizeSiteId(
      siteId
    );


  const cleanName =
    String(
      name || ""
    ).trim();


  if (!cleanId) {

    throw new Error(
      "SITE_ID_REQUIRED"
    );

  }


  if (!cleanName) {

    throw new Error(
      "SITE_NAME_REQUIRED"
    );

  }


  const siteRef =
    ref(
      db,
      `sites_registry/${cleanId}`
    );


  const snapshot =
    await get(
      siteRef
    );


  if (snapshot.exists()) {

    throw new Error(
      "SITE_ALREADY_EXISTS"
    );

  }


  /*
    Tentukan order selepas
    site terakhir.
  */

  const existingSites =
    await getAdminSites(
      true
    );


  const maxOrder =
    existingSites.reduce(
      (highest, site) =>
        Math.max(
          highest,
          Number(
            site.order || 0
          )
        ),
      0
    );


  const siteData = {

    name:
      cleanName,

    enabled:
      true,

    order:
      maxOrder + 1,

    createdAt:
      Date.now(),

    createdBy:
      currentAdminProfile.uid

  };


  await set(
    siteRef,
    siteData
  );


  window.dispatchEvent(
    new CustomEvent(
      "admin-sites-changed",
      {
        detail: {
          action:
            "created",

          siteId:
            cleanId
        }
      }
    )
  );


  return {
    id:
      cleanId,

    value:
      cleanId,

    label:
      cleanName,

    ...siteData
  };

}


/*
  EDIT SITE NAME
*/

export async function updateAdminSite(
  siteId,
  updates = {}
) {

  if (!isSuperAdmin()) {

    throw new Error(
      "SUPERADMIN_REQUIRED"
    );

  }


  const cleanId =
    normalizeSiteId(
      siteId
    );


  if (!cleanId) {

    throw new Error(
      "SITE_ID_REQUIRED"
    );

  }


  const allowedUpdates = {};


  if (
    typeof updates.name ===
    "string"
  ) {

    const name =
      updates.name.trim();


    if (!name) {

      throw new Error(
        "SITE_NAME_REQUIRED"
      );

    }


    allowedUpdates.name =
      name;

  }


  if (
    typeof updates.order ===
    "number" &&
    Number.isFinite(
      updates.order
    )
  ) {

    allowedUpdates.order =
      updates.order;

  }


  if (
    !Object.keys(
      allowedUpdates
    ).length
  ) {

    return;

  }


  allowedUpdates.updatedAt =
    Date.now();


  await update(
    ref(
      db,
      `sites_registry/${cleanId}`
    ),
    allowedUpdates
  );


  window.dispatchEvent(
    new CustomEvent(
      "admin-sites-changed",
      {
        detail: {
          action:
            "updated",

          siteId:
            cleanId
        }
      }
    )
  );

}

export async function setAdminSiteEnabled(
  siteId,
  enabled
) {

  if (!isSuperAdmin()) {

    throw new Error(
      "SUPERADMIN_REQUIRED"
    );

  }


  const cleanId =
    normalizeSiteId(
      siteId
    );


  if (!cleanId) {

    throw new Error(
      "SITE_ID_REQUIRED"
    );

  }


  await update(
    ref(
      db,
      `sites_registry/${cleanId}`
    ),
    {
      enabled:
        enabled === true,

      updatedAt:
        Date.now()
    }
  );


  window.dispatchEvent(
    new CustomEvent(
      "admin-sites-changed",
      {
        detail: {
          action:
            enabled
              ? "enabled"
              : "disabled",

          siteId:
            cleanId
        }
      }
    )
  );

}
/* =========================
   ADMIN USER MANAGEMENT
========================= */

export async function getAdminUsers() {

  if (!isSuperAdmin()) {
    throw new Error(
      "SUPERADMIN_REQUIRED"
    );
  }

  const snapshot =
    await get(
      ref(
        db,
        "admin_users"
      )
    );

  if (!snapshot.exists()) {
    return [];
  }

  return Object
    .entries(
      snapshot.val() || {}
    )
    .map(
      ([uid, profile]) => ({
        uid: String(uid),

        username:
          profile?.username || "",

        displayName:
          profile?.displayName ||
          profile?.username ||
          "Admin",

        role:
          profile?.role ||
          "site_admin",

        enabled:
          profile?.enabled === true,

        sites:
          profile?.sites || {},

        permissions:
          profile?.permissions || {}
      })
    )
    .sort(
      (a, b) =>
        a.username.localeCompare(
          b.username
        )
    );

}


export async function saveAdminUser(
  uid,
  profile = {}
) {

  if (!isSuperAdmin()) {
    throw new Error(
      "SUPERADMIN_REQUIRED"
    );
  }


  const cleanUid =
    String(
      uid || ""
    ).trim();


  if (!cleanUid) {
    throw new Error(
      "ADMIN_UID_REQUIRED"
    );
  }


  const username =
    String(
      profile.username || ""
    ).trim();


  if (!username) {
    throw new Error(
      "ADMIN_USERNAME_REQUIRED"
    );
  }


  const role =
    profile.role === "superadmin"
      ? "superadmin"
      : "site_admin";


  const data = {

    username,

    displayName:
      String(
        profile.displayName ||
        username
      ).trim(),

    role,

    enabled:
      profile.enabled !== false,

    sites:
      role === "superadmin"
        ? {}
        : (
            profile.sites || {}
          ),

    permissions:
      role === "superadmin"
        ? {}
        : (
            profile.permissions || {}
          ),

    updatedAt:
      Date.now(),

    updatedBy:
      currentAdminProfile.uid

  };


  await update(
    ref(
      db,
      `admin_users/${cleanUid}`
    ),
    data
  );


  window.dispatchEvent(
    new CustomEvent(
      "admin-users-changed"
    )
  );

}


export async function setAdminUserEnabled(
  uid,
  enabled
) {

  if (!isSuperAdmin()) {
    throw new Error(
      "SUPERADMIN_REQUIRED"
    );
  }


  const cleanUid =
    String(
      uid || ""
    ).trim();


  if (!cleanUid) {
    throw new Error(
      "ADMIN_UID_REQUIRED"
    );
  }


  /*
    Jangan benarkan superadmin
    disable account sendiri.
  */

  if (
    cleanUid ===
    currentAdminProfile?.uid &&
    enabled !== true
  ) {

    throw new Error(
      "CANNOT_DISABLE_SELF"
    );
  }


  await update(
    ref(
      db,
      `admin_users/${cleanUid}`
    ),
    {
      enabled:
        enabled === true,

      updatedAt:
        Date.now(),

      updatedBy:
        currentAdminProfile.uid
    }
  );


  window.dispatchEvent(
    new CustomEvent(
      "admin-users-changed"
    )
  );

}
/* =========================
   EXPOSE ADMIN SITE API
========================= */

window.getCurrentAdminProfile =
  getCurrentAdminProfile;

window.isSuperAdmin =
  isSuperAdmin;

window.getAdminAllowedSiteIds =
  getAdminAllowedSiteIds;

window.getAdminSelectedSiteId =
  getAdminSelectedSiteId;

window.getAdminSitePath =
  getAdminSitePath;

window.getAdminSites =
  getAdminSites;

window.createAdminSite =
  createAdminSite;

window.updateAdminSite =
  updateAdminSite;

window.setAdminSiteEnabled =
  setAdminSiteEnabled;

window.getAdminUsers =
  getAdminUsers;

window.saveAdminUser =
  saveAdminUser;

window.setAdminUserEnabled =
  setAdminUserEnabled;
/* =========================
   ADMIN SESSION 24 HOURS
========================= */

const ADMIN_SESSION_DURATION =
  24 * 60 * 60 * 1000;

let adminLogoutTimer =
  null;


function clearAdminSession() {

  sessionStorage.removeItem(
    "adminLoginAt"
  );

  sessionStorage.removeItem(
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
    sessionStorage.getItem(
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

/* =========================
   AUTH GUARD
========================= */

export function requireAdmin() {

  onAuthStateChanged(
    auth,
    async user => {

      /*
        STEP 1:
        Belum login Firebase.
      */

      if (!user) {

        currentAdminProfile =
          null;


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
        Check 2nd Password.
      */

      const verifiedUid =
        sessionStorage.getItem(
          "adminSecondVerifiedUid"
        );


      if (
        verifiedUid !== user.uid
      ) {

        currentAdminProfile =
          null;


        location.replace(
          "./login.html"
        );


        return;

      }


      /*
        STEP 3:
        Ambil admin profile
        berdasarkan UID Firebase.
      */

      try {

        const adminProfileRef =
          ref(
            db,
            `admin_users/${user.uid}`
          );


        const snapshot =
          await get(
            adminProfileRef
          );


        /*
          Firebase Auth ada,
          tetapi user bukan admin.
        */

        if (!snapshot.exists()) {

          console.error(
            "ADMIN_PROFILE_NOT_FOUND"
          );


          window.showToast?.(
            "Admin access not registered.",
            "error",
            5000
          );


          await forceAdminLogout();


          return;

        }


        const profile =
          snapshot.val() || {};


        /*
          Check enabled.
        */

        if (
          profile.enabled !== true
        ) {

          console.error(
            "ADMIN_DISABLED"
          );


          window.showToast?.(
            "Admin account is disabled.",
            "error",
            5000
          );


          await forceAdminLogout();


          return;

        }


        /*
          Check role.
        */

        const validRoles = [
          "superadmin",
          "site_admin"
        ];


        if (
          !validRoles.includes(
            profile.role
          )
        ) {

          console.error(
            "INVALID_ADMIN_ROLE"
          );


          window.showToast?.(
            "Invalid admin role.",
            "error",
            5000
          );


          await forceAdminLogout();


          return;

        }


        /*
          Simpan profile admin
          dalam memory.
        */

        currentAdminProfile = {

          uid:
            user.uid,

          email:
            user.email || "",

          username:
            profile.username ||
            user.email
              ?.split("@")[0] ||
            "Admin",

          displayName:
            profile.displayName ||
            profile.username ||
            "Admin",

          role:
            profile.role,

          enabled:
            true,

          sites:
            profile.sites || {},

          permissions:
            profile.permissions || {}

        };


        /*
          Session 24 jam
          masih sistem lama.
        */

        startAdminSessionTimer();


        /*
          FULL EMAIL
        */

        const adminEmail =
          document.getElementById(
            "adminEmail"
          );


        if (adminEmail) {

          adminEmail.textContent =
            user.email ||
            "Admin";

        }


        /*
          TOP NAV USERNAME
        */

        const adminUsername =
          document.getElementById(
            "adminUsername"
          );


        if (adminUsername) {

          adminUsername.textContent =
            currentAdminProfile
              .displayName;

        }


        /*
          Beritahu shared UI bahawa
          profile admin sudah ready.
        */

        window.dispatchEvent(
          new CustomEvent(
            "admin-profile-ready",
            {
              detail: {
                ...currentAdminProfile
              }
            }
          )
        );

      }

      catch (error) {

        console.error(
          "Failed to verify admin:",
          error
        );


        window.showToast?.(
          "Failed to verify admin access.",
          "error",
          5000
        );


        await forceAdminLogout();

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
  String(
    data.code
  ).trim() === ""
) {

  throw new Error(
    "SECOND_CODE_NOT_SET"
  );

}


/* Check 2nd password lama */

if (
  String(
    data.code
  ) !== currentCode
) {

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


  window.showToast?.(
    error?.message ||
    "Failed to logout.",
    "error",
    5000
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
