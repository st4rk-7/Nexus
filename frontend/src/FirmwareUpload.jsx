// FirmwareUpload.jsx — admin-only form to upload a new firmware version.
// Sends a file + metadata to POST /api/firmware with the JWT token attached.

import { useState } from "react";

// `token` (the admin's JWT) is passed in from App. `onUploaded` lets the
// parent react after a successful upload (e.g. refresh a list later).
function FirmwareUpload({ token, onUploaded }) {
  const [version, setVersion] = useState("");
  const [releaseNotes, setReleaseNotes] = useState("");
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!file) {
      setError("Please choose a firmware file.");
      return;
    }
    setLoading(true);

    try {
      // Files can't go in JSON. FormData builds a multipart/form-data body —
      // the same thing `curl -F` sent. The field names must match what multer
      // and the controller expect: "file", "version", "releaseNotes".
      const form = new FormData();
      form.append("file", file);
      form.append("version", version);
      form.append("releaseNotes", releaseNotes);

      const res = await fetch("/api/firmware", {
        method: "POST",
        // Attach the admin's badge. NOTE: we do NOT set Content-Type here —
        // the browser sets it automatically (with the multipart boundary).
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Upload failed");
        return;
      }

      setSuccess(`Uploaded firmware v${data.firmware.version}.`);
      // Clear the form for the next upload.
      setVersion("");
      setReleaseNotes("");
      setFile(null);
      event.target.reset(); // clears the native file input
      if (onUploaded) onUploaded();
    } catch (err) {
      setError("Could not reach the server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section>
      <h3 className="section-head">Upload firmware</h3>
      <form className="stack" onSubmit={handleSubmit}>
        <label className="field">
          <span>Version</span>
          <input
            className="mono"
            value={version}
            onChange={(e) => setVersion(e.target.value)}
            placeholder="1.2.0"
            pattern="\d+\.\d+\.\d+"
            title="Format: major.minor.patch, e.g. 1.2.0"
            required
          />
        </label>

        <label className="field">
          <span>Release notes</span>
          <input
            value={releaseNotes}
            onChange={(e) => setReleaseNotes(e.target.value)}
            placeholder="What changed in this version?"
          />
        </label>

        <label className="field">
          <span>Firmware file</span>
          <input type="file" onChange={(e) => setFile(e.target.files[0] || null)} required />
          <small>Devices checking in will be offered this version.</small>
        </label>

        {error && <p className="error" role="alert">{error}</p>}
        {success && <p className="notice" role="status">{success}</p>}

        <button type="submit" className="btn" disabled={loading}>
          {loading ? "Uploading…" : "Publish release"}
        </button>
      </form>
    </section>
  );
}

export default FirmwareUpload;
