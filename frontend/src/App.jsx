import { useCallback, useEffect, useState } from "react";
import Login from "./Login.jsx";
import LandingHero from "./LandingHero.jsx";
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
    setNotice(expired ? "Session expired." : "");
  }, []);

  const onSessionExpired = useCallback(
    () => handleLogout(true),
    [handleLogout],
  );

  if (!token) {
    return <LandingHero onLogin={handleLogin} notice={notice} />;
  }

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
            <Icon name="chip" size={16} />
          </span>
          <div>
            <strong>CLUSTER: PROD-1</strong>
            <span>eu-west-1 · stable</span>
          </div>
        </div>
        <p className="nav-label">CONTROL PLANE</p>
        <nav aria-label="Main navigation">
          <a
            href="#devices"
            aria-current={page === "devices" ? "page" : undefined}
          >
            <Icon name="chip" size={16} />
            <span>Fleet Inventory</span>
            <span className="nav-arrow">›</span>
          </a>
          <a
            href="#firmware"
            aria-current={page === "firmware" ? "page" : undefined}
          >
            <Icon name="layers" size={16} />
            <span>Firmware OTA</span>
            <span className="nav-arrow">›</span>
          </a>
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-user">
            <span className="avatar mono">{username.slice(0, 1).toUpperCase()}</span>
            <div>
              <strong title={username} className="mono">{username}</strong>
              <span className="dim-text mono">ADMINISTRATOR</span>
            </div>
            <button
              className="icon-button"
              onClick={() => handleLogout()}
              aria-label="Sign out"
              title="Sign out"
            >
              <Icon name="logout" size={16} />
            </button>
          </div>
        </div>
      </aside>

      <div className="console-main">
        <header className="topbar mono">
          <div className="breadcrumb">
            nexus://cluster <span>/</span>{" "}
            <strong>{page === "devices" ? "fleet-inventory" : "firmware-ota"}</strong>
          </div>
          <span className="console-label">
            <span className="pulsing-dot" /> LIVE TELEMETRY
          </span>
        </header>

        <main id="main" className="workspace">
          <div className="workspace-heading">
            <div>
              <h1>{page === "devices" ? "Connected Fleet Inventory" : "OTA Release Pipeline"}</h1>
              <p className="lede">
                {page === "devices"
                  ? "Real-time edge nodes, architecture tracking, and heartbeat status."
                  : "Cryptographic binary staging and rolling target distributions."}
              </p>
            </div>
            {page === "devices" && (
              <a href="#firmware" className="button primary mono compact-btn">
                <Icon name="upload" size={14} />
                STAGE BINARY
              </a>
            )}
          </div>

          <div hidden={page !== "devices"}>
            <DeviceList token={token} onSessionExpired={onSessionExpired} />
          </div>
          <div hidden={page !== "firmware"}>
            <FirmwareUpload token={token} onSessionExpired={onSessionExpired} />
          </div>

          <footer className="workspace-footer mono">
            <span>NEXUS CONTROL PLANE · v0.4.0</span>
            <span>TLS 1.3 / ECDSA · AUTHENTICATED</span>
          </footer>
        </main>
      </div>
    </div>
  );
}
