// js/student-auth.js
import { db, ref, set, get, child } from "./firebase-config.js";

const signupForm = document.getElementById("student-signup");
const loginForm = document.getElementById("student-login");
const showLogin = document.getElementById("show-login");
const showSignup = document.getElementById("show-signup");

showLogin.onclick = () => {
  signupForm.classList.add("hidden");
  loginForm.classList.remove("hidden");
};
showSignup.onclick = () => {
  loginForm.classList.add("hidden");
  signupForm.classList.remove("hidden");
};

function emailKey(email) {
  return email.replace(/\./g, "_");
}

// SIGNUP
signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("signup-name").value.trim();
  const email = document
    .getElementById("signup-email")
    .value.trim()
    .toLowerCase();
  const dept = document.getElementById("signup-dept").value;
  const classLevel = document.getElementById("signup-class").value;
  const password = document.getElementById("signup-password").value;

  if (!name || !email || !dept || !classLevel || !password) {
    return alert("Please fill in all fields.");
  }

  const key = emailKey(email);
  const studentRef = ref(db, "students/" + key);
  const snapshot = await get(studentRef);
  if (snapshot.exists()) {
    return alert("Account already exists. Please log in.");
  }

  await set(studentRef, {
    name,
    email: key,
    department: dept,
    classLevel,
    password,
    createdAt: Date.now(),
  });

  // auto-login
  localStorage.setItem("studentEmail", key);
  window.location.href = "../student/student-dashboard.html";
});

// LOGIN
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document
    .getElementById("login-email")
    .value.trim()
    .toLowerCase();
  const password = document.getElementById("login-password").value;
  if (!email || !password) return alert("Fill both fields.");
  const key = emailKey(email);
  const studRef = ref(db, "students/" + key);
  const snap = await get(studRef);
  if (!snap.exists() || snap.val().password !== password) {
    return alert("Invalid credentials.");
  }
  localStorage.setItem("studentEmail", key);
  window.location.href = "../student/student-dashboard.html";
});
