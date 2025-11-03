// =======================
// Firebase Configuration
// =======================

// Import from Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
  getDatabase,
  ref,
  set,
  push,
  onValue,
  get,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

// 🔥 Your Firebase Config (from earlier)
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

// Export for use in other JS files
export { db, ref, set, push, onValue, get };
