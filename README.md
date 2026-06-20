# Nexus

A web platform for managing IoT devices and pushing firmware updates to them
**over the air (OTA)**. Admins register devices, upload firmware versions, and roll
them out from a dashboard. Devices check in over a REST API, ask if newer firmware
exists, and download it. Think *"app store for firmware"* for a fleet of devices.

Built for **EC4307 — Web Application Development** (University of Ruhuna).

## Tech stack
- **Backend:** Node.js + Express + Mongoose
- **Database:** MongoDB (Atlas)
- **Frontend:** React *(coming in Phase 5)*
- **Auth:** JWT (admins) + API keys (devices) *(Phase 4)*

## Status
Early development. See [`docs/PROGRESS.md`](docs/PROGRESS.md) for the phase plan and
current state, and [`LEARNING.md`](LEARNING.md) for a plain-English glossary of the
concepts used.

## Running it (backend)
> Filled in once the backend is scaffolded.

```bash
cd backend
bun install
bun run dev
```

## Project layout
```
Nexus/
├── backend/        # Express API server
├── docs/
│   └── PROGRESS.md # phase plan + progress log
├── LEARNING.md     # concept glossary (the "why")
└── README.md       # you are here
```
