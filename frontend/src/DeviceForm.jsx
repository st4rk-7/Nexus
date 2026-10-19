// DeviceForm.jsx — one form for both creating and editing a device.
// If a `device` is passed in we are editing it, otherwise creating a new one.

import { useState } from "react";
import { api } from "./api.js";

function DeviceForm({ token, device, onSaved, onCancel }) {
  const editing = Boolean(device);
  const [form, setForm] = useState({
    name: device?.name || "",
    type: device?.type || "",
    currentFirmwareVersion: device?.currentFirmwareVersion || "1.0.0",
    status: device?.status || "online",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // One change handler for every field: the input's `name` says which one.
  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSaving(true);
    try {
      const data = editing
        ? await api(`/api/devices/${device._id}`, { method: "PUT", token, body: form })
        : await api("/api/devices/register", { method: "POST", body: form });
      onSaved(data);
    } catch (err) {
      // The server repeats the same checks, so its message is shown here too.
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="head">
        <h2>{editing ? `Edit ${device.name}` : "Add device"}</h2>
      </div>

      {/* Browser-side checks (required, length, pattern) mirror the schema rules. */}
      <div className="form-grid">
        <label className="field">
          <span>Name</span>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            minLength={2}
            maxLength={50}
            pattern="[A-Za-z0-9 _.\-]+"
            title="Letters, numbers, spaces, - _ ."
            placeholder="sensor-01"
          />
        </label>

        <label className="field">
          <span>Type</span>
          <input
            name="type"
            value={form.type}
            onChange={handleChange}
            required
            maxLength={40}
            placeholder="ESP32"
          />
        </label>

        <label className="field">
          <span>Firmware version</span>
          <input
            name="currentFirmwareVersion"
            className="mono"
            value={form.currentFirmwareVersion}
            onChange={handleChange}
            required
            pattern="\d+\.\d+\.\d+"
            title="Format: major.minor.patch, e.g. 1.2.0"
          />
        </label>

        {/* New devices always start online, so status is only editable later. */}
        {editing && (
          <label className="field">
            <span>Status</span>
            <select name="status" value={form.status} onChange={handleChange}>
              <option value="online">Online</option>
              <option value="offline">Offline</option>
            </select>
          </label>
        )}
      </div>

      {error && <p className="error" role="alert" style={{ marginTop: 16 }}>{error}</p>}

      <div className="actions">
        <button type="submit" className="btn" disabled={saving}>
          {saving ? "Saving…" : editing ? "Save changes" : "Create device"}
        </button>
        <button type="button" className="btn ghost" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}

export default DeviceForm;
