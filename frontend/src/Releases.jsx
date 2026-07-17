// Releases.jsx — the uploaded firmware versions, newest first,
// with who uploaded each one (the server populates `uploadedBy`).

import { useState, useEffect } from "react";
import { api } from "./api.js";

function Releases() {
  const [releases, setReleases] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api("/api/firmware")
      .then((data) => setReleases(data.firmwares))
      .catch((err) => setError(err.message));
  }, []);

  return (
    <section>
      <h3 className="section-head">Releases</h3>
      {error && <p className="error" role="alert">{error}</p>}
      {!releases && !error && <p className="muted">Loading releases…</p>}
      {releases?.length === 0 && <p className="muted">No firmware uploaded yet.</p>}
      {releases?.length > 0 && (
        <ul className="releases">
          {/* The newest few are enough here; older ones stay in the database. */}
          {releases.slice(0, 5).map((release) => (
            <li key={release._id}>
              <span className="mono">{release.version}</span>
              <span className="when">{new Date(release.createdAt).toLocaleDateString()}</span>
              <span className="note">
                {release.releaseNotes}
                {release.uploadedBy && ` · by ${release.uploadedBy.username}`}
              </span>
            </li>
          ))}
        </ul>
      )}
      {releases?.length > 5 && <p className="muted" style={{ marginTop: 12 }}>{releases.length - 5} older releases not shown.</p>}
    </section>
  );
}

export default Releases;
