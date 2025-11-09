// js/student-progress.js
import { db, ref, onValue, get } from "./firebase-config.js";

const studentKey = localStorage.getItem("studentEmail");
if (!studentKey) {
  window.location.href = "../auth/student-auth.html";
}

const attemptList = document.getElementById("attemptList");
const ctx = document.getElementById("scoreChart").getContext("2d");

// load all results across quizzes for this student
(async function loadProgress() {
  const resnap = await get(ref(db, "results"));
  if (!resnap.exists()) {
    attemptList.innerHTML =
      "<p class='text-sm text-gray-500'>No attempts yet.</p>";
    return;
  }
  const all = resnap.val();
  // collect attempts where key path contains studentKey
  const rows = [];
  Object.entries(all).forEach(([quizId, studentsObj]) => {
    if (!studentsObj) return;
    const studentAttempts = studentsObj[studentKey];
    if (!studentAttempts) return;
    Object.values(studentAttempts).forEach((a) => {
      rows.push({ quizId, ...a });
    });
  });

  if (rows.length === 0) {
    attemptList.innerHTML =
      "<p class='text-sm text-gray-500'>No attempts yet.</p>";
    return;
  }
  // sort by timestamp
  rows.sort((a, b) => a.timestamp - b.timestamp);

  // Chart data (score over time)
  const labels = rows.map((r) => new Date(r.timestamp).toLocaleString());
  const scores = rows.map((r) => r.score);

  // render Chart.js
  new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Score",
          data: scores,
          tension: 0.2,
          fill: false,
        },
      ],
    },
  });

  attemptList.innerHTML = rows
    .map(
      (r) => `
    <div class="p-2 border-b">
      <div class="font-semibold">Quiz: ${r.quizId}</div>
      <div>Score: ${r.score}/${r.total} • Time: ${Math.floor(
        r.timeTaken / 60
      )}m ${r.timeTaken % 60}s</div>
      <div class="text-xs text-gray-500">${new Date(
        r.timestamp
      ).toLocaleString()}</div>
    </div>
  `
    )
    .join("");
})();
