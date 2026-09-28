import { useRef, useState } from "react";
import { apiUrl } from "./api.js";
import { Icon } from "./Icons.jsx";

export default function FirmwareUpload({ token, onSessionExpired }) {
  const [version, setVersion] = useState("");
  const [releaseNotes, setReleaseNotes] = useState("");
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const fileInput = useRef(null);

  async function handleSubmit(event) {
    event.preventDefault();
    if (loading) return;
    setError("");
    setSuccess("");
    if (!file) {
      setError("Choose a firmware file before uploading.");
      return;
    }
    if (!/^\d+\.\d+\.\d+$/.test(version.trim())) {
      setError("Use a version such as 1.2.0 (major.minor.patch).");
      return;
    }
    setLoading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("version", version.trim());
      form.append("releaseNotes", releaseNotes);
      const response = await fetch(apiUrl("/api/firmware"), {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      if (response.status === 401) {
        onSessionExpired();
        return;
      }
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Upload failed. Please try again.");
        return;
      }
      setSuccess(
        `Firmware v${data.firmware.version} uploaded. Devices can discover newer firmware on their next update check.`,
      );
      setVersion("");
      setReleaseNotes("");
      setFile(null);
      fileInput.current.value = "";
    } catch {
      setError(
        "Could not reach the server. Your form has been kept so you can try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section
      id="firmware"
      className="firmware-section"
      aria-labelledby="firmware-title"
    >
      <div className="firmware-intro">
        <span className="section-symbol">
          <Icon name="layers" size={27} />
        </span>
        <h2 id="firmware-title">Publish your next update</h2>
        <p>
          Give your devices their next update. Upload a firmware file with a
          version and a few notes on what’s changed.
        </p>
        <div className="upload-explainer">
          <Icon name="info" size={19} />
          <div>
            <strong>Available after upload</strong>
            <p>
              A newer version becomes available when a device next checks for
              updates. Uploading does not confirm installation.
            </p>
          </div>
        </div>
        <p className="storage-note">
          This workspace uses temporary storage. Devices and uploaded files
          clear when the backend restarts.
        </p>
      </div>
      <form
        className="firmware-form bracket-frame"
        onSubmit={handleSubmit}
        aria-busy={loading}
      >
        <div className="form-heading">
          <h3>Upload firmware</h3>
          <Icon name="upload" size={19} />
        </div>
        <fieldset disabled={loading}>
          <div className="file-picker">
            <Icon name={file ? "file" : "upload"} size={27} />
            <strong>{file ? file.name : "Choose a firmware file"}</strong>
            <span>
              {file
                ? `${(file.size / 1024).toFixed(1)} KB · Click to replace`
                : "Select a file from your computer"}
            </span>
            <input
              aria-label="Firmware file"
              type="file"
              ref={fileInput}
              onChange={(event) => {
                setFile(event.target.files[0] || null);
                setSuccess("");
              }}
              required
            />
          </div>
          <label htmlFor="version">
            Version <span className="field-hint">Required</span>
          </label>
          <input
            id="version"
            name="version"
            value={version}
            onChange={(event) => setVersion(event.target.value)}
            placeholder="e.g. 1.2.0"
            required
            aria-describedby="version-help"
          />
          <p id="version-help" className="field-description">
            Use major.minor.patch format.
          </p>
          <label htmlFor="release-notes">
            Release notes <span className="field-hint">Optional</span>
          </label>
          <textarea
            id="release-notes"
            name="releaseNotes"
            rows={3}
            value={releaseNotes}
            onChange={(event) => setReleaseNotes(event.target.value)}
            placeholder="What’s changed in this version?"
          />
        </fieldset>
        {error && (
          <p className="message error" role="alert">
            {error}
          </p>
        )}
        {success && (
          <p className="message success" role="status">
            <Icon name="check" size={18} />
            {success}
          </p>
        )}
        <div className="form-actions">
          <span className="mono">Review before uploading</span>
          <button className="primary" disabled={loading}>
            {loading ? "Uploading…" : "Upload firmware"}
            <Icon name="arrow" size={17} />
          </button>
        </div>
      </form>
    </section>
  );
}
