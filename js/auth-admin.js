import {
  db,
  auth,
  ref,
  get,
  signInWithEmailAndPassword,
} from "./firebase-config.js";

// ✅ Default Admin Credentials (stored in DB)
async function getAdminCredentials() {
  const adminRef = ref(db, "settings/admin");
  const snap = await get(adminRef);

  if (snap.exists()) return snap.val();
  return null;
}

document.getElementById("adminLoginBtn").onclick = async () => {
  const email = adminEmail.value.trim();
  const password = adminPassword.value.trim();

  if (!email || !password) return alert("Fill all fields");

  const adminData = await getAdminCredentials();

  if (!adminData) return alert("⚠️ Admin not initialized in DB yet.");

  if (email !== adminData.email || password !== adminData.password) {
    alert("❌ Invalid Admin Credentials");
    return;
  }

  try {
    await signInWithEmailAndPassword(auth, email, password);
    window.location.href = "../dashboards/admin-dashboard.html";
  } catch (err) {
    alert("❌ Login Failed");
  }
};
