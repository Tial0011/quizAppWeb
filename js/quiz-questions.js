import { db, ref, push, set, get } from "./firebase-config.js";

const quizId = localStorage.getItem("currentQuizId");
const quizTitleEl = document.getElementById("quizTitle");
const statusEl = document.getElementById("status");

if (!quizId) window.location.href = "./teacher-create-quiz.html";

const quizRef = ref(db, `quizzes/${quizId}`);

// Load quiz title
get(quizRef).then((snap) => {
  if (snap.exists()) {
    quizTitleEl.textContent = snap.val().title;
  }
});

// Add Question
document
  .getElementById("questionForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const question = document.getElementById("question").value.trim();
    const options = [
      document.getElementById("option1").value.trim(),
      document.getElementById("option2").value.trim(),
      document.getElementById("option3").value.trim(),
      document.getElementById("option4").value.trim(),
    ];
    const correct = document.getElementById("correct").value;

    if (!question || options.some((o) => !o) || correct === "") {
      statusEl.textContent = "⚠️ Fill all fields.";
      return;
    }

    const questionRef = push(ref(db, `quizzes/${quizId}/questions`));
    await set(questionRef, {
      question,
      options,
      correct: Number(correct),
    });

    statusEl.textContent = "✅ Question Added!";

    document.getElementById("questionForm").reset();
  });

// Finish Quiz
document.getElementById("finishBtn").addEventListener("click", () => {
  localStorage.removeItem("currentQuizId");
  localStorage.removeItem("currentQuizTitle");
  window.location.href = "./teacher-dashboard.html";
});
