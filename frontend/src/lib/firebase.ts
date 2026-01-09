import { initializeApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";

const showError = (message: string, context?: any) => {
  console.error(message, context);
  const errorDiv = document.createElement("div");
  errorDiv.style.position = "fixed";
  errorDiv.style.top = "0";
  errorDiv.style.left = "0";
  errorDiv.style.width = "100%";
  errorDiv.style.backgroundColor = "red";
  errorDiv.style.color = "white";
  errorDiv.style.padding = "20px";
  errorDiv.style.zIndex = "9999";
  errorDiv.style.fontFamily = "monospace";
  errorDiv.innerText = "FIREBASE INIT ERROR: " + message + "\n\n" + JSON.stringify(context, null, 2);
  document.body.appendChild(errorDiv);
};

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

let app;
let auth: Auth;

try {
  if (!firebaseConfig.apiKey) {
    throw new Error("Missing VITE_FIREBASE_API_KEY");
  }
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  console.log("Firebase initialized successfully");
} catch (error: any) {
  showError(error.message, { config: firebaseConfig });
  throw error;
}

export { auth };

