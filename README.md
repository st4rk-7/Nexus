# Nexus — DevOps Coursework

EC5207 · Group 72 · EG/2023/5890 and EG/2023/5893

Reuses the Nexus web application from `main` (`b7695d9`) for DevOps practicals.
Work here on `devops`; the original web project stays on `main`.
Next lecture: **28 September 2026**. Containerization will follow the lecture.

## How it works

- **Frontend:** React + Vite displays login, devices, and firmware upload.
- **Backend:** Express on Bun handles authentication, devices, and firmware.
- **Storage:** temporary backend memory. No database or MongoDB cluster is required.
- **Simulator:** acts as a device to register, check updates, and download firmware.

Restarting the backend clears all devices, uploads, and sessions. The configured
lab account is recreated at startup. Log out and log back in after a restart.
This simple lab setup is intended for one backend process.

## Run locally

Install Bun first. Open two terminals in the project folder.

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

## Verify the application

1. Log in and upload a small test file as firmware version `1.1.0`.
2. In a third terminal, from the project root, run `bun simulator/device.js`.
3. Confirm the simulator registers, finds the update, and downloads the file.
4. Refresh the dashboard to see the registered device.

Upload limits: 10 MB per file and 50 MB total temporary firmware storage.

Automated checks:

```sh
cd backend
bun test
```

From a separate terminal at the project root:

```sh
cd frontend
bun run build
```

## Working together

- One member runs the app; the other traces a request and records the result.
- Swap roles so both can explain frontend → API → temporary storage.
- Commit and push before leaving the lab. Pull before starting another session.
- Add only work actually completed to [log.md](log.md); label future tasks as planned.

Before September 28: both members should practise startup and the demonstration.
