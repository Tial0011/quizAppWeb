// ===============================
// ✅ teacher.js — Fixed Version
// ===============================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import {
  getDatabase,
  ref,
  set,
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-database.js";

// ✅ Firebase Configuration
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

// 🎯 DOM Elements
const form = document.getElementById("setQuestionForm");
const addQuestionBtn = document.getElementById("addQuestionBtn");
const questionsContainer = document.getElementById("questionsContainer");

// ✅ Prevent duplicate listeners
const newAddBtn = addQuestionBtn.cloneNode(true);
addQuestionBtn.parentNode.replaceChild(newAddBtn, addQuestionBtn);

// ➕ Add new question block (only once per click)
newAddBtn.addEventListener("click", () => {
  const questionIndex = questionsContainer.children.length + 1;

  const questionDiv = document.createElement("div");
  questionDiv.className =
    "border border-gray-300 rounded-lg p-4 mb-4 shadow-sm bg-white";

  questionDiv.innerHTML = `
    <label class="block font-medium text-gray-700 mb-1">Question ${questionIndex}</label>
    <input type="text" placeholder="Enter question" required class="questionText w-full border border-gray-300 rounded-lg px-3 py-2 mb-3 focus:ring-2 focus:ring-blue-400 focus:outline-none"/>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <input type="text" placeholder="Option A" required class="optionA border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"/>
      <input type="text" placeholder="Option B" required class="optionB border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"/>
      <input type="text" placeholder="Option C" required class="optionC border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"/>
      <input type="text" placeholder="Option D" required class="optionD border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"/>
    </div>

    <label class="block mt-3 text-sm font-semibold">Correct Answer:</label>
    <select class="correctAnswer border rounded px-2 py-1">
      <option value="A">A</option>
      <option value="B">B</option>
      <option value="C">C</option>
      <option value="D">D</option>
    </select>
  `;

  questionsContainer.appendChild(questionDiv);
});

// 💾 Save quiz to Firebase
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const teacherEmail = document.getElementById("teacherEmail").value.trim();
  const topicName = document.getElementById("topicName").value.trim();
  const quizTimer = parseInt(document.getElementById("quizTimer").value);

  if (!teacherEmail || !topicName || !quizTimer) {
    alert("⚠️ Please fill in all fields.");
    return;
  }

  const questionBlocks = document.querySelectorAll("#questionsContainer > div");
  const questions = [];

  questionBlocks.forEach((block) => {
    const q = block.querySelector(".questionText")?.value.trim();
    const optionA = block.querySelector(".optionA")?.value.trim();
    const optionB = block.querySelector(".optionB")?.value.trim();
    const optionC = block.querySelector(".optionC")?.value.trim();
    const optionD = block.querySelector(".optionD")?.value.trim();
    const correct = block.querySelector(".correctAnswer")?.value;

    if (q && optionA && optionB && optionC && optionD && correct) {
      questions.push({
        q,
        options: [optionA, optionB, optionC, optionD],
        correct,
      });
    }
  });

  if (questions.length === 0) {
    alert("⚠️ Please add at least one complete question.");
    return;
  }

  try {
    const quizRef = ref(db, "quizzes/" + topicName);
    await set(quizRef, {
      teacherEmail,
      quizTimer,
      questions,
    });

    alert("✅ Quiz saved successfully!");
    form.reset();
    questionsContainer.innerHTML = "";
  } catch (err) {
    console.error("❌ Error saving quiz:", err);
    alert("❌ Failed to save quiz: " + err.message);
  }
});
