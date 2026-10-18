# 06 — Firmware and the simulator

[Guide index](README.md) · Next: [Code map and viva](07-code-map-and-viva.md)

## Uploading a release

Read [`firmwareRoutes.js`](../../backend/routes/firmwareRoutes.js), then [`firmwareController.js`](../../backend/controllers/firmwareController.js).

The upload sequence is: administrator authentication → Multer writes one file to `backend/uploads/` → controller checks the version is present and unique → Firmware metadata stores the file path → HTTP 201 confirms success.

`isActive` determines which releases can be offered. Uploads default to active, and there is no dashboard control for deactivation; the Releases list marks inactive ones. Multiple releases can remain active simultaneously.

## Selecting an update

[`checkUpdate`](../../backend/controllers/deviceController.js) first obtains the authenticated device from middleware and records that it was seen now (`lastSeen`, status online). It uses the submitted current version, or falls back to the recorded version. It does not change the stored version; only an install report does.

The controller selects the most recently created active release. It offers that release whenever its version string differs from the device's current version. This can mistakenly offer a downgrade.

Conventionally, `major.minor.patch` versions allow numerical comparison. Nexus validates the format (devices and releases must look like `1.2.0`) but does **not** compare versions numerically.

| Comparison | Result | Reason |
|---|---|---|
| `1.2.0` versus `1.2.0` | No update | Strings match |
| Latest `2.0.0`, device `5.0.0` | Update offered | Strings differ; this is an unsafe downgrade |
| Recently uploaded `1.2.0` after `1.10.0` | `1.2.0` selected | Upload time, not numeric version, decides |

Version selection is global; the device's `type` does not filter releases. Numeric version comparison and hardware compatibility checks remain future work.

## Download and device status

An update response contains a relative download URL. The client joins it to its API origin and downloads the bytes. The download endpoint finds release metadata, checks the file still exists (otherwise `404`) and sends it. Binary download is public in the current route configuration.

After installing, the device calls `report-update` with the firmware id. The server writes an UpdateLog (device, firmware, previous version), updates the device's version and marks it seen.

Every check-in or report sets `lastSeen`. Before listing or showing devices, the server marks any online device that has been silent for **5 minutes** as offline. The status is therefore derived from real contact, but it is only re-evaluated when someone reads the list; there is no background timer. An admin can still edit the status by hand, and a silent device flips back to offline on the next read.

## What the simulator demonstrates

[`simulator/device.js`](../../simulator/device.js) creates a timestamped device name, registers it, keeps the returned key in memory, reports version `1.0.0`, checks for an update, downloads it if offered and reports the install.

From the repository root:

```bash
bun simulator/device.js
```

Each run creates a new database record. It does not persist a device key for later runs, flash hardware, verify a firmware signature or reboot. A success message confirms the scripted network sequence, not hardware installation.

“No update available” is a valid API result but does not demonstrate download. For a full demonstration, upload a small test file with an unused version higher than `1.0.0` and verify that its bytes can be downloaded. Do not present an arbitrary test file as executable hardware firmware.

**Self-check:** How does the dashboard learn the device's new version after the simulator runs? Step 4 calls `report-update`; the server saves the version and an UpdateLog, so the device detail view shows the change in its update history.
