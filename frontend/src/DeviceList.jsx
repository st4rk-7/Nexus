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
  // A success message (e.g. "Device deleted") shown above the table,
  // plus the new device's API key when one was just created.
  const [notice, setNotice] = useState({ text: "", apiKey: "" });

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

  // Each screen change starts at the top, so the heading and "back" link are visible.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [view]);

  function showList(text = "", apiKey = "") {
    setNotice({ text, apiKey });
    setView({ mode: "list" });
  }

  if (view.mode === "create") {
    return (
      <DeviceForm
        token={token}
        onCancel={() => showList()}
        // The API key is only returned once, at creation, so show it now.
        onSaved={(data) =>
          showList(`Created "${data.device.name}". Copy its API key now — it is shown only once.`, data.apiKey)
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

  const online = devices.filter((d) => d.status === "online").length;

  return (
    <section>
      <div className="head">
        <h2>Fleet</h2>
        <p className="sum">
          <b>{devices.length}</b> {devices.length === 1 ? "device" : "devices"} · <b>{online}</b> online ·{" "}
          <b>{devices.length - online}</b> offline
        </p>
      </div>

      {notice.text && (
        <div className="notice" role="status">
          {notice.text}
          {notice.apiKey && <span className="mono">{notice.apiKey}</span>}
        </div>
      )}

      <div className="tools">
        <label className="field">
          <span>Search</span>
          <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Name or type" />
        </label>
        <label className="field">
          <span>Status</span>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All</option>
            <option value="online">Online</option>
            <option value="offline">Offline</option>
          </select>
        </label>
        <label className="field">
          <span>Sort by</span>
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="name">Name (A–Z)</option>
            <option value="status">Status</option>
          </select>
        </label>
        <button className="btn" onClick={() => setView({ mode: "create" })}>Add device</button>
      </div>

      {error && <p className="error" role="alert">{error}</p>}

      {loading && devices.length === 0 ? (
        <p className="empty">Loading devices…</p>
      ) : devices.length === 0 ? (
        <p className="empty">
          {search || status
            ? "No devices match these filters. Clear the search or status to see the whole fleet."
            : "No devices yet. Add one here, or run the simulator to register a device."}
        </p>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th className="col-type">Type</th>
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
                    <button className="link" onClick={() => setView({ mode: "detail", id: device._id })}>
                      {device.name}
                    </button>
                  </td>
                  <td className="col-type">{device.type}</td>
                  <td className="mono">{device.currentFirmwareVersion}</td>
                  <td>
                    <span className={`status status-${device.status}`}>{device.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default DeviceList;
