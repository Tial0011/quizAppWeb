// js/teacher-student-profiles.js
import { db, ref, onValue, get } from "./firebase-config.js";

const teacherEmail = localStorage.getItem("teacherEmail");
const studentTable = document.getElementById("studentTable");

if (!teacherEmail) window.location.href = "../auth/teacher-auth.html";

// load students
onValue(ref(db, "students"), async (snap) => {
  const students = snap.val() || {};
  const studentEntries = Object.values(students);
  if (studentEntries.length === 0) {
    studentTable.innerHTML = `<tr><td colspan="6" class="p-4 text-center">No students yet.</td></tr>`;
    return;
  }

  // load results once to compute stats
  const resultsSnap = await get(ref(db, "results"));
  const results = resultsSnap.exists() ? resultsSnap.val() : {};

  studentTable.innerHTML = studentEntries
    .map((s) => {
      const key = s.email;
      // compute attempts for this teacher
      let attemptsCount = 0;
      let sumScore = 0;
      let sumTotal = 0;
      Object.values(results).forEach((quizObj) => {
        const perStudent = quizObj[key];
        if (!perStudent) return;
        Object.values(perStudent).forEach((a) => {
          if (a.teacherId === teacherEmail) {
            attemptsCount++;
            sumScore += Number(a.score || 0);
            sumTotal += Number(a.total || 0);
          }
        });
      });
      const avg = attemptsCount
        ? ((sumScore / (sumTotal || 1)) * 100).toFixed(1) + "%"
        : "-";
      return `<tr class="border-b"><td class="p-2">${
        s.name
      }</td><td class="p-2">${s.email.replace(/_/g, ".")}</td><td class="p-2">${
        s.department
      }</td><td class="p-2">${
        s.classLevel
      }</td><td class="p-2">${attemptsCount}</td><td class="p-2">${avg}</td></tr>`;
    })
    .join("");
});
