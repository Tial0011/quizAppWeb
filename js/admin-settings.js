import { db, ref, get, set, update } from "./firebase.js";

// Display admin email
const adminEmailEl = document.getElementById("adminEmail");
get(ref(db, "admin")).then((snapshot) => {
  if (snapshot.exists()) {
    const adminData = snapshot.val();
    adminEmailEl.textContent = adminData.email;
  } else {
    adminEmailEl.textContent = "Not Found";
  }
});

// Change Password
const changePassBtn = document.getElementById("changePassBtn");
changePassBtn.onclick = async () => {
  const oldPass = document.getElementById("oldPass").value.trim();
  const newPass = document.getElementById("newPass").value.trim();
  const confirmPass = document.getElementById("confirmPass").value.trim();

  if (!oldPass || !newPass || !confirmPass) {
    return alert("Please fill all password fields.");
  }

  if (newPass !== confirmPass) {
    return alert("New passwords do not match.");
  }

  const adminRef = ref(db, "admin");
  const snapshot = await get(adminRef);

  if (!snapshot.exists()) {
    return alert("Admin not found in database!");
  }

  const adminData = snapshot.val();

  if (adminData.password !== oldPass) {
    return alert("Current password is incorrect.");
  }

  await update(adminRef, { password: newPass });
  alert("Password updated successfully!");
  document.getElementById("oldPass").value = "";
  document.getElementById("newPass").value = "";
  document.getElementById("confirmPass").value = "";
};

// Danger Zone
document.getElementById("clearResults").onclick = async () => {
  if (confirm("Are you sure you want to clear all quiz results?")) {
    await set(ref(db, "results"), null);
    alert("All quiz results cleared!");
  }
};

document.getElementById("logoutEveryone").onclick = async () => {
  if (confirm("Force logout all users?")) {
    await update(ref(db, "settings"), { forceLogout: Date.now() });
    alert("All users have been logged out.");
  }
};

// Logout button
document.getElementById("logoutBtn").onclick = () => {
  localStorage.removeItem("adminLoggedIn");
  window.location.href = "../index.html";
};
