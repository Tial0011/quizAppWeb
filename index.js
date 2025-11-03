// index.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import {
  getDatabase,
  ref,
  set,
  push,
  get,
  child,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-database.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAgcz_IFkScwD95wHmROPfigtXUIRvXb-Q",
  authDomain: "quizappweb-6fb8c.firebaseapp.com",
  projectId: "quizappweb-6fb8c",
  storageBucket: "quizappweb-6fb8c.firebasestorage.app",
  messagingSenderId: "420307677623",
  appId: "1:420307677623:web:364a3a4491462cf7a8f832",
  measurementId: "G-ECD70PVFSN",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Initialize EmailJS
(function () {
  emailjs.init({
    publicKey: "yIQvdf_m7tJlCpJKj",
  });
})();

// Export db for reuse in other scripts
export { db, ref, set, push, get, child };
