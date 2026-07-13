// vite.config.js — configures the dev server that runs our React app.
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // Teach Vite how to understand React (JSX) files.
  plugins: [react()],
  server: {
    port: 5173,
    // --- Proxy ------------------------------------------------------------
    // Our React app runs on :5173, the backend API on :3000. Browsers block
    // a page on one port from calling another (CORS). This proxy makes the
    // frontend forward any request starting with "/api" to the backend, so
    // from the browser's view everything comes from the same place.
    proxy: {
      "/api": "http://localhost:3000",
    },
  },
});
