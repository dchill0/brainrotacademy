require("dotenv").config({ path: ".env.local" });

const admin = require("firebase-admin");

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: "brainrotacademy-8d820",
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  }),
});

const uid = process.argv[2];

if (!uid) {
  console.error("Usage: node setAdmin.js <UID>");
  process.exit(1);
}

async function setAdmin(uid) {
  try {
    await admin.auth().setCustomUserClaims(uid, { admin: true });
    console.log("✅ Admin set for UID:", uid);
  } catch (err) {
    console.error("❌ Error:", err);
  }
}

setAdmin(uid);