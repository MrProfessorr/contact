const express = require("express");
const cors = require("cors");
const path = require("path");

const { initializeApp, cert } = require("firebase-admin/app");
const { getDatabase } = require("firebase-admin/database");
const { getAuth } = require("firebase-admin/auth");

let serviceAccount;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  serviceAccount = JSON.parse(
    process.env.FIREBASE_SERVICE_ACCOUNT
  );
} else {
  serviceAccount = require(
    path.join(__dirname, "serviceAccountKey.json")
  );
}

initializeApp({
  credential: cert(serviceAccount),
  databaseURL:
    "https://support-pwa-default-rtdb.asia-southeast1.firebasedatabase.app"
});

const db = getDatabase();
const auth = getAuth();

// ================================
// ADMIN SECURITY
// ================================
async function requireSuperAdmin(req, res, next) {
  try {
    const authorization = req.headers.authorization || "";

    if (!authorization.startsWith("Bearer ")) {
      return res.status(401).json({
        ok: false,
        message: "Authentication required"
      });
    }

    const idToken = authorization.substring(7);

    const decodedToken = await auth.verifyIdToken(idToken);

    const adminSnapshot = await db
      .ref(`admin_users/${decodedToken.uid}`)
      .once("value");

    if (!adminSnapshot.exists()) {
      return res.status(403).json({
        ok: false,
        message: "Admin profile not found"
      });
    }

    const profile = adminSnapshot.val();

    if (profile.enabled !== true || profile.role !== "superadmin") {
      return res.status(403).json({
        ok: false,
        message: "Superadmin access required"
      });
    }

    req.adminUser = {
      uid: decodedToken.uid,
      profile
    };

    next();
  } catch (error) {
    console.error("Admin authentication error:", error);

    return res.status(401).json({
      ok: false,
      message: "Invalid or expired authentication"
    });
  }
}
// ================================
// EXPRESS
// ================================
const app = express();

app.use(
  cors({
    origin: [
      "https://mrprofessorr.github.io",
      "http://localhost:3000",
      "http://127.0.0.1:3000"
    ],
    methods: [
      "GET",
      "POST",
      "PATCH",
      "OPTIONS"
    ],
    allowedHeaders: [
      "Content-Type",
      "Authorization"
    ]
  })
);

app.use((req, res, next) => {

  res.setHeader(
    "Access-Control-Allow-Private-Network",
    "true"
  );

  next();

});

app.use(express.json());

// ================================
// BASIC TEST
// ================================
app.get("/", (req, res) => {
  res.json({
    ok: true,
    message: "5G88 Admin Backend is running"
  });
});

// ================================
// FIREBASE CONNECTION TEST
// ================================
app.get("/api/test-firebase", async (req, res) => {
  try {
    const snapshot = await db.ref("sites_registry").once("value");

    res.json({
      ok: true,
      firebase: "connected",
      sitesRegistryExists: snapshot.exists()
    });
  } catch (error) {
    console.error("Firebase test error:", error);

    res.status(500).json({
      ok: false,
      message: error.message
    });
  }
});

// ================================
// LIST ADMIN USERS
// ================================
app.get("/api/admin-users", requireSuperAdmin, async (req, res) => {
  try {
    const users = [];

    let pageToken;

    do {
      const result = await auth.listUsers(1000, pageToken);

      for (const authUser of result.users) {
        // Hanya account yang memang mempunyai admin profile.
        // Ini mengelakkan customer Firebase Auth user masuk table ini.
        const profileSnapshot = await db
          .ref(`admin_users/${authUser.uid}`)
          .once("value");

        if (!profileSnapshot.exists()) {
          continue;
        }

        const profile = profileSnapshot.val() || {};

        users.push({
          uid: authUser.uid,

          username:
            profile.username ||
            String(authUser.email || "")
              .replace(/@5g88\.local$/i, ""),

          email: authUser.email || "",

          enabled:
            authUser.disabled !== true &&
            profile.enabled === true,

          createdAt:
            profile.createdAt ||
            authUser.metadata.creationTime ||
            null,

          updatedAt:
            profile.updatedAt ||
            profile.createdAt ||
            null
        });
      }

      pageToken = result.pageToken;
    } while (pageToken);

    users.sort((a, b) => {
      return (
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime()
      );
    });

    return res.json({
      ok: true,
      users
    });
  } catch (error) {
    console.error("List admin users error:", error);

    return res.status(500).json({
      ok: false,
      message: "Failed to load usernames"
    });
  }
});

// ================================
// CREATE ADMIN USER
// ================================
app.post("/api/admin-users", requireSuperAdmin, async (req, res) => {
  let createdUser = null;

  try {
    const username = String(req.body.username || "")
      .trim()
      .toLowerCase();

    const password = String(req.body.password || "");
    const secondPassword = String(req.body.secondPassword || "");
    const enabled = req.body.enabled !== false;

    if (!/^[a-z0-9._-]{3,40}$/.test(username)) {
      return res.status(400).json({
        ok: false,
        message:
          "Username mesti 3-40 aksara dan hanya boleh guna huruf, nombor, titik, underscore atau dash."
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        ok: false,
        message: "Password mesti sekurang-kurangnya 6 aksara."
      });
    }

    if (!/^\d{6}$/.test(secondPassword)) {
      return res.status(400).json({
        ok: false,
        message: "2nd Password mesti tepat 6 digit."
      });
    }

    const email = `${username}@5g88.local`;
    const now = Date.now();

    createdUser = await auth.createUser({
      email,
      password,
      disabled: !enabled
    });

    const uid = createdUser.uid;

    await db.ref(`admin_users/${uid}`).set({
      username,
      displayName: username,
      role: "site_admin",
      enabled,
      createdAt: now,
      updatedAt: now,
      createdBy: req.adminUser.uid
    });

    await db.ref(`admin_second_auth/${uid}`).set({
      username,
      enabled,
      code: secondPassword,
      createdAt: now,
      updatedAt: now
    });

    return res.status(201).json({
      ok: true,
      message: "Username created successfully",
      user: {
        uid,
        username,
        email,
        enabled,
        createdAt: now
      }
    });
  } catch (error) {
    console.error("Create admin user error:", error);

    // Jika Auth user sudah dibuat tetapi setup database gagal,
    // buang Auth user semula supaya tidak tinggal account separuh siap.
    if (createdUser?.uid) {
      try {
        await auth.deleteUser(createdUser.uid);
      } catch (cleanupError) {
        console.error("Auth cleanup error:", cleanupError);
      }
    }

    if (error.code === "auth/email-already-exists") {
      return res.status(409).json({
        ok: false,
        message: "Username sudah digunakan."
      });
    }

    return res.status(500).json({
      ok: false,
      message: "Failed to create username"
    });
  }
});

// ================================
// UPDATE / MANAGE ADMIN USER
// ================================
app.patch(
  "/api/admin-users/:uid",
  requireSuperAdmin,
  async (req, res) => {
    try {
      const uid = String(req.params.uid || "").trim();

      if (!uid) {
        return res.status(400).json({
          ok: false,
          message: "UID is required"
        });
      }

      const profileRef =
        db.ref(`admin_users/${uid}`);

      const profileSnapshot =
        await profileRef.once("value");

      if (!profileSnapshot.exists()) {
        return res.status(404).json({
          ok: false,
          message: "Admin user not found"
        });
      }

      const profile =
        profileSnapshot.val() || {};

      const newPassword =
        String(req.body.password || "");

      const secondPassword =
        String(req.body.secondPassword || "");

      const hasEnabled =
        typeof req.body.enabled === "boolean";

      // Jangan benarkan superadmin disable account sendiri
      if (
        uid === req.adminUser.uid &&
        hasEnabled &&
        req.body.enabled === false
      ) {
        return res.status(400).json({
          ok: false,
          message: "You cannot disable your own account."
        });
      }

      if (
        newPassword &&
        newPassword.length < 6
      ) {
        return res.status(400).json({
          ok: false,
          message:
            "Password mesti sekurang-kurangnya 6 aksara."
        });
      }

      if (
        secondPassword &&
        !/^\d{6}$/.test(secondPassword)
      ) {
        return res.status(400).json({
          ok: false,
          message:
            "2nd Password mesti tepat 6 digit."
        });
      }

      const authUpdate = {};

      if (newPassword) {
        authUpdate.password =
          newPassword;
      }

      if (hasEnabled) {
        authUpdate.disabled =
          !req.body.enabled;
      }

      if (
        Object.keys(authUpdate).length
      ) {
        await auth.updateUser(
          uid,
          authUpdate
        );
      }

      const now = Date.now();

      const profileUpdate = {
        updatedAt: now
      };

      if (hasEnabled) {
        profileUpdate.enabled =
          req.body.enabled;
      }

      await profileRef.update(
        profileUpdate
      );

      if (
        secondPassword ||
        hasEnabled
      ) {
        const secondRef =
          db.ref(
            `admin_second_auth/${uid}`
          );

        const secondSnapshot =
          await secondRef.once("value");

        const secondUpdate = {
          username:
            profile.username || "",
          updatedAt: now
        };

        if (secondPassword) {
          secondUpdate.code =
            secondPassword;
        }

        if (hasEnabled) {
          secondUpdate.enabled =
            req.body.enabled;
        }

        if (!secondSnapshot.exists()) {
          secondUpdate.createdAt =
            now;

          if (!secondPassword) {
            secondUpdate.code = "";
          }

          if (!hasEnabled) {
            secondUpdate.enabled =
              profile.enabled === true;
          }
        }

        await secondRef.update(
          secondUpdate
        );
      }

      return res.json({
        ok: true,
        message:
          "Username updated successfully",
        user: {
          uid,
          enabled:
            hasEnabled
              ? req.body.enabled
              : profile.enabled,
          updatedAt: now
        }
      });
    } catch (error) {
      console.error(
        "Update admin user error:",
        error
      );

      if (
        error.code ===
        "auth/user-not-found"
      ) {
        return res.status(404).json({
          ok: false,
          message:
            "Firebase Auth user not found"
        });
      }

      return res.status(500).json({
        ok: false,
        message:
          "Failed to update username"
      });
    }
  }
);

// ================================
// SERVER
// ================================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("------------------------------------");
  console.log("5G88 Admin Backend");
  console.log(`Server running on port ${PORT}`);
  console.log("------------------------------------");
});