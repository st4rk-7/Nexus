# Lab Log — EC5207 DevOps

**Group 72** | Members: `EG/2023/5890`, `EG/2023/5893` | NCC Lab IPs: `10.50.80.152`, `10.50.80.151`

---

## Day 1 — 17/09/2026: Environment Setup & Project Registration

- **Git & Editor:** Installed VS Code, configured Git, and connected to GitHub (`devops` branch).
- **Course Tracker:** Registered Group 72 with stack (`ReactJS + Vite`, `Express.js + Bun`) and lab PC IPs.
- **Repository:** Initialized clean project baseline, `.gitignore`, and tracking log.
- **Next:** Bring up web app baseline with login functionality, then start Docker containerization.

---

Work below was prepared on **21/09/2026**. The dates are assigned Git commit
dates; 23–27 September do not represent completed lab sessions.

## 21/09/2026 — Frontend

- Reused the React/Vite frontend from `main`; configured port 5174 and the API proxy.

## 23/09/2026 — Backend

- Adapted the Express/Bun backend from `main` to run without a database; added a local demo login and temporary storage.

## 24/09/2026 — Device Simulator

- Reused the device simulator from `main` for registration, update checks, and firmware downloads on port 3001.

## 26/09/2026 — Verification

- Added six passing API tests; checked the frontend build and login through its API proxy.
