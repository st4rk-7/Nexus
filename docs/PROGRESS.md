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

## The 8 phases

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

### Phase 4 — Auth & security  `[ ]`
**Goal:** only admins manage firmware; devices authenticate to check in.
**Maps to brief step 5. This is LO3 — heavily graded.**
**Explain:** authentication vs authorization, JWT, RBAC, device API keys, input validation.
**Done when:**
- [ ] Admin model + `POST /api/auth/login` (JWT)
- [ ] auth middleware (protect admin routes)
- [ ] device API-key auth on check-in
- [ ] input validation on all routes
- [ ] unauthorized requests rejected (tested)

### Phase 5 — Admin dashboard (React)  `[ ]`
**Goal:** admin can log in, upload firmware, and see devices + status.
**Maps to brief step 6.**
**Explain:** React components/state, calling a REST API from the frontend, JWT in the browser.
**Done when:**
- [ ] login page
- [ ] device list view (status)
- [ ] firmware upload form
- [ ] talks to the real backend

### Phase 6 — Simulated device (full OTA loop)  `[ ]`
**Goal:** a script proves the whole loop: register → check update → download.
**Maps to brief step 7. This is your live demo for the viva.**
**Done when:**
- [ ] device-simulator script
- [ ] runs the full loop end-to-end against the backend

### Phase 7 — Deploy to cloud  `[ ]`
**Goal:** the app runs deployed, not just on localhost.
**Maps to brief step 8. Bonus per the brief ("hosting is better but not required").**
**Done when:**
- [ ] backend on Render
- [ ] frontend on Vercel
- [ ] Atlas as the DB

### Phase 8 — Design writeup & viva prep  `[ ]`
**Goal:** be able to justify every design decision (LO4) and pass the evaluation.
**Done when:**
- [ ] short doc: why this architecture, perf/usability/scalability choices
- [ ] can explain every file in the repo

---

## Decisions log (the "why" — for LO4 / viva)
- **Stack:** MERN (allowed by module; brief mandates it).
- **DB:** MongoDB Atlas from day one — it's also the deploy target, so no migration later.
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

## Current state
- **Phase 3 COMPLETE.** Devices can check for updates and download the firmware binary.
- Next: Phase 4 — Auth & security.

## Next action
Phase 4: Build Admin model and JWT login so only admins can upload firmware.
