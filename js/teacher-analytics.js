import { db, ref, onValue } from "./firebase-config.js";

const teacherID = localStorage.getItem("teacherID");
const studentList = document.getElementById("studentList");

if (!teacherID) {
  alert("Login expired. Login again.");
  window.location.href = "../auth/teacher-auth.html";
}

// Load all registered students
onValue(ref(db, "students"), (snapshot) => {
  studentList.innerHTML = "";

  snapshot.forEach((user) => {
    const s = user.val();

    const studentCard = document.createElement("div");
    studentCard.className =
      "border p-4 rounded-xl bg-gray-50 hover:bg-gray-100 cursor-pointer transition";

    studentCard.innerHTML = `
      <h3 class="text-lg font-semibold">${s.name}</h3>
      <p class="text-sm text-gray-600">${s.dept} · ${s.className}</p>

      <div class="hidden performance mt-4 border-t pt-3 space-y-3"></div>
      <canvas class="hidden chart h-48"></canvas>
    `;

    const perfDiv = studentCard.querySelector(".performance");
    const chartCanvas = studentCard.querySelector(".chart");
    let chartInstance = null;

    studentCard.addEventListener("click", () => {
      perfDiv.classList.toggle("hidden");
      chartCanvas.classList.toggle("hidden");

      // Load this student's results across all quizzes
      onValue(ref(db, "quiz_results"), (quizSnap) => {
        perfDiv.innerHTML = "";
        let records = [];

        quizSnap.forEach((quiz) => {
          quiz.forEach((attempt) => {
            const result = attempt.val();
            if (result.studentID === user.key) records.push(result);
          });
        });

        if (records.length === 0) {
          perfDiv.innerHTML = `<p class="text-sm text-gray-500">No activity yet.</p>`;
          return;
        }

        // Display list format
        records.forEach((r) => {
          const box = document.createElement("div");
          box.className =
            "p-2 bg-white shadow-sm rounded border text-sm flex justify-between";
          box.innerHTML = `
            <span>${r.quizTitle}</span>
            <span class="font-bold">${r.score}/${r.total}</span>
          `;
          perfDiv.appendChild(box);
        });

        // Prepare Chart Data
        const labels = records.map((r) => r.quizTitle);
        const scores = records.map((r) =>
          ((r.score / r.total) * 100).toFixed(0)
        );

        if (chartInstance) chartInstance.destroy(); // Prevent duplicates

        chartInstance = new Chart(chartCanvas, {
          type: "line",
          data: {
            labels,
            datasets: [
              {
                label: "Score (%)",
                data: scores,
                borderWidth: 2,
                tension: 0.4,
              },
            ],
          },
          options: {
            scales: {
              y: { beginAtZero: true, max: 100 },
            },
          },
        });
      });
    });

    studentList.appendChild(studentCard);
  });
});
