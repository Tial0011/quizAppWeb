import { db, ref, onValue, update, remove } from "./firebase-config.js";

if (localStorage.getItem("isAdmin") !== "true") {
  window.location.href = "./auth/admin-auth.html";
}

const teacherList = document.getElementById("teacherList");
const searchInput = document.getElementById("searchInput");
const logoutBtn = document.getElementById("logoutBtn");

logoutBtn.onclick = () => {
  localStorage.removeItem("isAdmin");
  localStorage.removeItem("adminEmail");
  window.location.href = "./auth/admin-auth.html";
};

let teachersData = {};

onValue(ref(db, "teachers"), (snap) => {
  if (!snap.exists()) {
    teacherList.innerHTML = `<p class="text-gray-600">No teachers found.</p>`;
    return;
  }

  teachersData = snap.val();
  renderTeachers();
});

function renderTeachers() {
  const search = searchInput.value.toLowerCase();
  teacherList.innerHTML = "";

  Object.entries(teachersData).forEach(([id, teacher]) => {
    if (
      teacher.name.toLowerCase().includes(search) === false &&
      teacher.email.toLowerCase().includes(search) === false
    )
      return;

    const card = document.createElement("div");
    card.className = "bg-white p-4 rounded shadow border";

    card.innerHTML = `
      <p class="text-lg font-semibold">${teacher.name}</p>
      <p class="text-gray-600">${teacher.email}</p>
      <p class="text-sm">Department: ${teacher.department || "—"} | Class: ${
      teacher.classLevel || "—"
    }</p>

      <p class="mt-2">
        Status:
        <span class="font-bold ${
          teacher.approved ? "text-green-600" : "text-red-600"
        }">
          ${teacher.approved ? "Approved" : "Pending"}
        </span>
      </p>

      <div class="flex gap-3 mt-4">
        ${
          teacher.approved
            ? ""
            : `<button class="approveBtn bg-blue-600 text-white px-3 py-1 rounded" data-id="${id}">Approve</button>`
        }
        <button class="deleteBtn bg-red-600 text-white px-3 py-1 rounded" data-id="${id}">Delete</button>
      </div>
    `;

    teacherList.appendChild(card);
  });

  attachActions();
}

searchInput.addEventListener("input", renderTeachers);

function attachActions() {
  document.querySelectorAll(".approveBtn").forEach((btn) => {
    btn.onclick = () => approveTeacher(btn.dataset.id);
  });

  document.querySelectorAll(".deleteBtn").forEach((btn) => {
    btn.onclick = () => deleteTeacher(btn.dataset.id);
  });
}

function approveTeacher(id) {
  update(ref(db, `teachers/${id}`), { approved: true });
}

function deleteTeacher(id) {
  if (confirm("Delete this teacher permanently?")) {
    remove(ref(db, `teachers/${id}`));
  }
}
