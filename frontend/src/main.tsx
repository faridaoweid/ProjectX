import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App"; // Assuming App.tsx is in the same directory as main.tsx
import "bootstrap/dist/css/bootstrap.css";

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
