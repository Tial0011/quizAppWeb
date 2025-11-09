import { db, ref, push, set } from "./firebase-config.js";

const teacherEmail = localStorage.getItem("teacherEmail");

// Redirect if not logged in
if (!teacherEmail) {
  window.location.href = "../auth/teacher-auth.html";
}

const form = document.getElementById("createQuizForm");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const title = document.getElementById("quizTitle").value.trim();
  const department = document.getElementById("quizDept").value;
  const classLevel = document.getElementById("quizClass").value;
  const duration = document.getElementById("quizDuration").value.trim();

  if (!title || !department || !classLevel || !duration) {
    alert("Fill all fields before proceeding");
    return;
  }

  // Create quiz record
  const quizRef = push(ref(db, "quizzes"));

  await set(quizRef, {
    id: quizRef.key,
    title,
    department,
    classLevel,
    timeLimit: duration,
    createdBy: teacherEmail,
    createdAt: Date.now(),
  });

  // Store quiz ID for next page (Add Questions)
  localStorage.setItem("currentQuizId", quizRef.key);

  alert("✅ Quiz Created Successfully! Now add questions.");
  window.location.href = "./teacher-add-questions.html";
});
