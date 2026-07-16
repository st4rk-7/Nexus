// DeviceDetail.jsx — shows one device, with Edit and Delete actions.

import { useState, useEffect } from "react";
import { api } from "./api.js";

function DeviceDetail({ id, token, onBack, onEdit, onDeleted }) {
  const [device, setDevice] = useState(null);
  const [updates, setUpdates] = useState([]);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  // Load the device whenever the id changes.
  useEffect(() => {
    api(`/api/devices/${id}`)
      .then((data) => {
        setDevice(data.device);
        setUpdates(data.updates);
      })
      .catch((err) => setError(err.message));
  }, [id]);

  async function handleDelete() {
    // Ask first: deleting cannot be undone.
    if (!window.confirm(`Delete device "${device.name}"? This cannot be undone.`)) return;

    setDeleting(true);
    setError("");
    try {
      const data = await api(`/api/devices/${id}`, { method: "DELETE", token });
      onDeleted(data.message);
    } catch (err) {
      setError(err.message);
      setDeleting(false);
    }
  }

  return (
    <div className="card">
      <button className="link" onClick={onBack}>← All devices</button>

      {error && <p role="alert" style={{ color: "var(--danger)" }}>{error}</p>}
      {!device && !error && <p style={{ color: "var(--text-muted)" }}>Loading device…</p>}

      {device && (
        <>
          <h2 style={{ marginTop: "0.75rem" }}>{device.name}</h2>
          <dl className="details">
            <dt>Type</dt>
            <dd>{device.type}</dd>
            <dt>Firmware</dt>
            <dd className="mono">{device.currentFirmwareVersion}</dd>
            <dt>Status</dt>
            <dd>
              <span className={`badge badge-${device.status}`}>{device.status}</span>
            </dd>
            <dt>Device ID</dt>
            <dd className="mono">{device._id}</dd>
            <dt>Registered</dt>
            <dd>{new Date(device.createdAt).toLocaleString()}</dd>
            <dt>Last updated</dt>
            <dd>{new Date(device.updatedAt).toLocaleString()}</dd>
          </dl>

          <h3>Update history</h3>
          {updates.length === 0 ? (
            <p style={{ color: "var(--text-muted)" }}>No firmware updates reported yet.</p>
          ) : (
            <div className="table-wrap">
              <table className="device-table">
                <thead>
                  <tr>
                    <th>From</th>
                    <th>To</th>
                    <th>Installed</th>
                  </tr>
                </thead>
                <tbody>
                  {updates.map((update) => (
                    <tr key={update._id}>
                      <td className="mono">{update.fromVersion}</td>
                      {/* firmware is populated by the server; it is null if that release was removed */}
                      <td className="mono">{update.firmware?.version ?? "—"}</td>
                      <td>{new Date(update.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="actions">
            <button onClick={() => onEdit(device)}>Edit</button>
            <button className="danger" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Deleting…" : "Delete"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default DeviceDetail;
