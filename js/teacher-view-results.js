// js/teacher-view-results.js
import { db, ref, onValue, get } from "./firebase-config.js";

const teacherEmail = localStorage.getItem("teacherEmail");
const quizListDiv = document.getElementById("quizList");
const modal = document.getElementById("studentModal");
const modalQuizTitle = document.getElementById("modalQuizTitle");
const studentResults = document.getElementById("studentResults");
const closeModal = document.getElementById("closeModal");

if (!teacherEmail) {
  window.location.href = "../auth/teacher-auth.html";
}

// list teacher quizzes
onValue(ref(db, "quizzes"), (snap) => {
  quizListDiv.innerHTML = "";
  const data = snap.val();
  if (!data) {
    quizListDiv.innerHTML = "<p>No quizzes yet.</p>";
    return;
  }

  Object.values(data).forEach((quiz) => {
    if (quiz.createdBy !== teacherEmail) return;
    const card = document.createElement("div");
    card.className = "p-4 bg-white rounded shadow cursor-pointer";
    card.innerHTML = `<h3 class="font-semibold">${quiz.title}</h3><p class="text-sm">${quiz.department} • ${quiz.classLevel} • ${quiz.timeLimit} min</p>`;
    card.onclick = () => openQuizResults(quiz.quizId, quiz.title);
    quizListDiv.appendChild(card);
  });
});

async function openQuizResults(quizId, title) {
  modalQuizTitle.textContent = title;
  studentResults.innerHTML = "";

  const resultsSnap = await get(ref(db, `results/${quizId}`));
  if (!resultsSnap.exists()) {
    studentResults.innerHTML = "<p>No student has taken this quiz yet.</p>";
    modal.classList.remove("hidden");
    return;
  }

  const studentsObj = resultsSnap.val();

  // studentsObj: studentKey -> attemptId -> attemptData
  Object.entries(studentsObj).forEach(([studentKey, attemptsObj]) => {
    const attempts = Object.values(attemptsObj);
    const bestScore = Math.max(...attempts.map((a) => Number(a.score || 0)));
    const total = attempts[0]?.total || 0;
    const attemptsCount = attempts.length;

    const div = document.createElement("div");
    div.className = "p-3 border rounded bg-gray-50";
    div.innerHTML = `<strong>${studentKey.replace(/_/g, ".")}</strong>
      <div>Best: ${bestScore} / ${total}</div>
      <div>Attempts: ${attemptsCount}</div>
    `;
    div.onclick = () => showAttempts(attempts, studentKey);
    studentResults.appendChild(div);
  });

  modal.classList.remove("hidden");
}

function showAttempts(attempts, studentKey) {
  studentResults.innerHTML = `<h3 class="font-bold mb-2">Attempts — ${studentKey.replace(
    /_/g,
    "."
  )}</h3>`;
  attempts.forEach((a, i) => {
    const timeTaken =
      typeof a.timeTaken === "number"
        ? `${Math.floor(a.timeTaken / 60)}m ${a.timeTaken % 60}s`
        : "N/A";
    const date = a.timestamp ? new Date(a.timestamp).toLocaleString() : "-";
    const div = document.createElement("div");
    div.className = "p-2 border rounded mb-2 bg-white";
    div.innerHTML = `<div><strong>Attempt ${i + 1}</strong></div>
      <div>Score: ${a.score}/${a.total}</div>
      <div>Time used: ${timeTaken}</div>
      <div>Date: ${date}</div>`;
    studentResults.appendChild(div);
  });
}

closeModal.onclick = () => modal.classList.add("hidden");
