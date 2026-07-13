// Login.jsx — the admin login form.
// It collects a username + password, POSTs them to the backend, and on
// success hands the returned JWT token up to the parent via onLogin().

import { useState } from "react";

// `onLogin` is a function passed in by the parent (App). We call it with the
// token once login succeeds, so the parent can switch to the dashboard.
function Login({ onLogin }) {
  // --- State: React remembers these between redraws ---------------------
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Runs when the form is submitted (Login button or Enter key).
  async function handleSubmit(event) {
    event.preventDefault(); // stop the browser's default full-page reload
    setError("");
    setLoading(true);

    try {
      // This is our curl call, but from the browser. Vite's proxy forwards
      // "/api/..." to the backend on :3000.
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Backend replied with 400/401 — show its error message.
        setError(data.error || "Login failed");
        return;
      }

      // Success: pass the token up to App.
      onLogin(data.token, data.username);
    } catch (err) {
      // Network error (backend not running, etc.)
      setError("Could not reach the server. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 320 }}>
      <h2>Admin Login</h2>

      <div style={{ marginBottom: "0.75rem" }}>
        <label>
          Username<br />
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoFocus
          />
        </label>
      </div>

      <div style={{ marginBottom: "0.75rem" }}>
        <label>
          Password<br />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
      </div>

      {/* Only show the error box if there's an error. */}
      {error && <p style={{ color: "crimson" }}>{error}</p>}

      <button type="submit" disabled={loading}>
        {loading ? "Logging in…" : "Login"}
      </button>
    </form>
  );
}

export default Login;
