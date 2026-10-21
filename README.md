# Nexus — DevOps Coursework

EC5207 · Group 72 · EG/2023/5890 and EG/2023/5893

Reuses the Nexus web application from `main` (`b7695d9`) for DevOps practicals.
Work here on `devops`; the original web project stays on `main`.

## How it works

- **Frontend:** React + Vite displays login, devices, and firmware upload.
- **Backend:** Express on Bun handles authentication, devices, and firmware.
- **Database:** MongoDB stores admin accounts, devices, and firmware metadata. Firmware binaries are stored with GridFS.
- **Simulator:** acts as a device to register, check updates, and download firmware.

MongoDB data persists when the backend restarts. The configured lab account is
created on first startup. For local development, each team member can run their
own MongoDB container and database.

## Run locally

Install Bun and Docker first. Start the local MongoDB container from the project root:

```sh
docker compose up -d mongo
```

Open two terminals in the project folder.

**Terminal 1 — backend**

```sh
cd backend
bun install --frozen-lockfile
cp .env.example .env
```

Run `openssl rand -hex 32` and put its output into `JWT_SECRET` in `.env`.
Copy `.env.example` only on first setup; keep `.env` private.

```sh
bun run dev
```

Backend: http://localhost:3001 · Health check: http://localhost:3001/health

**Terminal 2 — frontend**

```sh
cd frontend
bun install --frozen-lockfile
bun run dev
```

Open http://localhost:5174. No frontend `.env` is needed; Vite forwards `/api`
requests to the backend. These ports keep the two Nexus versions separate.

Local demo login from `backend/.env.example`: **admin / nexus-lab-2026**.
Change `ADMIN_USERNAME` and `ADMIN_PASSWORD` in `.env` to use another account.

MongoDB listens on `localhost:27017`. Keep `.env` private; the Compose backend
uses the service hostname `mongo` automatically.

## Run with Docker Compose

Copy `backend/.env.example` to `backend/.env`, set a private `JWT_SECRET`, then
run from the project root:

```sh
docker compose up --build
```

The web console is at http://localhost:8081. MongoDB data lives in the named
`mongodb_data` volume and survives container restarts. `docker compose down -v`
also removes that data volume.

## Verify the application

1. Log in and upload a small test file as firmware version `1.1.0`.
2. In a third terminal, from the project root, run `bun simulator/device.js`.
3. Confirm the simulator registers, finds the update, and downloads the file.
4. Refresh the dashboard to see the registered device.

Upload limits: 10 MB per file and 50 MB total firmware storage.

Automated checks:

Start MongoDB with `docker compose up -d mongo`, then run `bun test` in `backend`.
The API tests use a separate temporary database and remove it when finished.

From a separate terminal at the project root:

```sh
cd frontend
bun run build
```

## Working together

- Each member uses a feature branch and a local MongoDB container; merge changes into `devops` with pull requests.
- One member runs the app; the other traces frontend → API → MongoDB and records the result.
- Commit and push before leaving the lab. Pull before starting another session.
- Add only work actually completed to [log.md](log.md); label future tasks as planned.

Before September 28: both members should practise startup and the demonstration.
