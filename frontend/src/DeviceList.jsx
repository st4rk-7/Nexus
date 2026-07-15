// DeviceList.jsx — the Devices section. Shows the device table with
// search / filter / sort, and switches to the add, detail, and edit screens.

import { useState, useEffect } from "react";
import { api } from "./api.js";
import DeviceForm from "./DeviceForm.jsx";
import DeviceDetail from "./DeviceDetail.jsx";

function DeviceList({ token }) {
  // Which screen we are on: { mode: "list" | "create" | "detail" | "edit", ... }
  const [view, setView] = useState({ mode: "list" });

  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // A success message (e.g. "Device deleted") shown above the table.
  const [notice, setNotice] = useState("");

  // Search, filter and sort are sent to the server as query parameters.
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState("newest");

  // Reload the list whenever a control changes or we come back to the list.
  useEffect(() => {
    if (view.mode !== "list") return;

    // `ignore` stops an older, slower response from overwriting a newer one.
    let ignore = false;
    setLoading(true);
    const params = new URLSearchParams({ search, status, sort });
    api(`/api/devices?${params}`)
      .then((data) => {
        if (ignore) return;
        setDevices(data.devices);
        setError("");
      })
      .catch((err) => !ignore && setError(err.message))
      .finally(() => !ignore && setLoading(false));
    return () => {
      ignore = true;
    };
  }, [search, status, sort, view.mode]);

  function showList(message = "") {
    setNotice(message);
    setView({ mode: "list" });
  }

  if (view.mode === "create") {
    return (
      <DeviceForm
        token={token}
        onCancel={() => showList()}
        // The API key is only returned once, at creation, so show it now.
        onSaved={(data) =>
          showList(`Created "${data.device.name}". API key (shown only once): ${data.apiKey}`)
        }
      />
    );
  }

  if (view.mode === "edit") {
    return (
      <DeviceForm
        token={token}
        device={view.device}
        onCancel={() => setView({ mode: "detail", id: view.device._id })}
        onSaved={(data) => setView({ mode: "detail", id: data.device._id })}
      />
    );
  }

  if (view.mode === "detail") {
    return (
      <DeviceDetail
        id={view.id}
        token={token}
        onBack={() => showList()}
        onEdit={(device) => setView({ mode: "edit", device })}
        onDeleted={(message) => showList(message)}
      />
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <h2>Devices ({devices.length})</h2>
        <button onClick={() => setView({ mode: "create" })}>Add device</button>
      </div>

      {notice && (
        <p className="notice mono" role="status">
          {notice}
        </p>
      )}

      <div className="toolbar">
        <label>
          Search
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Name or type"
          />
        </label>
        <label>
          Status
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All</option>
            <option value="online">Online</option>
            <option value="offline">Offline</option>
          </select>
        </label>
        <label>
          Sort by
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="name">Name (A–Z)</option>
            <option value="status">Status</option>
          </select>
        </label>
      </div>

      {error && <p role="alert" style={{ color: "var(--danger)" }}>{error}</p>}

      {loading && devices.length === 0 ? (
        <p style={{ color: "var(--text-muted)" }}>Loading devices…</p>
      ) : devices.length === 0 ? (
        <p style={{ color: "var(--text-muted)" }}>
          {search || status ? "No devices match these filters." : "No devices registered yet."}
        </p>
      ) : (
        <div className="table-wrap">
          <table className="device-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Firmware</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {/* .map turns each device object into a table row.
                  React needs a unique `key` per row (we use the DB id). */}
              {devices.map((device) => (
                <tr key={device._id}>
                  <td>
                    {/* The name opens the detail screen. */}
                    <button
                      className="link"
                      onClick={() => setView({ mode: "detail", id: device._id })}
                    >
                      {device.name}
                    </button>
                  </td>
                  <td>{device.type}</td>
                  <td className="mono">{device.currentFirmwareVersion}</td>
                  <td>
                    <span className={`badge badge-${device.status}`}>{device.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default DeviceList;
