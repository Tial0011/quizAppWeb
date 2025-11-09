// js/student-take-quiz.js
import { db, ref, onValue, get, push, set } from "./firebase-config.js";

const studentKey = localStorage.getItem("studentEmail");
if (!studentKey) {
  alert("You must be logged in to take the quiz.");
  window.location.href = "../auth/student-auth.html";
}

const urlParams = new URLSearchParams(location.search);
const quizQuery = urlParams.get("quiz"); // optional preselect

// UI
const quizListEl = document.getElementById("quizList");
const quizBox = document.getElementById("quizBox");
const quizTitleEl = document.getElementById("quizTitle");
const timerEl = document.getElementById("timer");
const questionArea = document.getElementById("questionArea");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const submitBtn = document.getElementById("submitBtn");
const statusArea = document.getElementById("statusArea");
const quizSelection = document.getElementById("quizSelection");

let quizzes = [];
let questions = [];
let quizId = null;
let currentIndex = 0;
let score = 0;
let timeLimit = 0; // minutes
let originalTimeSeconds = 0;
let timeLeftSeconds = 0;
let timerInterval = null;
let submitted = false;

// helper
const emailKey = (email) => email.replace(/\./g, "_");

// load quizzes (for this student's dept/class)
async function loadAvailable() {
  const studentSnap = await get(ref(db, "students/" + studentKey));
  if (!studentSnap.exists()) {
    alert("Student record missing");
    localStorage.removeItem("studentEmail");
    return (window.location.href = "../auth/student-auth.html");
  }
  const student = studentSnap.val();
  onValue(ref(db, "quizzes"), (qsnap) => {
    const data = qsnap.val() || {};
    quizzes = Object.values(data).filter(
      (q) =>
        q.department === student.department &&
        q.classLevel === student.classLevel
    );
    renderQuizList();
    // if quiz was provided in URL and exists → start directly
    if (quizQuery) {
      const qObj = quizzes.find((q) => q.quizId === quizQuery);
      if (qObj) startQuiz(qObj.quizId);
    }
  });
}
function renderQuizList() {
  if (!quizzes || quizzes.length === 0) {
    quizListEl.innerHTML =
      "<p class='text-sm text-gray-600'>No quizzes available</p>";
    return;
  }
  quizListEl.innerHTML = quizzes
    .map(
      (q) => `
    <div class="p-3 border rounded flex justify-between items-center">
      <div>
        <div class="font-semibold">${q.title}</div>
        <div class="text-xs text-gray-500">${q.timeLimit} min</div>
      </div>
      <button data-id="${q.quizId}" class="startBtn bg-blue-600 text-white px-3 py-1 rounded">Start</button>
    </div>
  `
    )
    .join("");
  document
    .querySelectorAll(".startBtn")
    .forEach((b) => (b.onclick = () => startQuiz(b.dataset.id)));
}

async function startQuiz(id) {
  if (!id) return;
  quizId = id;
  // fetch quiz meta
  const qsnap = await get(ref(db, "quizzes/" + quizId));
  if (!qsnap.exists()) return alert("Quiz not found.");
  const qmeta = qsnap.val();
  quizTitleEl.textContent = qmeta.title || "Quiz";
  timeLimit = Number(qmeta.timeLimit) || 1;
  originalTimeSeconds = timeLimit * 60;
  timeLeftSeconds = originalTimeSeconds;

  // load questions
  const qListSnap = await get(ref(db, `questions/${quizId}`));
  if (!qListSnap.exists()) {
    return alert("No questions found for this quiz.");
  }
  // questions stored as object => convert to array and keep order of push keys
  const qObj = qListSnap.val();
  questions = Object.values(qObj).map((item) => ({
    question: item.question,
    options: item.options,
    correct: Number(item.correct),
  }));
  if (questions.length === 0) return alert("No questions yet.");

  // UI toggle
  quizSelection.classList.add("hidden");
  quizBox.classList.remove("hidden");
  currentIndex = 0;
  score = 0;
  submitted = false;
  renderQuestion();
  startTimer();
  statusArea.textContent = "";
}

function startTimer() {
  clearInterval(timerInterval);
  timeLeftSeconds = originalTimeSeconds;
  updateTimerDisplay();
  timerInterval = setInterval(() => {
    timeLeftSeconds--;
    updateTimerDisplay();
    if (timeLeftSeconds <= 0) {
      clearInterval(timerInterval);
      autoSubmit("Time expired");
    }
  }, 1000);
}
function updateTimerDisplay() {
  const m = Math.floor(timeLeftSeconds / 60);
  const s = timeLeftSeconds % 60;
  timerEl.textContent = `${m.toString().padStart(2, "0")}:${s
    .toString()
    .padStart(2, "0")}`;
}

// render a single question
function renderQuestion() {
  const q = questions[currentIndex];
  questionArea.innerHTML = `
    <div>
      <div class="font-semibold mb-2">Q${currentIndex + 1}. ${q.question}</div>
      <div class="space-y-2">
        ${q.options
          .map(
            (o, i) => `
          <label class="block p-2 border rounded cursor-pointer">
            <input type="radio" name="option" value="${i}" class="mr-2" />
            ${String.fromCharCode(65 + i)}. ${o}
          </label>`
          )
          .join("")}
      </div>
    </div>
  `;
  prevBtn.disabled = currentIndex === 0;
  nextBtn.classList.toggle("hidden", currentIndex === questions.length - 1);
  submitBtn.classList.toggle("hidden", currentIndex !== questions.length - 1);
}

prevBtn.onclick = () => {
  if (currentIndex > 0) {
    saveAnswerLocal(currentIndex); // keep local record
    currentIndex--;
    renderQuestion();
  }
};
nextBtn.onclick = () => {
  checkAndStoreAnswer(currentIndex);
  currentIndex++;
  renderQuestion();
};
submitBtn.onclick = () => finishQuiz("Submitted");

// simple client-side answer storage (optional)
const localAnswersKey = (qId) => `answers_${qId}_${studentKey}`;
function saveAnswerLocal(idx) {
  const sel = document.querySelector('input[name="option"]:checked');
  const existing = JSON.parse(
    localStorage.getItem(localAnswersKey(quizId)) || "{}"
  );
  if (sel) existing[idx] = Number(sel.value);
  localStorage.setItem(localAnswersKey(quizId), JSON.stringify(existing));
}
function loadAnswerLocal(idx) {
  const existing = JSON.parse(
    localStorage.getItem(localAnswersKey(quizId)) || "{}"
  );
  return existing[idx];
}

// check selected answer and update localAnswers
function checkAndStoreAnswer(idx) {
  const sel = document.querySelector('input[name="option"]:checked');
  const existing = JSON.parse(
    localStorage.getItem(localAnswersKey(quizId)) || "{}"
  );
  existing[idx] = sel ? Number(sel.value) : null;
  localStorage.setItem(localAnswersKey(quizId), JSON.stringify(existing));
}

// when rendering question, pre-check previously saved answer
function prefillSelected() {
  const val = loadAnswerLocal(currentIndex);
  if (typeof val === "number") {
    const radio = document.querySelector(
      `input[name="option"][value="${val}"]`
    );
    if (radio) radio.checked = true;
  }
}

// after renderQuestion call, call prefillSelected
// update renderQuestion to call prefill:
const originalRenderQuestion = renderQuestion;
renderQuestion = function () {
  originalRenderQuestion();
  prefillSelected();
};

// final scoring and push result
async function finishQuiz(reason = "Finished") {
  if (submitted) return;
  submitted = true;
  clearInterval(timerInterval);
  // ensure last answer saved
  checkAndStoreAnswer(currentIndex);

  const answers = JSON.parse(
    localStorage.getItem(localAnswersKey(quizId)) || "{}"
  );
  let computedScore = 0;
  questions.forEach((q, i) => {
    const ans = answers[i];
    if (typeof ans === "number" && ans === q.correct) computedScore++;
  });

  const timeTaken = originalTimeSeconds - timeLeftSeconds;
  const attempt = {
    score: computedScore,
    total: questions.length,
    timeTaken: Number(timeTaken), // seconds - numeric
    timestamp: Date.now(),
  };

  // write to results/quizId/studentKey/<attemptPushKey>
  try {
    const studentResultsRef = ref(db, `results/${quizId}/${studentKey}`);
    const newAttemptRef = push(studentResultsRef);
    await set(newAttemptRef, attempt);
    // clear local answers for this quiz
    localStorage.removeItem(localAnswersKey(quizId));

    statusArea.textContent = `Score: ${computedScore}/${
      questions.length
    } • Time: ${Math.floor(timeTaken / 60)}m ${timeTaken % 60}s`;
    alert(`Quiz finished — Score: ${computedScore}/${questions.length}`);
    // redirect back to dashboard after short delay so user can press back or view status
    setTimeout(() => {
      window.location.href = "student-dashboard.html";
    }, 800);
  } catch (err) {
    console.error("Error saving result:", err);
    alert("Could not save your result. Check connection and try again.");
    submitted = false;
  }
}

// auto-submit (called when time up or tab hidden)
async function autoSubmit(reason = "AutoSubmit") {
  // quick message + finish
  statusArea.textContent = reason + " — saving...";
  await finishQuiz(reason);
}

// save on tab visibility change (only once)
document.addEventListener("visibilitychange", () => {
  if (document.hidden && quizId && !submitted && timeLeftSeconds > 0) {
    // auto submit immediately (this will call finishQuiz)
    statusArea.textContent = "Tab hidden — submitting...";
    autoSubmit("Left tab - auto-submitted");
  }
});

// ensure start-up
loadAvailable();
