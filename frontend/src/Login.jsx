// Login.jsx — the admin login form.
// It collects a username + password, POSTs them to the backend, and on
// success hands the returned JWT token up to the parent via onLogin().

import { useState } from "react";
import { NexusLogo } from "./NexusLogo.jsx";

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
    <section className="login">
      {/* Red field with the logo at the bottom. */}
      <div className="login-mark">
        <span />
        <NexusLogo inverse size={88} className="login-logo" />
      </div>

      <div className="login-panel">
        <h1>Firmware control</h1>
        <p>Register devices, ship firmware over the air, and see what every device runs.</p>

        <form onSubmit={handleSubmit}>
          <label className="field">
            <span>Username</span>
            <input value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" autoFocus required />
          </label>
          <label className="field">
            <span>Password</span>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
          </label>

          {/* Only show the error if there is one. */}
          {error && <p className="error" role="alert">{error}</p>}

          <button type="submit" className="btn" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="caption">Admins sign in with a password. Devices use their own API keys.</p>
      </div>
    </section>
  );
}

export default Login;
