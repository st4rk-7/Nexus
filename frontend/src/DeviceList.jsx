// DeviceList.jsx — fetches all devices from the backend and shows them
// in a table with a colored online/offline badge.

import { useState, useEffect } from "react";
import { apiUrl } from "./api.js";

function DeviceList({ token }) {
  // Three pieces of state: the data, a loading flag, and any error.
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // useEffect runs code AFTER the component first appears on screen.
  // The empty array [] at the end means "run once, on mount" — not every redraw.
  // This is where we fetch data. The route is admin-only, so we attach the JWT.
  useEffect(() => {
    async function loadDevices() {
      try {
        const res = await fetch(apiUrl("/api/devices"), {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Failed to load devices");
          return;
        }
        setDevices(data.devices);
      } catch (err) {
        setError("Could not reach the server.");
      } finally {
        setLoading(false);
      }
    }
    loadDevices();
  }, [token]);

  if (loading) return <p style={{ color: "var(--text-muted)" }}>Loading devices…</p>;
  if (error) return <p style={{ color: "var(--danger)" }}>{error}</p>;

  return (
    <div className="card">
      <h2>Devices ({devices.length})</h2>

      {devices.length === 0 ? (
        <p style={{ color: "var(--text-muted)" }}>No devices registered yet.</p>
      ) : (
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
                <td>{device.name}</td>
                <td>{device.type}</td>
                <td className="mono">{device.currentFirmwareVersion}</td>
                <td>
                  <span className={`badge badge-${device.status}`}>
                    {device.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default DeviceList;
