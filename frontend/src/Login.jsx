import { useState } from "react";
import { apiUrl } from "./api.js";
import { Icon } from "./Icons.jsx";

export default function Login({ onLogin, notice }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch(apiUrl("/api/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Sign-in failed. Please try again.");
        return;
      }
      onLogin(data.token, data.username);
    } catch {
      setError(
        "Could not reach the server. Check that the backend is running, then try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main id="main" className="login-layout">
      <section className="login-story grid-paper" aria-labelledby="intro-title">
        <p className="eyebrow">
          <span className="square" /> Your connected workspace
        </p>
        <h1 id="intro-title">
          Connected devices.
          <br />
          Confident decisions.
        </h1>
        <p className="intro-copy">
          Monitor your devices, understand their status, and manage firmware.
          Everything you need, in one workspace.
        </p>
        <div
          className="flow-diagram bracket-frame"
          aria-label="Device update flow: device checks for an update, then downloads firmware"
        >
          <div className="diagram-heading eyebrow">
            <span>Device update flow</span>
            <span>01 — 03</span>
          </div>
          <div className="flow-nodes">
            <div>
              <span className="node-icon">
                <Icon name="chip" size={28} />
              </span>
              <span className="mono">Device</span>
            </div>
            <span className="flow-line">
              <Icon name="arrow" size={16} />
            </span>
            <div>
              <span className="node-icon node-active">
                <Icon name="refresh" size={28} />
              </span>
              <span className="mono">Check</span>
            </div>
            <span className="flow-line">
              <Icon name="arrow" size={16} />
            </span>
            <div>
              <span className="node-icon">
                <Icon name="file" size={28} />
              </span>
              <span className="mono">Download</span>
            </div>
          </div>
          <p>From a device check-in to its next firmware version.</p>
        </div>
        <div className="story-footnote">
          <span className="cross">+</span>
          <span className="eyebrow">Built for connected systems</span>
          <span className="rule" />
          <span className="cross">+</span>
        </div>
      </section>
      <section className="login-panel" aria-labelledby="login-title">
        <div className="login-form-wrap">
          <span className="section-index mono">Nexus console</span>
          <h2 id="login-title">Welcome back</h2>
          <p className="muted">Sign in to your Nexus workspace.</p>
          <form
            onSubmit={handleSubmit}
            className="login-form"
            aria-busy={loading}
          >
            {notice && (
              <p className="message info" role="status">
                {notice}
              </p>
            )}
            <label htmlFor="username">Username</label>
            <input
              id="username"
              name="username"
              autoComplete="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Enter your username"
              required
              disabled={loading}
            />
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              required
              disabled={loading}
            />
            {error && (
              <p className="message error" role="alert">
                {error}
              </p>
            )}
            <button className="primary login-submit" disabled={loading}>
              {loading ? "Signing in…" : "Sign in to workspace"}
              <Icon name="arrow" size={18} />
            </button>
          </form>
          <p className="login-help">
            <Icon name="lock" size={16} /> Access is limited to configured
            administrators.
          </p>
        </div>
      </section>
    </main>
  );
}
