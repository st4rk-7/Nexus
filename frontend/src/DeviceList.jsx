import { useCallback, useEffect, useState } from "react";
import { apiUrl } from "./api.js";
import { Icon } from "./Icons.jsx";

function seenAt(value) {
  if (!value || Number.isNaN(new Date(value).getTime())) return "Never";
  const diffSec = Math.floor((Date.now() - new Date(value).getTime()) / 1000);
  if (diffSec < 60) return `${diffSec}s ago`;
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  return new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function DeviceList({ token, onSessionExpired }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);

  const loadDevices = useCallback(
    async (signal) => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(apiUrl("/api/devices"), {
          headers: { Authorization: `Bearer ${token}` },
          signal,
        });
        if (response.status === 401) {
          onSessionExpired();
          return;
        }
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Could not load devices.");
        setDevices(data.devices || []);
        setLoaded(true);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError("Connection failed. Check backend status.");
        }
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [token, onSessionExpired],
  );

  useEffect(() => {
    const controller = new AbortController();
    loadDevices(controller.signal);
    return () => controller.abort();
  }, [loadDevices]);

  const online = devices.filter((d) => d.status === "online").length;

  const visible = devices.filter(
    (d) =>
      (status === "all" || d.status === status) &&
      `${d.name} ${d.type} ${d.currentFirmwareVersion}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );

  return (
    <section id="devices" className="fleet-view">
      {/* Dense Fleet Control Bar — No Big Metric Cards */}
      <div className="fleet-strip mono">
        <div className="fleet-stat">
          <span className="dim-text">NODES</span>
          <strong>{loaded ? devices.length : "—"}</strong>
        </div>
        <span className="divider" />
        <div className="fleet-stat">
          <span className="dim-text">ONLINE</span>
          <span className="green-text">● {loaded ? online : "—"}</span>
        </div>
        <span className="divider" />
        <div className="fleet-stat">
          <span className="dim-text">OFFLINE</span>
          <span className="dim-text">{loaded ? devices.length - online : "—"}</span>
        </div>
        <span className="divider" />
        <div className="fleet-stat">
          <span className="dim-text">HEALTH</span>
          <span className="cyan-text">{devices.length ? `${Math.round((online / devices.length) * 100)}%` : "100%"}</span>
        </div>

        <div className="fleet-strip-actions">
          <button
            className="secondary compact-btn mono"
            onClick={() => loadDevices()}
            disabled={loading}
          >
            <Icon name="refresh" size={14} />
            {loading ? "SYNCING…" : "SYNC"}
          </button>
        </div>
      </div>

      {error && (
        <div role="alert" className="message error mono">
          [ERR] {error}
        </div>
      )}

      {/* High Density Table */}
      <div className="fleet-table-wrap">
        <div className="table-filter-bar">
          <div className="search-box">
            <Icon name="search" size={15} />
            <input
              className="mono"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter by identifier, architecture, version..."
            />
          </div>
          <div className="status-toggle mono">
            {["all", "online", "offline"].map((s) => (
              <button
                key={s}
                type="button"
                className={`filter-tab ${status === s ? "active" : ""}`}
                onClick={() => setStatus(s)}
              >
                {s.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="table-container">
          <table className="dense-table mono">
            <thead>
              <tr>
                <th>DEVICE_IDENTIFIER</th>
                <th>ARCHITECTURE</th>
                <th>FIRMWARE</th>
                <th>HEARTBEAT</th>
                <th>STATE</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((device) => (
                <tr key={device._id}>
                  <td>
                    <div className="device-id-cell">
                      <span className="chip-indicator" />
                      <strong className="cyan-text">{device.name}</strong>
                    </div>
                  </td>
                  <td>
                    <span className="arch-tag">{device.type}</span>
                  </td>
                  <td>
                    <span className="version-pill">v{device.currentFirmwareVersion}</span>
                  </td>
                  <td className="dim-text">
                    {seenAt(device.lastSeenAt)}
                  </td>
                  <td>
                    <span className={`status-tag ${device.status}`}>
                      {device.status === "online" ? "● ONLINE" : "○ OFFLINE"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!visible.length && (
          <div className="empty-fleet mono">
            <Icon name="chip" size={24} />
            <p className="dim-text">
              {loading ? "POLLING ACTIVE FLEET..." : "NO DEVICES MATCH SPECIFIED FILTER"}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
