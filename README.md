# Nexus

Nexus is a web platform for managing IoT devices and delivering firmware
updates over the air (OTA). Devices register through a REST API, check for a
newer firmware version, and download it. Administrators use a React dashboard
to view device status and upload firmware.

Built for **EC4307 — Web Application Development** at the University of Ruhuna.

## Features

- Device registration with a unique API key
- Online/offline device status
- Admin login with bcrypt password hashing and JWT authentication
- Protected firmware upload and listing
- Firmware binaries stored safely in MongoDB GridFS
- Semantic version comparison that never offers a downgrade
- OTA check and firmware download endpoints
- React admin dashboard
- Simulated-device script for an end-to-end demonstration
- Render and Vercel deployment configuration

## Stack

- **Backend:** Bun, Express, Mongoose
- **Database:** MongoDB Atlas and GridFS
- **Frontend:** React and Vite
- **Authentication:** JWT for admins, API keys for devices
- **Deployment:** Render for the API, Vercel for the dashboard

## Local setup

Prerequisites:

- Bun 1.3.14 or newer
- A MongoDB Atlas connection string

Set up and run the backend:

```bash
cp backend/.env.example backend/.env
# Fill in MONGODB_URI and JWT_SECRET in backend/.env

cd backend
bun install
bun run dev
```

In another terminal, run the frontend:

```bash
cd frontend
bun install
bun run dev
```

Open `http://localhost:5173`.

### Create the first admin

For a new, empty database only:

1. Set `ALLOW_ADMIN_REGISTRATION=true` in `backend/.env`.
2. Start the backend.
3. Register the first admin:

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"choose-a-strong-password"}'
```

4. Immediately change `ALLOW_ADMIN_REGISTRATION` back to `false`.

The registration endpoint refuses additional admins and is closed by default.

## Main API endpoints

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| `POST` | `/api/auth/login` | Public | Admin login and JWT creation |
| `POST` | `/api/devices/register` | Public | Register a new device |
| `POST` | `/api/devices/check-update` | Device API key | Check for newer firmware |
| `GET` | `/api/devices` | Admin JWT | List devices and status |
| `POST` | `/api/firmware` | Admin JWT | Upload firmware |
| `GET` | `/api/firmware` | Admin JWT | List firmware versions |
| `GET` | `/api/firmware/:id/download` | Public link | Download a firmware binary |
| `GET` | `/health` | Public | Confirm the API is running |

## Simulated device

With the backend running:

```bash
bun simulator/device.js
```

Against a deployed backend:

```bash
API_URL=https://your-api.onrender.com bun simulator/device.js
```

The script demonstrates the complete flow:

```text
register → receive API key → check update → download firmware
```

## Deployment

The repository contains:

- [`render.yaml`](render.yaml) for the backend
- [`frontend/vercel.json`](frontend/vercel.json) for the frontend
- [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) with the complete beginner-friendly guide

## Project layout

```text
Nexus/
├── backend/
│   ├── config/        # database connection
│   ├── controllers/   # request logic
│   ├── middleware/    # admin and device authentication
│   ├── models/        # MongoDB data shapes
│   ├── routes/        # API URLs
│   ├── services/      # GridFS file storage
│   └── utils/         # version comparison
├── frontend/          # React admin dashboard
├── simulator/         # simulated IoT device
├── docs/              # progress and deployment guides
├── LEARNING.md        # plain-English concept notes
└── README.md
```

## Project status

Phases 0–6 are complete. Phase 7 is deployment preparation/in progress. See
[`docs/PROGRESS.md`](docs/PROGRESS.md) for the full checklist.

## Future work

These features are intentionally outside the MVP:

- Staged or percentage rollouts
- Automatic rollback
- Device groups
- Telemetry and metrics
- Real hardware integration

## License

This is an academic project. No open-source license has been assigned.
