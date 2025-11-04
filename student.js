// ===============================
// ✅ STUDENT.JS — Final with Working Back Button
// ===============================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import {
  getDatabase,
  ref,
  get,
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-database.js";

// ✅ Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAgcz_IFkScwD95wHmROPfigtXUIRvXb-Q",
  authDomain: "quizappweb-6fb8c.firebaseapp.com",
  projectId: "quizappweb-6fb8c",
  storageBucket: "quizappweb-6fb8c.firebasestorage.app",
  messagingSenderId: "420307677623",
  appId: "1:420307677623:web:364a3a4491462cf7a8f832",
  measurementId: "G-ECD70PVFSN",
  databaseURL: "https://quizappweb-6fb8c-default-rtdb.firebaseio.com",
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// ✅ Initialize EmailJS
emailjs.init("yIQvdf_m7tJlCpJKj");

// ===============================
// 🔹 DOM ELEMENTS
// ===============================
const form = document.getElementById("studentForm");
const topicSelect = document.getElementById("topicSelect");
const questionArea = document.getElementById("questionArea");
const timerDisplay = document.getElementById("timer");
const resultSection = document.getElementById("resultSection");
const scoreText = document.getElementById("scoreText");
const missedDiv = document.getElementById("missedQuestions");
const backBtn = document.getElementById("backBtn");

let quizData = null;
let timer = null;
let timeLeft = 0;
let quizStarted = false;
let submitted = false;

// ===============================
// 📚 LOAD QUIZ TOPICS
// ===============================
async function loadTopics() {
  const snapshot = await get(ref(db, "quizzes"));
  topicSelect.innerHTML = `<option value="">Select a quiz</option>`;

  if (snapshot.exists()) {
    const data = snapshot.val();
    Object.keys(data).forEach((topic) => {
      const opt = document.createElement("option");
      opt.value = topic;
      opt.textContent = topic;
      topicSelect.appendChild(opt);
    });
  } else {
    const opt = document.createElement("option");
    opt.textContent = "No quizzes available yet";
    topicSelect.appendChild(opt);
  }
}
loadTopics();

// ===============================
// 🧠 WHEN TOPIC IS SELECTED
// ===============================
topicSelect.addEventListener("change", async (e) => {
  const selectedTopic = e.target.value;
  if (!selectedTopic) return;

  const topicRef = ref(db, "quizzes/" + selectedTopic);
  const snapshot = await get(topicRef);

  if (snapshot.exists()) {
    quizData = snapshot.val();
    renderQuestions(quizData.questions);
    startTimer(quizData.quizTimer || 1);
    resultSection.classList.add("hidden");
    backBtn.classList.add("hidden");
    quizStarted = true;
    submitted = false;
  } else {
    alert("❌ Quiz not found for this topic.");
  }
});

// ===============================
// 📝 RENDER QUESTIONS
// ===============================
function renderQuestions(questions) {
  questionArea.innerHTML = "";
  questions.forEach((q, index) => {
    const optionsHTML = q.options
      .map(
        (opt, i) => `
        <label class="block bg-gray-100 rounded-lg px-3 py-2 hover:bg-blue-100 cursor-pointer">
          <input type="radio" name="q${index}" value="${String.fromCharCode(
          65 + i
        )}" class="mr-2" />
          ${String.fromCharCode(65 + i)}. ${opt}
        </label>
      `
      )
      .join("");

    const div = document.createElement("div");
    div.className = "border border-gray-200 rounded-lg p-4 bg-white";
    div.innerHTML = `
      <p class="font-semibold mb-2">${index + 1}. ${q.q}</p>
      ${optionsHTML}
    `;
    questionArea.appendChild(div);
  });
}

// ===============================
// ⏳ TIMER FUNCTION
// ===============================
function startTimer(minutes) {
  clearInterval(timer);
  timeLeft = minutes * 60;
  timerDisplay.classList.remove("hidden");

  timer = setInterval(() => {
    if (timeLeft <= 0) {
      clearInterval(timer);
      timerDisplay.textContent = "⏰ Time’s up!";
      form.requestSubmit();
      return;
    }
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    timerDisplay.textContent = `⏱️ Time left: ${mins}:${secs
      .toString()
      .padStart(2, "0")}`;
    timeLeft--;
  }, 1000);
}

// ===============================
// 🚨 AUTO SUBMIT ON TAB SWITCH
// ===============================
window.addEventListener("visibilitychange", () => {
  if (document.hidden && quizStarted && !submitted && timeLeft > 0) {
    alert("⚠️ You switched tabs! Your quiz will be auto-submitted now.");
    form.requestSubmit();
  }
});

// ===============================
// 📤 HANDLE QUIZ SUBMISSION + POPUP
// ===============================
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (submitted) return;
  submitted = true;
  clearInterval(timer);

  if (!quizData) {
    alert("Please select a quiz first!");
    submitted = false;
    return;
  }

  const studentName = document.getElementById("studentName").value.trim();
  if (!studentName) {
    alert("Please enter your name before submitting.");
    submitted = false;
    return;
  }

  let score = 0;
  const missed = [];

  quizData.questions.forEach((q, i) => {
    const selected = document.querySelector(`input[name="q${i}"]:checked`);
    const ans = selected ? selected.value : null;

    if (ans === q.correct) {
      score++;
    } else {
      missed.push(
        `Q${i + 1}: ${q.q}\n✅ Correct: ${q.correct} (${
          q.options[q.correct.charCodeAt(0) - 65]
        })`
      );
    }
  });

  // 🧾 Show Results
  scoreText.textContent = `✅ Your Score: ${score}/${quizData.questions.length}`;
  missedDiv.innerHTML =
    missed.length > 0
      ? missed
          .map(
            (m) =>
              `<p class="mb-1 border-b border-gray-200 pb-1 text-sm text-gray-700 whitespace-pre-line">${m}</p>`
          )
          .join("")
      : "<p class='text-green-600 font-medium'>Perfect score! 🎉</p>";

  resultSection.classList.remove("hidden");
  backBtn.classList.remove("hidden");

  form
    .querySelectorAll("input, select, button")
    .forEach((el) => (el.disabled = true));

  // ===============================
  // 💬 CREATE POPUP OVERLAY
  // ===============================
  const overlay = document.createElement("div");
  overlay.id = "sendingOverlay";
  overlay.style.position = "fixed";
  overlay.style.inset = "0";
  overlay.style.background = "rgba(0,0,0,0.5)";
  overlay.style.display = "flex";
  overlay.style.alignItems = "center";
  overlay.style.justifyContent = "center";
  overlay.style.zIndex = "9999";
  overlay.style.opacity = "0";
  overlay.style.transition = "opacity 0.5s ease";
  document.body.appendChild(overlay);

  requestAnimationFrame(() => (overlay.style.opacity = "1"));

  overlay.innerHTML = `
    <div style="
      background: white;
      padding: 24px;
      border-radius: 12px;
      width: 280px;
      text-align: center;
      box-shadow: 0 5px 15px rgba(0,0,0,0.3);
      transition: transform 0.3s ease;
      transform: scale(0.9);
    ">
      <p id="sendingText" style="font-weight:600;font-size:16px;margin-bottom:10px;">📤 Sending your answers...</p>
      <div style="width:100%;background:#eee;border-radius:8px;overflow:hidden;height:10px;">
        <div id="progressBar" style="width:0%;height:10px;background:#3b82f6;transition:width 0.25s ease-out;"></div>
      </div>
    </div>
  `;

  let progress = 0;
  const progressInterval = setInterval(() => {
    progress += Math.random() * 2;
    if (progress > 95) progress = 95;
    document.getElementById("progressBar").style.width = progress + "%";
  }, 300);

  try {
    await emailjs.send("service_pjmpsna", "template_rbur9zv", {
      student_name: studentName,
      score: score,
      total: quizData.questions.length,
      missed_questions: missed.join("\n\n"),
      to_email: quizData.teacherEmail,
    });

    clearInterval(progressInterval);
    document.getElementById("progressBar").style.width = "100%";
    document.getElementById("sendingText").textContent =
      "✅ Sent successfully!";

    // 🕒 Wait, then fade & remove overlay safely
    setTimeout(() => {
      overlay.style.opacity = "0";
      setTimeout(() => {
        overlay.remove();
        backBtn.disabled = false;
      }, 500);
      alert("📩 Results sent successfully to your teacher!");
    }, 1500);
  } catch (err) {
    clearInterval(progressInterval);
    document.getElementById("sendingText").textContent =
      "⚠️ Failed to send. Check connection.";
    document.getElementById("progressBar").style.background = "#ef4444";
    console.error("EmailJS Error:", err);

    setTimeout(() => {
      overlay.style.opacity = "0";
      setTimeout(() => {
        overlay.remove();
        backBtn.disabled = false;
      }, 500);
    }, 2000);
    alert("⚠️ Could not send results via email.");
  }
});

// ===============================
// 🏠 BACK TO HOME (always works)
// ===============================
if (backBtn) {
  backBtn.addEventListener("click", (e) => {
    e.preventDefault();
    // Double safety: remove any leftover overlay first
    const overlay = document.getElementById("sendingOverlay");
    if (overlay) overlay.remove();
    window.location.href = "index.html";
  });
}
