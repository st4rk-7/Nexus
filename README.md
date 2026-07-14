# Nexus

For a guided explanation of the code and module theory, start with the
[study guide](docs/study-guide/README.md).

A web platform for managing IoT devices and pushing firmware updates to them
**over the air (OTA)**. Admins register devices, upload firmware versions, and roll
them out from a dashboard. Devices check in over a REST API, ask if newer firmware
exists, and download it. Think *"app store for firmware"* for a fleet of devices.

Built for **EC4307 — Web Application Development** (University of Ruhuna).

## Tech stack
- **Backend:** Bun + Express + Mongoose
- **Database:** MongoDB (Atlas)
- **Frontend:** React + Vite
- **Auth:** JWT (admins) + API keys (devices)

## Status
The local frontend, backend, and device simulator are implemented. See
[`docs/PROGRESS.md`](docs/PROGRESS.md) for current status and
[`LEARNING.md`](LEARNING.md) for a plain-English glossary.

## Running it locally

Copy `backend/.env.example` to `backend/.env`, then set `MONGODB_URI` and
`JWT_SECRET` before starting the backend.

```bash
cd backend
bun install
bun run dev
```

In another terminal:

```bash
cd frontend
bun install
bun run dev
```

Open `http://localhost:5173`.

## Project layout
```
Nexus/
├── backend/        # Express API server
├── frontend/       # React dashboard
├── simulator/      # simulated device
├── docs/
│   ├── PROGRESS.md # phase plan + progress log
│   └── study-guide/ # module explanations and viva practice
├── LEARNING.md     # concept glossary (the "why")
└── README.md       # you are here
```
