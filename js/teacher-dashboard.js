import { db, ref, get, onValue } from "./firebase-config.js";

const teacherEmail = localStorage.getItem("teacherEmail");
if (!teacherEmail) window.location.href = "../auth/teacher-auth.html";

const teacherNameEl = document.getElementById("teacherName");
const quizCount = document.getElementById("quizCount");
const submissionCount = document.getElementById("submissionCount");
const teacherDeptClass = document.getElementById("teacherDeptClass");
const quizList = document.getElementById("quizList");

get(ref(db, "teachers/" + teacherEmail)).then((snap) => {
  const t = snap.val();
  teacherNameEl.textContent = t.name;
  teacherDeptClass.textContent = `${t.department} / ${t.classLevel}`;
});

onValue(ref(db, "quizzes"), (snap) => {
  quizList.innerHTML = "";
  const quizzes = snap.val() || {};
  const teacherQuizzes = Object.values(quizzes).filter(
    (q) => q.createdBy === teacherEmail
  );

  quizCount.textContent = teacherQuizzes.length;

  teacherQuizzes.forEach((q) => {
    quizList.innerHTML += `
      <tr class="border-b">
        <td class="p-3">${q.title}</td>
        <td class="p-3">${q.department}</td>
        <td class="p-3">${q.classLevel}</td>
        <td class="p-3">${q.timeLimit} mins</td>
      </tr>
    `;
  });
});

onValue(ref(db, "results"), (snap) => {
  const data = snap.val() || {};
  let count = 0;
  Object.values(data).forEach((x) => (count += Object.keys(x).length));
  submissionCount.textContent = count;
});

document.getElementById("logoutBtn").onclick = () => {
  localStorage.removeItem("teacherEmail");
  window.location.href = "../auth/teacher-auth.html";
};
