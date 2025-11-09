import { db, ref, set, onValue, remove } from "./firebase-config.js";

if (localStorage.getItem("isAdmin") !== "true") {
  window.location.href = "./auth/admin-auth.html";
}

document.getElementById("logoutBtn").onclick = () => {
  localStorage.clear();
  window.location.href = "./auth/admin-auth.html";
};

const name = document.getElementById("name");
const email = document.getElementById("email");
const dept = document.getElementById("department");
const classLevel = document.getElementById("classLevel");
const addBtn = document.getElementById("addBtn");
const studentList = document.getElementById("studentList");

// Add Student
addBtn.onclick = async () => {
  if (!email.value || !name.value) return alert("Name and Email required.");

  await set(ref(db, `students/${email.value}`), {
    name: name.value,
    email: email.value,
    department: dept.value,
    classLevel: classLevel.value,
    password: "1234",
  });

  alert("Student added. Default password = 1234");

  name.value = email.value = dept.value = classLevel.value = "";
};

// Display Student List
onValue(ref(db, "students"), (snap) => {
  studentList.innerHTML = "";

  if (!snap.exists()) return;

  Object.values(snap.val()).forEach((s) => {
    const div = document.createElement("div");
    div.className = "border p-3 rounded flex justify-between";

    div.innerHTML = `
      <div>
        <p class="font-bold">${s.name}</p>
        <p class="text-sm text-gray-600">${s.email}</p>
        <p>${s.department} | ${s.classLevel}</p>
      </div>
      <button data-email="${s.email}" class="delete bg-red-600 text-white px-3 py-1 rounded">
        Remove
      </button>
    `;

    studentList.appendChild(div);
  });

  document.querySelectorAll(".delete").forEach((btn) => {
    btn.onclick = () => {
      if (confirm("Remove this student?")) {
        remove(ref(db, `students/${btn.dataset.email}`));
      }
    };
  });
});
