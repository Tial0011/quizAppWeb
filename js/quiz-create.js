// js/quiz-create.js
import { db, ref, push, set } from "./firebase-config.js";

document.addEventListener("DOMContentLoaded", () => {
  const teacherEmail = localStorage.getItem("teacherEmail");
  if (!teacherEmail)
    return (window.location.href = "../auth/teacher-auth.html");

  const form = document.getElementById("createQuizForm");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const title = document.getElementById("quizTitle").value.trim();
    const department = document.getElementById("quizDept").value;
    const classLevel = document.getElementById("quizClass").value;
    const timeLimit =
      Number(document.getElementById("quizDuration").value) || 1;

    if (!title || !department || !classLevel) {
      alert("Fill all fields.");
      return;
    }

    const quizRef = push(ref(db, "quizzes"));
    const quizId = quizRef.key;

    await set(quizRef, {
      quizId,
      title,
      department,
      classLevel,
      timeLimit,
      createdBy: teacherEmail,
      createdAt: Date.now(),
    });

    localStorage.setItem("currentQuizId", quizId);
    localStorage.setItem("currentQuizTitle", title);

    window.location.href = "teacher-add-questions.html";
  });
});
