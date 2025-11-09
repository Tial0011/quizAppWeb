// js/teacher-auth.js
import { db, ref, set, get } from "./firebase-config.js";

const signupForm = document.getElementById("teacher-signup");
const loginForm = document.getElementById("teacher-login");
const toLoginBtn = document.getElementById("to-login");
const toSignupBtn = document.getElementById("to-signup");
const feedback = document.getElementById("auth-feedback");

// helpers
const emailKey = (email) => email.trim().toLowerCase().replace(/\./g, "_");

toLoginBtn.addEventListener("click", () => {
  signupForm.classList.add("hidden");
  loginForm.classList.remove("hidden");
  feedback.textContent = "";
});
toSignupBtn.addEventListener("click", () => {
  loginForm.classList.add("hidden");
  signupForm.classList.remove("hidden");
  feedback.textContent = "";
});

// SIGNUP
signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  feedback.textContent = "";
  const name = document.getElementById("signup-name").value.trim();
  const email = document.getElementById("signup-email").value.trim();
  const password = document.getElementById("signup-password").value;
  const code = document.getElementById("signup-stc").value.trim();

  if (!name || !email || !password || !code) {
    feedback.textContent = "Fill all fields.";
    return;
  }

  // read secret code from settings
  const settingsRef = ref(db, "settings/secretCode");
  const snap = await get(settingsRef);
  const stored = snap.exists() ? snap.val() : null;

  if (!stored || code !== stored) {
    feedback.textContent = "Wrong secret code.";
    return;
  }

  const key = emailKey(email);
  const teacherRef = ref(db, `teachers/${key}`);
  await set(teacherRef, {
    name,
    email: key,
    password,
    // optional profile fields; teacher will set later
    department: "",
    classLevel: "",
    id: key,
  });

  // store minimal session and redirect
  localStorage.setItem("teacherEmail", key);
  window.location.href = "../teacher/teacher-dashboard.html";
});

// LOGIN
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  feedback.textContent = "";
  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;
  if (!email || !password) {
    feedback.textContent = "Fill all fields.";
    return;
  }
  const key = emailKey(email);
  const teacherRef = ref(db, `teachers/${key}`);
  const snap = await get(teacherRef);
  if (!snap.exists() || snap.val().password !== password) {
    feedback.textContent = "Invalid credentials.";
    return;
  }

  localStorage.setItem("teacherEmail", key);
  window.location.href = "../teacher/teacher-dashboard.html";
});
