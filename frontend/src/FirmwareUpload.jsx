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
      setError("No binary selected.");
      return;
    }
    if (!/^\d+\.\d+\.\d+$/.test(version.trim())) {
      setError("Version must adhere to SemVer format (e.g. 1.2.0).");
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
        setError(data.error || "Flash payload upload rejected.");
        return;
      }
      setSuccess(
        `v${data.firmware.version} staged successfully. Targets will discover payload on next check-in.`,
      );
      setVersion("");
      setReleaseNotes("");
      setFile(null);
      if (fileInput.current) fileInput.current.value = "";
    } catch {
      setError("Failed to stream artifact to cluster. Check network status.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="firmware" className="firmware-tool">
      <div className="tool-grid">
        {/* Flash Form */}
        <form className="flash-panel" onSubmit={handleSubmit} aria-busy={loading}>
          <div className="flash-panel-header mono">
            <span>BINARY_STAGING_PIPELINE</span>
            <span className="cyan-text">[OTA FLASH]</span>
          </div>

          <div className="flash-panel-body">
            {/* File Dropzone / Inspector */}
            <div className={`binary-drop ${file ? "has-file" : ""}`}>
              <input
                aria-label="Firmware binary"
                type="file"
                ref={fileInput}
                onChange={(e) => {
                  setFile(e.target.files[0] || null);
                  setSuccess("");
                }}
                required
              />
              <div className="drop-content mono">
                <Icon name={file ? "file" : "upload"} size={22} />
                {file ? (
                  <div>
                    <strong className="cyan-text">{file.name}</strong>
                    <p className="dim-text">{(file.size / 1024).toFixed(1)} KB · READY TO STAGE</p>
                  </div>
                ) : (
                  <div>
                    <strong>DROP COMPILED BINARY (.bin / .hex / .elf)</strong>
                    <p className="dim-text">Or click to select hardware payload</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flash-fields">
              <div className="field-group">
                <label htmlFor="version" className="mono">
                  TARGET_VERSION <span className="dim-text">[SemVer]</span>
                </label>
                <input
                  id="version"
                  className="mono"
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  placeholder="e.g. 1.3.0"
                  required
                />
              </div>

              <div className="field-group">
                <label htmlFor="release-notes" className="mono">
                  ROLLOUT_CHANGELOG <span className="dim-text">[Optional]</span>
                </label>
                <textarea
                  id="release-notes"
                  className="mono"
                  rows={3}
                  value={releaseNotes}
                  onChange={(e) => setReleaseNotes(e.target.value)}
                  placeholder="Patch notes, register offsets, pin mapping updates..."
                />
              </div>
            </div>

            {error && (
              <div className="message error mono">
                [REJECTED] {error}
              </div>
            )}
            {success && (
              <div className="message success mono">
                [STAGED] {success}
              </div>
            )}

            <div className="flash-actions">
              <button className="primary mono" disabled={loading}>
                {loading ? "STAGING BINARY..." : "STAGE FIRMWARE ROLLOUT"}
                <Icon name="arrow" size={15} />
              </button>
            </div>
          </div>
        </form>

        {/* Technical Pipeline Info */}
        <aside className="pipeline-spec mono">
          <div className="spec-block">
            <span className="spec-title">ROLLOUT PROTOCOL</span>
            <p className="dim-text">
              Payloads are streamed without intermediate filesystem buffers. Devices fetch cryptographically verified slices over TLS 1.3.
            </p>
          </div>
          <div className="spec-block">
            <span className="spec-title">CHECKSUM VALIDATION</span>
            <p className="dim-text">
              SHA-256 digest is generated server-side upon receipt and verified by the microcontroller bootloader before flash bank swap.
            </p>
          </div>
          <div className="spec-block">
            <span className="spec-title">VOLATILE NOTICE</span>
            <p className="dim-text">
              Ephemeral environment: active binary registries flush on cluster service restart.
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}
