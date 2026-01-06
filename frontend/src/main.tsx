import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";


console.log("Main.tsx: Starting render...");
const rootElement = document.getElementById("root");
console.log("Main.tsx: Root element:", rootElement);

if (rootElement) {
    createRoot(rootElement).render(<App />);
    console.log("Main.tsx: App rendered");
} else {
    console.error("Main.tsx: Root element not found!");
}
