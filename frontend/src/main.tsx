import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
// impoting App.css
import "./App.css";

createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
