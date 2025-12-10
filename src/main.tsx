import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { BrowserRouter } from "react-router-dom";

// GitHub Pages base path
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter basename="/chatgpt-rewind">
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
