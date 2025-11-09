// js/admin-auth.js
import { db, ref, get, onValue } from "./firebase-config.js";

const loginForm = document.getElementById("adminLogin");
const msg = document.getElementById("msg");

async function fetchAdminCredentials() {
  const snap = await get(ref(db, "settings/admin"));
  return snap.exists() ? snap.val() : null;
}

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  msg.classList.add("hidden");
  const email = document.getElementById("adminEmail").value.trim();
  const password = document.getElementById("adminPassword").value;

  try {
    const admin = await fetchAdminCredentials();
    if (!admin) {
      msg.textContent = "Admin credentials not configured in database.";
      msg.classList.remove("hidden");
      return;
    }

    if (admin.email === email && admin.password === password) {
      // Set a simple session flag - in production use proper auth
      localStorage.setItem("isAdmin", "true");
      localStorage.setItem("adminEmail", email);
      window.location.href = "../admin/admin-dashboard.html";
    } else {
      msg.textContent = "Invalid admin email or password.";
      msg.classList.remove("hidden");
    }
  } catch (err) {
    console.error(err);
    msg.textContent = "Error checking admin credentials. See console.";
    msg.classList.remove("hidden");
  }
});
