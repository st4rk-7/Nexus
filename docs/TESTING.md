# Nexus Testing and Learning Guide

Use this guide to test Nexus yourself and understand what each part does.
Complete the sections in order.

## 1. Start both applications

Nexus has two separate applications.

### Terminal 1 — backend

```bash
cd /home/st4rk/Projects/Nexus/backend
bun install
bun run dev
```

Expected output:

```text
MongoDB connected
Nexus backend running on http://localhost:3000
```

Keep this terminal open. The backend is the API and database layer.

### Terminal 2 — frontend

```bash
cd /home/st4rk/Projects/Nexus/frontend
bun install
bun run dev -- --host 127.0.0.1
```

Open this address:

```text
http://127.0.0.1:5173
```

Keep this terminal open too. The frontend is the React dashboard.

## 2. Test through the browser

### Test admin login

1. Open the frontend address.
2. Enter the admin username and password created earlier.
3. Select **Login**.

Expected result:

- The login form disappears.
- The firmware upload form appears.
- The device table appears.
- The browser stores a JWT so a refresh keeps you logged in.

If the password is wrong, the page shows `Invalid username or password`.

### Test firmware upload

Create a small fake firmware binary:

```bash
dd if=/dev/urandom of=/tmp/nexus-test-firmware.bin bs=1024 count=4 status=none
```

In the dashboard:

1. Enter a version newer than the current release, such as `5.0.0`.
2. Enter release notes.
3. Choose `/tmp/nexus-test-firmware.bin`.
4. Select **Upload**.

Expected result:

```text
Uploaded firmware v5.0.0.
```

Versions must use `major.minor.patch`. If `5.0.0` already exists, use
`5.0.1`.

### Test device status

Run the simulator from Section 4, then refresh the dashboard.

- A device that checked in within the last five minutes shows **online**.
- After five minutes without a check-in, refresh the page and it shows
  **offline**.

This status is calculated from `lastSeenAt`.

## 3. Test the REST API with curl

Open a third terminal.

### Set the API address

```bash
API=http://127.0.0.1:3000
```

### Health check

```bash
curl "$API/health"
```

Expected response:

```json
{"status":"ok","service":"nexus-backend"}
```

This proves Express is running. It does not test login or firmware yet.

### Log in and save the JWT

Read the credentials without writing the password into this guide:

```bash
read -r "ADMIN_USERNAME?Admin username: "
read -rs "ADMIN_PASSWORD?Admin password: "
echo
```

Build the JSON safely and log in:

```bash
LOGIN_BODY=$(jq -n \
  --arg username "$ADMIN_USERNAME" \
  --arg password "$ADMIN_PASSWORD" \
  '{username:$username,password:$password}')

LOGIN_RESPONSE=$(curl -sS -X POST "$API/api/auth/login" \
  -H "Content-Type: application/json" \
  --data "$LOGIN_BODY")

echo "$LOGIN_RESPONSE" | jq
TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token')
```

The response contains a JWT. `TOKEN` now holds it for later commands.

### Prove that admin protection works

Without a token:

```bash
curl -i "$API/api/devices"
```

Expected status: `401 Unauthorized`.

With the JWT:

```bash
curl -sS "$API/api/devices" \
  -H "Authorization: Bearer $TOKEN" | jq
```

Expected status: `200 OK` with a `devices` array.

### Register a new device

Use a unique name each time:

```bash
DEVICE_NAME="manual-device-$(date +%s)"

REGISTER_BODY=$(jq -n \
  --arg name "$DEVICE_NAME" \
  '{name:$name,type:"temperature-sensor",currentFirmwareVersion:"1.0.0"}')

REGISTER_RESPONSE=$(curl -sS -X POST "$API/api/devices/register" \
  -H "Content-Type: application/json" \
  --data "$REGISTER_BODY")

echo "$REGISTER_RESPONSE" | jq
API_KEY=$(echo "$REGISTER_RESPONSE" | jq -r '.apiKey')
```

Expected result:

- HTTP `201 Created`
- A MongoDB device ID
- A long `apiKey`

The API key is the device's password. Nexus returns it once.

### Check for an update

```bash
UPDATE_RESPONSE=$(curl -sS -X POST "$API/api/devices/check-update" \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  --data '{"currentFirmwareVersion":"1.0.0"}')

echo "$UPDATE_RESPONSE" | jq
```

If a newer release exists, expect:

```json
{
  "updateAvailable": true,
  "latestVersion": "5.0.0",
  "downloadUrl": "/api/firmware/...",
  "releaseNotes": "..."
}
```

Try the same request without `x-api-key`. It should return `401`.

### Download and verify the firmware

Get the download URL:

```bash
DOWNLOAD_URL=$(echo "$UPDATE_RESPONSE" | jq -r '.downloadUrl')
curl -sS "$API$DOWNLOAD_URL" -o /tmp/nexus-downloaded-firmware.bin
```

Compare the uploaded and downloaded files:

```bash
sha256sum \
  /tmp/nexus-test-firmware.bin \
  /tmp/nexus-downloaded-firmware.bin
```

Both checksum values must be identical. That proves the binary survived:

```text
browser → Express → GridFS → Express → device
```

### List firmware as an admin

```bash
curl -sS "$API/api/firmware" \
  -H "Authorization: Bearer $TOKEN" | jq
```

Without the JWT, this endpoint returns `401`.

## 4. Run the complete simulated device

With the backend running:

```bash
cd /home/st4rk/Projects/Nexus
bun simulator/device.js
```

The script automatically:

1. Registers a unique device.
2. Receives and saves its API key in memory.
3. Checks for a newer firmware.
4. Downloads the binary.
5. Prints the downloaded size.

Successful output ends with:

```text
OTA loop complete
v1.0.0 → v5.0.0
```

The exact latest version may differ.

## 5. Inspect MongoDB Atlas

In Atlas, open **Browse Collections** for the `nexus` database.

You should see:

| Collection | What it stores |
|---|---|
| `admins` | Admin username and bcrypt password hash |
| `devices` | Device details, API key, firmware version, last check-in |
| `firmwares` | Version, notes, and GridFS file metadata |
| `firmwareFiles.files` | GridFS file records |
| `firmwareFiles.chunks` | Binary firmware chunks |

Important observations:

- Admin passwords look like `$2b$10$...`, not plain text.
- The device-list API hides API keys even though Atlas stores them.
- GridFS splits the firmware into chunks and rebuilds it during download.

## 6. Understand the code path

For most requests, follow this order:

```text
route → middleware → controller → model/service → MongoDB → JSON response
```

### Example: admin uploads firmware

```text
frontend/src/FirmwareUpload.jsx
        ↓ fetch + JWT + FormData
backend/routes/firmwareRoutes.js
        ↓ protect JWT + multer file limit
backend/controllers/firmwareController.js
        ↓ validate version and save metadata
backend/services/firmwareStorage.js
        ↓
MongoDB GridFS
```

### Example: device checks for an update

```text
simulator/device.js
        ↓ x-api-key + current version
backend/routes/deviceRoutes.js
        ↓ deviceAuth
backend/controllers/deviceController.js
        ↓ compare semantic versions
Device + Firmware models
        ↓
JSON answer with download URL
```

### Recommended source-reading order

1. `backend/server.js`
2. `backend/routes/deviceRoutes.js`
3. `backend/middleware/deviceAuthMiddleware.js`
4. `backend/controllers/deviceController.js`
5. `backend/models/Device.js`
6. `backend/routes/firmwareRoutes.js`
7. `backend/controllers/firmwareController.js`
8. `backend/services/firmwareStorage.js`
9. `frontend/src/App.jsx`
10. `frontend/src/Login.jsx`
11. `frontend/src/DeviceList.jsx`
12. `frontend/src/FirmwareUpload.jsx`

## 7. Expected security errors

These failures mean security is working:

| Test | Expected status |
|---|---|
| Wrong admin password | `401` |
| Device list without JWT | `401` |
| Firmware upload without JWT | `401` |
| Update check without device API key | `401` |
| Unknown browser origin | `403` |
| Invalid version such as `1.2` | `400` |
| Firmware larger than 10 MB | `413` |
| Missing record | `404` |

## Troubleshooting

### `Could not reach the server`

Check that the backend terminal still shows it running on port 3000.

### Port already in use

Find the old process:

```bash
ss -tlnp | grep -E ':3000|:5173'
```

Stop the old terminal process with `Ctrl+C`, then start it again.

### Login fails even with the expected password

Confirm the backend is using the same `MONGODB_URI` as the database where the
admin was created.

### Upload says the version already exists

Use the next semantic version, such as `5.0.1`.

### First request is slow

Local requests should be fast. The one-minute cold start applies only after a
future free Render deployment sleeps.
