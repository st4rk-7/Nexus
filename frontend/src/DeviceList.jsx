import { useCallback, useEffect, useState } from "react";
import { apiUrl } from "./api.js";
import { Icon } from "./Icons.jsx";

function seenAt(value) {
  if (!value || Number.isNaN(new Date(value).getTime())) return "Not reported";
  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function DeviceList({ token, onSessionExpired }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [checkedAt, setCheckedAt] = useState(null);
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
        if (!response.ok)
          throw new Error(data.error || "Could not load devices.");
        setDevices(data.devices);
        setLoaded(true);
        setCheckedAt(new Date());
      } catch (err) {
        if (err.name !== "AbortError")
          setError(
            "Could not refresh devices. Check your connection and try again.",
          );
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
  const online = devices.filter((device) => device.status === "online").length;

  const visible = devices.filter(
    (device) =>
      (status === "all" || device.status === status) &&
      `${device.name} ${device.type} ${device.currentFirmwareVersion}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  return (
    <section
      id="devices"
      className="device-section"
      aria-labelledby="devices-title"
    >
      <div className="summary-strip">
        {[
          [
            "Registered devices",
            devices.length,
            "All devices in this workspace",
          ],
          ["Online", online, "Recently checked in"],
          ["Offline", devices.length - online, "No recent check-in"],
        ].map(([label, value, hint], index) => (
          <div className="summary-item" key={label}>
            <div className="metric-header">
              <span>{label}</span>
              <span className={`metric-icon metric-${index}`}>
                <Icon
                  name={index === 0 ? "chip" : index === 1 ? "signal" : "info"}
                  size={20}
                />
              </span>
            </div>
            <div className="summary-value">
              {loaded ? value : "—"}
              <span>{hint}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="section-toolbar">
        <div className="section-title">
          <h2 id="devices-title">Device inventory</h2>
          <span className="count-pill">{loaded ? devices.length : "—"}</span>
        </div>
        <button
          className="secondary"
          onClick={() => loadDevices()}
          disabled={loading}
        >
          <Icon name="refresh" size={16} />
          {loading ? "Refreshing…" : "Refresh"}
        </button>
      </div>
      {error && (
        <p role="alert" className="message error">
          {error} {loaded && "Showing the last loaded data."}
        </p>
      )}
      <div className="table-panel" aria-busy={loading}>
        <div className="inventory-controls">
          <div className="search-field">
            <Icon name="search" size={18} />
            <input
              aria-label="Search devices"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by name, type or version…"
            />
          </div>
          <select
            aria-label="Filter by connectivity status"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option value="all">All statuses</option>
            <option value="online">Online</option>
            <option value="offline">Offline</option>
          </select>
        </div>
        <div
          className="table-scroll"
          tabIndex={0}
          role="region"
          aria-label="Device inventory table"
        >
          <table>
            <caption className="sr-only">
              Registered devices and their last reported connectivity
            </caption>
            <thead>
              <tr>
                <th scope="col">Device name</th>
                <th scope="col">Type</th>
                <th scope="col">Firmware</th>
                <th scope="col">Status</th>
                <th scope="col">Last seen</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((device) => (
                <tr key={device._id}>
                  <th scope="row">
                    <span className="device-name">
                      <span className="device-icon">
                        <Icon name="chip" size={18} />
                      </span>
                      {device.name}
                    </span>
                  </th>
                  <td>{device.type}</td>
                  <td>
                    <span className="version mono">
                      v{device.currentFirmwareVersion}
                    </span>
                  </td>
                  <td>
                    <span className={`badge badge-${device.status}`}>
                      <span className="status-dot" />
                      {device.status === "online" ? "Online" : "Offline"}
                    </span>
                  </td>
                  <td className="mono last-seen">
                    {seenAt(device.lastSeenAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!visible.length && (
          <div className="empty-state" role="status">
            <span className="empty-icon">
              <Icon name="chip" size={30} />
            </span>
            <h3>
              {loading
                ? "Loading your devices…"
                : error
                  ? "Device data is unavailable"
                  : devices.length
                    ? "No matching devices"
                    : "Your fleet starts with one device"}
            </h3>
            <p>
              {error
                ? "Use Refresh to try loading the inventory again."
                : loading
                  ? "Retrieving the latest device information."
                  : devices.length
                    ? "Try a different search or select another status."
                    : "Connect a device using the simulator. Once registered, it will appear here with its firmware and connection status."}
            </p>
            {!loading && !error && !devices.length && (
              <code className="simulator-command">bun simulator/device.js</code>
            )}
          </div>
        )}
        <div className="table-footer">
          <span>
            {loaded
              ? `${visible.length} of ${devices.length} devices`
              : "Waiting for device data"}
          </span>
          <span role="status">
            {checkedAt
              ? `Last refreshed ${checkedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
              : "Status is based on the last device check-in"}
          </span>
        </div>
      </div>
      <div className="inventory-notes">
        <div>
          <span className="note-icon">
            <Icon name="signal" />
          </span>
          <div>
            <h3>Understand connectivity</h3>
            <p>
              Online status reflects a recent device check-in. Refresh to
              retrieve the latest reported state.
            </p>
          </div>
        </div>
        <div>
          <span className="note-icon">
            <Icon name="layers" />
          </span>
          <div>
            <h3>Keep versions in view</h3>
            <p>
              Each device reports its current firmware version. Upload newer
              firmware in the Firmware workspace.
            </p>
            <a href="#firmware">
              Manage firmware <Icon name="arrow" size={15} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
