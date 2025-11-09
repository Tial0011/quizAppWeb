import {
  db,
  ref,
  set,
  get,
  update,
  remove,
  onValue,
} from "./firebase-config.js";

// Elements
const deptName = document.getElementById("deptName");
const deptCode = document.getElementById("deptCode");
const addDeptBtn = document.getElementById("addDeptBtn");
const deptTable = document.getElementById("deptTable");
const logoutBtn = document.getElementById("logoutBtn");

// Auth Guard
const adminEmail = localStorage.getItem("adminEmail");
if (!adminEmail) {
  window.location.href = "../auth/admin-login.html";
}

// Logout
logoutBtn.onclick = () => {
  localStorage.removeItem("adminEmail");
  window.location.href = "../auth/admin-login.html";
};

// Firebase Reference
const deptsRef = ref(db, "departments");

// Add Department
addDeptBtn.onclick = async () => {
  const name = deptName.value.trim();
  const code = deptCode.value.trim().toUpperCase();

  if (!name || !code) {
    alert("Both Department Name and Code are required.");
    return;
  }

  const key = code; // Use code as identifier (stable unique key)

  try {
    await set(ref(db, "departments/" + key), {
      name,
      code,
    });

    alert("Department added successfully.");
    deptName.value = "";
    deptCode.value = "";
  } catch (error) {
    console.error(error);
    alert("Error adding department.");
  }
};

// Load & Display Departments
onValue(deptsRef, (snapshot) => {
  deptTable.innerHTML = "";

  if (!snapshot.exists()) return;

  snapshot.forEach((child) => {
    const data = child.val();
    const row = document.createElement("tr");
    row.innerHTML = `
      <td class="p-2 border">${data.name}</td>
      <td class="p-2 border">${data.code}</td>
      <td class="p-2 border">
        <button class="bg-yellow-500 text-white px-2 py-1 rounded mr-2" data-edit="${data.code}">Edit</button>
        <button class="bg-red-600 text-white px-2 py-1 rounded" data-delete="${data.code}">Delete</button>
      </td>
    `;
    deptTable.appendChild(row);
  });

  attachRowEvents();
});

// Edit + Delete Logic
function attachRowEvents() {
  // Edit
  document.querySelectorAll("[data-edit]").forEach((btn) => {
    btn.onclick = async () => {
      const code = btn.getAttribute("data-edit");
      const snap = await get(ref(db, "departments/" + code));
      if (!snap.exists()) return;

      const newName = prompt("Enter new department name:", snap.val().name);
      if (!newName || newName.trim() === "") return;

      await update(ref(db, "departments/" + code), { name: newName.trim() });
      alert("Department updated.");
    };
  });

  // Delete
  document.querySelectorAll("[data-delete]").forEach((btn) => {
    btn.onclick = async () => {
      const code = btn.getAttribute("data-delete");
      if (!confirm("Delete this department?")) return;

      await remove(ref(db, "departments/" + code));
      alert("Department deleted.");
    };
  });
}
