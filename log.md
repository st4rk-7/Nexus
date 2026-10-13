# Lab Log — EC5207 DevOps

**Group 72** | Members: `EG/2023/5890`, `EG/2023/5893` | NCC Lab IPs: `10.50.80.152`, `10.50.80.151`

---

## Day 1 — 17/09/2026: Environment Setup & Project Registration

**Author:** Shewon and Akila

- **Git & Editor:** Installed VS Code, configured Git, and connected to GitHub (`devops` branch).
- **Course Tracker:** Registered Group 72 with stack (`ReactJS + Vite`, `Express.js + Bun`) and lab PC IPs.
- **Repository:** Initialized clean project baseline, `.gitignore`, and tracking log.
- **Next:** Bring up web app baseline with login functionality, then start Docker containerization.

---

Work below was prepared on **21/09/2026**. The dates are assigned Git commit
dates; 23–27 September do not represent completed lab sessions.

## 21/09/2026 — Frontend

**Author:** Shewon

- Reused the React/Vite frontend from `main`; configured port 5174 and the API proxy.

## 23/09/2026 — Backend

**Author:** Shewon

- Adapted the Express/Bun backend from `main` to run without a database; added a local demo login and temporary storage.

## 24/09/2026 — Device Simulator

**Author:** Shewon

- Reused the device simulator from `main` for registration, update checks, and firmware downloads on port 3001.

## 26/09/2026 — Verification

**Author:** Shewon

- Added six passing API tests; checked the frontend build and login through its API proxy.

## 27/09/2026 — Setup Guide

**Author:** Akila

- Documented startup, demo login, and verification steps for both members.
- **Planned before 28/09:** practise the demonstration together; follow the next lecture for Docker.

## 28/09/2026 — Frontend Design

**Author:** Akila

- Redesigned login and the IoT console with separate Devices and Firmware views, device search, status filtering, and mobile layouts.
- Verified browser flows, session expiry, upload errors, production build, and six API tests.

## 29/09/2026 — Docker Preparation

**Author:** Shewon

- Prepared local Linux and Windows Docker setup guides; containers have not been built.

## 30/09/2026 — Docker Setup

**Author:** Shewon and Akila

- Installed Docker on each member's personal computer.
- Added Dockerfiles for the frontend and backend, an Nginx config, and a Docker Compose file.
- Built and started both containers with Docker Compose.
- Checked the dashboard on port 8080 and backend health on port 3001.

## 06/10/2026 — Docker Compose & Network Isolation

**Author:** Shewon

- Configured custom Docker bridge networks for the frontend Nginx reverse proxy and Bun backend.
- Tuned container health checks and volume mounts for static firmware binary persistence.
- Verified local multi-container orchestration across development environments with zero host port collisions.

## 09/10/2026 — Device Fleet Simulator & API Load Testing

**Author:** Akila

- Enhanced the device simulation runner (`simulator/device.js`) to generate multi-architecture hardware traffic (ESP32, STM32, RP2040).
- Validated concurrent check-in heartbeats and simulated firmware binary downloads against the running backend container.
- Documented API latency and memory consumption during simultaneous OTA payload transfers.

## 13/10/2026 — Developer Console & Technical UI Polish

**Author:** Shewon and Akila

- Overhauled both public and authenticated interfaces with a dark-technical console design system and token structure.
- Integrated GSAP for scoped hardware telemetry transitions and micro-interactions.
- Aligned CORS configurations across dev/prod container ports and verified authentication flows with automated browser captures.
