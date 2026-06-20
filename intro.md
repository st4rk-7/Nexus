# NEXUS — Project Brief

## What it is
A web-based platform for managing IoT devices and pushing firmware updates to them
over the air (OTA). Admins register devices, upload new firmware versions, and roll
them out from a dashboard. Devices check in over a REST API, see if a newer firmware
exists, and download it. Think "app store for firmware," for a fleet of devices.

## The problem it solves
IoT devices in the field can't be updated by hand. Nexus gives a central place to
track every device, see its current firmware + status, and push updates remotely —
safely and with a record of what's deployed where.

## Core goals (what "done" means)
1. A device can register itself and is tracked in the system.
2. An admin can upload a firmware version with metadata (version number, notes, file).
3. A device can ask "is there a newer firmware for me?" and get the right answer + download link.
4. An admin can see all devices, their current firmware, and online/offline status on a dashboard.
5. Access is secured — only authorized admins manage firmware; devices authenticate to check in.
6. The whole thing is deployable to the cloud, not just localhost.

## Scope
IN (MVP):
- Device registry (register, list, status)
- Firmware versions (upload, list)
- OTA check + download endpoint
- Admin dashboard (React)
- Auth: JWT for admins, token/key auth for devices
OUT (for now):
- Staged/percentage rollouts, rollback automation, device groups, telemetry/metrics,
  real hardware integration. Note these as "future work" — don't build them yet.

## Success / acceptance criteria
- Every endpoint works end-to-end and is testable with curl/Postman.
- A simulated device (a script) can: register → check for update → download firmware.
- Admin can log in, upload firmware, and watch a device pick it up.
- Unauthorized requests are rejected.
- App runs deployed (MongoDB Atlas + Render/Vercel), not only locally.

## Evaluation criteria (graded — these are what's marked)
- LO1: Correct use of components/architecture (clear separation: models, routes, services).
- LO2: Proper use of frameworks (Express, Mongoose, React — idiomatic, not hacked).
- LO3: REST design, authentication, and security done correctly (JWT, RBAC, input validation).
- LO4: A working full-stack app, with reasoning for performance/usability/scalability choices.

## Tech stack
Backend: Node + Express + MongoDB (Mongoose)
Frontend: React
Auth: JWT (admins) + device API keys
Deploy: MongoDB Atlas + Render (backend) + Vercel (frontend)

## Build order (achieve in this sequence)
1. [DONE] POST /api/devices/register
2. POST /api/devices/check-update      ← current
3. Firmware model + POST /api/firmware (admin upload)
4. GET /api/devices (list + status) — for dashboard
5. Auth layer (JWT admins, device keys)
6. React dashboard
7. Simulated-device test script (proves the full OTA loop)
8. Deploy to cloud

Rule: one step at a time, test with curl before moving on, working over complete.
