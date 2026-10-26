// App.jsx — the top-level component. It decides what to show:
//   - not logged in  -> the landing page, then the Login form
//   - logged in      -> the dashboard (devices, firmware upload, releases)

import { useState } from "react";
import Login from "./Login.jsx";
import Landing from "./Landing.jsx";
import DeviceList from "./DeviceList.jsx";
import FirmwareUpload from "./FirmwareUpload.jsx";
import { NexusLogo } from "./NexusLogo.jsx";
import Releases from "./Releases.jsx";

function App() {
  // We keep the JWT token in state. Start by reading any saved token from
  // localStorage, so refreshing the page doesn't log you out.
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  const [username, setUsername] = useState(() => localStorage.getItem("username") || "");
  // Bumped after each upload so the Releases list remounts and re-fetches.
  const [releasesKey, setReleasesKey] = useState(0);
  // Logged-out visitors see the landing page until they choose to sign in.
  const [showLogin, setShowLogin] = useState(false);

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

  // If we have no token, show the login screen. Otherwise, the dashboard.
  if (!token && !showLogin) return <Landing onStart={() => setShowLogin(true)} />;
  if (!token)
    return (
      <>
        <button type="button" className="login-back" onClick={() => setShowLogin(false)}>
          ← Back to overview
        </button>
        <Login onLogin={handleLogin} />
      </>
    );

  return (
    <>
      <header className="bar">
        <NexusLogo inverse size={22} className="bar-logo" />
        <div className="who">
          <span>{username}</span>
          <button onClick={handleLogout}>Log out</button>
        </div>
      </header>

      <main className="page">
        {/* Devices: list, search, add, view, edit, delete (edit/delete need the token). */}
        <DeviceList token={token} />

        <aside className="aside">
          {/* Admin-only: upload a new firmware version (sends the JWT token). */}
          <FirmwareUpload token={token} onUploaded={() => setReleasesKey((k) => k + 1)} />
          <Releases key={releasesKey} />
        </aside>
      </main>
    </>
  );
}

export default App;
