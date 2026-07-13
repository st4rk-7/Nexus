// main.jsx — the entry point. It grabs the empty <div id="root"> from
// index.html and tells React to render our <App /> inside it.

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css"; // load the base styles + design tokens

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
