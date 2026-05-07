const admin = require("firebase-admin");
const serviceAccount = require("./ServiceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const NUEVO_OWNER_ID = "fP9Aj0kgBfYVXUwaJx2ABfqhJHs2";

async function migrarPacientes() {
  const snapshot = await db.collection("pacientes").get();

  console.log(`📦 Pacientes encontrados: ${snapshot.size}`);

  const batch = db.batch();

  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const ref = db.collection("pacientes").doc(docSnap.id);

    const updateData = {};

    // 🔥 CASO 1: tiene userID pero no ownerId
    if (!data.ownerId && data.userID) {
      updateData.ownerId = data.userID;
    }

    // 🔥 CASO 2: no tiene nada
    if (!data.ownerId && !data.userID) {
      updateData.ownerId = NUEVO_OWNER_ID;
    }

    // 🔥 opcional limpieza
    updateData.userID = admin.firestore.FieldValue.delete();

    if (Object.keys(updateData).length > 0) {
      batch.update(ref, updateData);
    }
  });

  await batch.commit();

  console.log("✅ Migración de pacientes completada");
}

migrarPacientes().catch(console.error);