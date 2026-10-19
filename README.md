# Nexus — DevOps & Web Development Coursework

A web platform for managing IoT devices and deploying firmware updates over the air (OTA).
Admins register devices, manage releases, and monitor fleet status. Devices check in over a REST API, verify firmware versions, download updates, and report installation logs.

## Tech Stack

- **Backend:** Express on Bun with Mongoose (MongoDB Atlas)
- **Frontend:** React + Vite
- **Containers:** Docker & Docker Compose (Nginx frontend reverse proxy + Node/Bun backend + simulator profile)
- **Authentication:** JWT for administrators, API keys (`x-api-key`) for IoT devices

## Services & Ports

- **Frontend (Dev):** `http://localhost:5174` (proxies `/api` to port 3001)
- **Frontend (Docker):** `http://localhost:8080`
- **Backend API:** `http://localhost:3001` (health check: `/health`)

## Run with Docker Compose

```sh
docker compose up -d
```

To run the device simulator inside Docker (no local Bun/Node required on lab PCs):

```sh
docker compose run --rm simulator
```

## Run Locally with Bun

**Terminal 1 — Backend:**

```sh
cd backend
bun install
cp .env.example .env # set MONGODB_URI and JWT_SECRET
bun run dev
```

**Terminal 2 — Frontend:**

```sh
cd frontend
bun install
bun run dev
```

Visit `http://localhost:5174`.

**Terminal 3 — Device Simulator:**

```sh
bun simulator/device.js
```
