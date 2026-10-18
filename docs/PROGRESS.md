# NEXUS — Progress Log

IoT OTA firmware + device-management platform (MERN).
This file is the single source of truth for *where we are* and *why we made each choice*.
Update it at the end of every work block.

---

## How to read this file
- **Phases** = big milestones, done in order. Finish and understand one before the next.
- Each phase has: a **goal**, the **concepts you should be able to explain** (for the viva),
  and a **done-when** checklist.
- `[ ]` = not started · `[~]` = in progress · `[x]` = done & tested.

---

## The phases

### Phase 0 — Foundations & setup  `[x]`
**Goal:** understand the architecture and get an empty-but-runnable backend.
**Explain:** what MERN is, client–server model, what a REST API is, why we split
code into models / routes / services (LO1).
**Done when:**
- [x] git initialised
- [x] progress tracking file exists
- [x] backend scaffolded (Express server boots, responds to a health-check route)
- [x] MongoDB Atlas connected (free tier)
- [x] understand the folder structure

### Phase 1 — Device registry  `[x]`
**Goal:** a device can register and be listed/tracked.
**Maps to brief steps 1 & 4.**
**Explain:** Mongoose schemas/models, Express routing, MVC separation, async/await.
**Done when:**
- [x] Device model (Mongoose)
- [x] `POST /api/devices/register`
- [x] `GET /api/devices` (list + online/offline status)
- [x] tested with curl

### Phase 2 — Firmware management  `[x]`
**Goal:** an admin can upload a firmware version with metadata.
**Maps to brief step 3.**
**Explain:** file uploads (multer), storing metadata vs the binary, semantic versioning.
**Done when:**
- [x] Firmware model
- [x] `POST /api/firmware` (upload: version, notes, file)
- [x] `GET /api/firmware` (list)
- [x] tested with curl

### Phase 3 — The OTA core  `[x]`
**Goal:** a device asks "is there a newer firmware for me?" and can download it.
**This is the heart of the app. Maps to brief step 2.**
**Explain:** REST resource design, version-comparison logic, status codes.
**Done when:**
- [x] `POST /api/devices/check-update` (returns whether a newer version exists)
- [x] `GET /api/firmware/:id/download`
- [x] tested with curl

### Phase 4 — Auth & security  `[x]`
**Goal:** only admins manage firmware; devices authenticate to check in.
**Maps to brief step 5. This is LO3 — heavily graded.**
**Explain:** authentication vs authorization, JWT, RBAC, device API keys, input validation.
**Done when:**
- [x] Admin model + `POST /api/auth/login` (JWT)
- [x] auth middleware (protect admin routes)
- [x] device API-key auth on check-in
- [x] input validation on all routes
- [x] unauthorized requests rejected (tested)

### Phase 5 — Admin dashboard (React)  `[x]`
**Goal:** admin can log in, upload firmware, and see devices + status.
**Maps to brief step 6.**
**Explain:** React components/state, calling a REST API from the frontend, JWT in the browser.
**Done when:**
- [x] login page (JWT stored, tested through Vite proxy)
- [x] device list view (status) — table + colored online/offline badges
- [x] firmware upload form (sends JWT + file via FormData)
- [x] talks to the real backend (all three features verified end-to-end)

### Phase 6 — Simulated device (full OTA loop)  `[x]`
**Goal:** a script proves the whole loop: register → check update → download.
**Maps to brief step 7. This is your live demo for the viva.**
**Done when:**
- [x] device-simulator script
- [x] runs the full loop end-to-end against the backend

### Phase 7 — Design writeup & viva prep  `[~]`
**Goal:** be able to justify every design decision (LO4) and pass the evaluation.
**Done when:**
- [x] study guide explains the architecture and current limitations
- [x] README with setup steps, ERD and screenshots
- [ ] can explain every file in the repo
- [ ] mini project report (max 10 pages) and demo video (max 5 minutes)

### Phase 8 — Full device CRUD  `[x]`
**Goal:** meet the rubric's CRUD requirement on the Device entity.
**Explain:** REST methods (GET/POST/PUT/DELETE), validation on both client and server, status codes.
**Done when:**
- [x] create (dashboard form + device self-registration)
- [x] read: list with search, status filter and sort; detail view
- [x] update (`PUT /api/devices/:id`, admin only)
- [x] delete with confirmation (`DELETE /api/devices/:id`, admin only)
- [x] schema validation with readable 400/404/409 errors; `bun test` covers the rules

### Phase 9 — Database relationships  `[x]`
**Goal:** connect the collections so the design shows real relationships (rubric: database design).
**Explain:** ObjectId references, `populate()`, modelling many-to-many with a join collection.
**Done when:**
- [x] `Firmware.uploadedBy` → Admin
- [x] `UpdateLog` (device + firmware + fromVersion), written by `POST /api/devices/report-update`
- [x] simulator reports the install; device detail shows update history
- [x] deleting a device deletes its logs
- [x] ERD in `docs/images/erd.png` (source `docs/erd.mmd`)

### Phase 10 — Interface redesign  `[x]`
**Goal:** a clear, consistent, responsive dashboard (rubric: UI/UX).
**Done when:**
- [x] one visual system (tokens in `index.css`), self-hosted fonts
- [x] login, fleet, detail and forms restyled; layout works at phone width
- [x] public landing page and logo, taken from the DevOps version's design
- [x] text contrast meets 4.5:1
- [x] devices go offline after 5 minutes without a check-in (`lastSeen`)

---

## Decisions log (the "why" — for LO4 / viva)
- **Stack:** MERN (allowed by module; brief mandates it).
- **DB:** MongoDB Atlas from day one for persistent device and release records.
- **Runtime/package manager:** Bun (not npm/node) — faster, all-in-one, simpler for a learner.
- **Plain JS, no TypeScript** — keep the learning load on web concepts, not a type system.
- **No ESLint/Docker/Jest yet** — out of scope for a learner; brief tests via curl/Postman.
- **Dev ergonomics:** `bun --watch` for auto-restart; .env for secrets (+ .env.example committed);
  one consistent JSON response shape + central error handler (added in Phase 1).
- **Learning artifacts:** LEARNING.md glossary kept current; README as the front door.
- **Bun + mongoose 9/bson 7 gotcha:** bson calls `v8.isBuildingSnapshot()` which this Bun
  build doesn't implement → crash on load. Fixed with a 3-line preload shim (`bun-patch.js`,
  wired via `bunfig.toml`). Delete the shim once Bun implements it. (Node runs it fine without.)
- **DB user gotcha:** Atlas auto-generated user failed auth; created a fresh user `nexusadmin`
  with a known password. Lesson: set DB credentials yourself, use only letters+numbers.
- **Bun install hang (Phase 4):** `bun add bcryptjs jsonwebtoken` hung forever at "Resolving
  dependencies" (Bun resolver stall; registry itself was reachable via curl). Worked around
  with `npm install --prefix backend bcryptjs jsonwebtoken` — same node_modules, Bun runs
  them fine at runtime. NOTE: plain `npm install` walked UP and polluted ~/ with a
  package.json + node_modules; always use `--prefix <dir>` (or run inside the dir). Cleaned up.
- **Security model:** admins = bcrypt-hashed passwords + JWT (Authorization: Bearer). Devices
  = per-device random apiKey (x-api-key header), stored select:false so it never leaks on reads.
- **Validation in the schema:** rules live once in the Mongoose models (length, `x.y.z` pattern,
  enum); the controller maps ValidationError → 400 and duplicate key 11000 → 409. The React forms
  repeat the rules as HTML constraints for instant feedback only.
- **UpdateLog as a join collection:** device ↔ firmware is many-to-many, so each install is its own
  document. MongoDB has no foreign keys, so deleting a device deletes its logs in the controller.
- **Offline status from lastSeen:** check-ins set `lastSeen`; reads mark devices silent for 5 minutes
  offline. Chosen over a background timer because it needs no extra process.
- **Shared database warning:** the DevOps version (`devops` branch) must use its own database name in
  `MONGODB_URI`; on 2026-10-19 it published firmware 6.0.0 into this version's database.

## Current state
- **Phases 0–6 and 8–10 COMPLETE.** Full device CRUD with search, filter and sort; validation on
  both sides; Admin → Firmware and Device ↔ Firmware (UpdateLog) relationships; simulator runs the
  whole loop including the install report; redesigned, responsive dashboard.
- **Phase 7 IN PROGRESS.** README (setup, ERD, screenshots) and study guide are current.

## Next action
Upload a real firmware release from the dashboard, run the simulator once to check the demo
works end to end, then write the report and record the demo video (due 31 October 2026).
