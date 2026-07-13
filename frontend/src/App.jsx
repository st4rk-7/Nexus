// App.jsx — the top-level component. It decides what to show:
//   - not logged in  -> the Login form
//   - logged in      -> the dashboard (device list + upload, added next)

import { useState } from "react";
import Login from "./Login.jsx";

function App() {
  // We keep the JWT token in state. Start by reading any saved token from
  // localStorage, so refreshing the page doesn't log you out.
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  const [username, setUsername] = useState(() => localStorage.getItem("username") || "");

  // Called by <Login /> after a successful login.
  function handleLogin(newToken, newUsername) {
    setToken(newToken);
    setUsername(newUsername);
    localStorage.setItem("token", newToken);
    localStorage.setItem("username", newUsername);
  }

  function handleLogout() {
    setToken("");
    setUsername("");
    localStorage.removeItem("token");
    localStorage.removeItem("username");
  }

  return (
    <div style={{ fontFamily: "system-ui", padding: "2rem" }}>
      <h1>Nexus Admin</h1>

      {/* If we have no token, show the login form. Otherwise, the dashboard. */}
      {!token ? (
        <Login onLogin={handleLogin} />
      ) : (
        <div>
          <p>
            Logged in as <strong>{username}</strong>{" "}
            <button onClick={handleLogout}>Log out</button>
          </p>
          <p>Dashboard (device list + firmware upload) coming next.</p>
        </div>
      )}
    </div>
  );
}

export default App;
