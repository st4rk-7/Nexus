import { useCallback, useEffect, useState } from "react";
import Login from "./Login.jsx";
import DeviceList from "./DeviceList.jsx";
import FirmwareUpload from "./FirmwareUpload.jsx";
import { Brand, Icon } from "./Icons.jsx";

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  const [username, setUsername] = useState(
    () => localStorage.getItem("username") || "",
  );
  const [notice, setNotice] = useState("");
  const [page, setPage] = useState(() =>
    location.hash === "#firmware" ? "firmware" : "devices",
  );
  useEffect(() => {
    const navigate = () =>
      setPage(location.hash === "#firmware" ? "firmware" : "devices");
    window.addEventListener("hashchange", navigate);
    return () => window.removeEventListener("hashchange", navigate);
  }, []);
  function handleLogin(newToken, newUsername) {
    localStorage.setItem("token", newToken);
    localStorage.setItem("username", newUsername);
    setToken(newToken);
    setUsername(newUsername);
    setNotice("");
  }
  const handleLogout = useCallback((expired = false) => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setToken("");
    setUsername("");
    setNotice(expired ? "Your session has ended. Sign in to continue." : "");
  }, []);
  const onSessionExpired = useCallback(
    () => handleLogout(true),
    [handleLogout],
  );
  if (!token)
    return (
      <div className="signed-out">
        <header className="login-header">
          <Brand />
          <span>Device management, simplified.</span>
        </header>
        <Login onLogin={handleLogin} notice={notice} />
        <footer className="login-footer">
          Nexus · IoT device & firmware management
        </footer>
      </div>
    );
  return (
    <div className="console-layout">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <aside className="sidebar">
        <a href="#devices" className="sidebar-brand" aria-label="Nexus devices">
          <Brand />
        </a>
        <div className="workspace-switch">
          <span className="workspace-icon">
            <Icon name="chip" />
          </span>
          <div>
            <strong>My workspace</strong>
            <span>IoT management</span>
          </div>
        </div>
        <p className="nav-label">Workspace</p>
        <nav aria-label="Main navigation">
          <a
            href="#devices"
            aria-current={page === "devices" ? "page" : undefined}
          >
            <Icon name="chip" />
            <span>Devices</span>
            <span className="nav-arrow">›</span>
          </a>
          <a
            href="#firmware"
            aria-current={page === "firmware" ? "page" : undefined}
          >
            <Icon name="layers" />
            <span>Firmware</span>
            <span className="nav-arrow">›</span>
          </a>
        </nav>
        <div className="sidebar-bottom">
          <div className="workspace-tip">
            <Icon name="info" size={18} />
            <strong>A space to build.</strong>
            <p>
              Manage connected devices and prepare their next firmware update.
            </p>
          </div>
          <div className="sidebar-user">
            <span className="avatar">{username.slice(0, 1).toUpperCase()}</span>
            <div>
              <strong title={username}>{username}</strong>
              <span>Administrator</span>
            </div>
            <button
              className="icon-button"
              onClick={() => handleLogout()}
              aria-label="Sign out"
              title="Sign out"
            >
              <Icon name="logout" size={18} />
            </button>
          </div>
        </div>
      </aside>
      <div className="console-main">
        <header className="topbar">
          <div className="breadcrumb">
            Workspace <span>/</span>{" "}
            <strong>{page === "devices" ? "Devices" : "Firmware"}</strong>
          </div>
          <span className="console-label">
            <span className="status-dot" /> Management console
          </span>
        </header>
        <main id="main" className="workspace">
          <div className="workspace-heading">
            <div>
              <p className="eyebrow">
                {page === "devices" ? "Fleet management" : "Release management"}
              </p>
              <h1>{page === "devices" ? "Devices" : "Firmware"}</h1>
              <p className="lede">
                {page === "devices"
                  ? "A clear view of every device in your workspace."
                  : "Prepare the next version for your connected devices."}
              </p>
            </div>
            {page === "devices" && (
              <a href="#firmware" className="button primary">
                <Icon name="upload" size={17} />
                Upload firmware
              </a>
            )}
          </div>
          <div hidden={page !== "devices"}>
            <DeviceList token={token} onSessionExpired={onSessionExpired} />
          </div>
          <div hidden={page !== "firmware"}>
            <FirmwareUpload token={token} onSessionExpired={onSessionExpired} />
          </div>
          <footer className="workspace-footer">
            <span>Nexus workspace</span>
            <span>Device & firmware management</span>
          </footer>
        </main>
      </div>
    </div>
  );
}
