import { db, ref, onValue } from "./firebase-config.js";

if (localStorage.getItem("isAdmin") !== "true") {
  window.location.href = "./auth/admin-auth.html";
}

document.getElementById("logoutBtn").onclick = () => {
  localStorage.clear();
  window.location.href = "./auth/admin-auth.html";
};

// UI
const teacherCount = document.getElementById("teacherCount");
const studentCount = document.getElementById("studentCount");
const quizCount = document.getElementById("quizCount");
const quizList = document.getElementById("quizList");

// Count Teachers
onValue(ref(db, "teachers"), (snap) => {
  teacherCount.textContent = snap.exists() ? Object.keys(snap.val()).length : 0;
});

// Count Students
onValue(ref(db, "students"), (snap) => {
  studentCount.textContent = snap.exists() ? Object.keys(snap.val()).length : 0;
});

// Count Quizzes + Display Recent
onValue(ref(db, "quizzes"), (snap) => {
  if (!snap.exists()) {
    quizCount.textContent = 0;
    quizList.innerHTML = "";
    return;
  }

  const quizzes = Object.values(snap.val());
  quizCount.textContent = quizzes.length;

  quizList.innerHTML = quizzes
    .slice(-10)
    .reverse()
    .map(
      (q) => `
      <tr class="border-b">
        <td class="p-3">${q.title}</td>
        <td class="p-3">${q.createdBy}</td>
        <td class="p-3">${q.department}</td>
        <td class="p-3">${q.classLevel}</td>
      </tr>
  `
    )
    .join("");
});
