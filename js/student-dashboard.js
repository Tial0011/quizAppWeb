// js/student-dashboard.js
import { db, ref, onValue, get } from "./firebase-config.js";

const studentKey = localStorage.getItem("studentEmail");
if (!studentKey) {
  window.location.href = "../auth/student-auth.html";
}
const nameEl = document.getElementById("studentNameDisplay");
const availEl = document.getElementById("availableList");
const logoutBtn = document.getElementById("logoutBtn");

logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("studentEmail");
  window.location.href = "../auth/student-auth.html";
});

(async function init() {
  const studSnap = await get(ref(db, "students/" + studentKey));
  if (!studSnap.exists()) {
    alert("Student record missing. Please login again.");
    localStorage.removeItem("studentEmail");
    return (window.location.href = "../auth/student-auth.html");
  }
  const student = studSnap.val();
  nameEl.textContent =
    student.name + ` • ${student.department} • ${student.classLevel}`;

  // list quizzes for this student's dept/class
  onValue(ref(db, "quizzes"), (qsnap) => {
    const data = qsnap.val();
    availEl.innerHTML = "";
    if (!data) {
      availEl.innerHTML = "<p class='text-sm text-gray-600'>No quizzes yet</p>";
      return;
    }
    const quizzes = Object.values(data).filter(
      (q) =>
        q.department === student.department &&
        q.classLevel === student.classLevel
    );
    if (quizzes.length === 0) {
      availEl.innerHTML =
        "<p class='text-sm text-gray-600'>No quizzes for your class.</p>";
      return;
    }
    availEl.innerHTML = quizzes
      .map(
        (q) => `
      <div class="p-3 border rounded flex justify-between items-center">
        <div>
          <div class="font-semibold">${q.title}</div>
          <div class="text-sm text-gray-500">${q.timeLimit} min</div>
        </div>
        <a href="student-take-quiz.html?quiz=${encodeURIComponent(
          q.quizId
        )}" class="bg-blue-600 text-white px-3 py-1 rounded">Take</a>
      </div>
    `
      )
      .join("");
  });
})();
