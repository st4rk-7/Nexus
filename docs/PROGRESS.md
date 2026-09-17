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

### Phase 7 — Deploy to cloud  `[~]`
**Goal:** the app runs deployed, not just on localhost.
**Maps to brief step 8. Bonus per the brief ("hosting is better but not required").**
**Done when:**
- [x] cloud-safe firmware storage (MongoDB GridFS)
- [x] Render and Vercel configuration files
- [x] production API URL + CORS configuration
- [x] local production build and full OTA test
- [x] project pushed to a Git remote
- [ ] backend on Render
- [ ] frontend on Vercel
- [x] Atlas as the DB
- [ ] simulator passes against the deployed backend

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
- **Bun install hang (Phase 4):** `bun add bcryptjs jsonwebtoken` hung forever at "Resolving
  dependencies" (Bun resolver stall; registry itself was reachable via curl). Worked around
  with `npm install --prefix backend bcryptjs jsonwebtoken` — same node_modules, Bun runs
  them fine at runtime. NOTE: plain `npm install` walked UP and polluted ~/ with a
  package.json + node_modules; always use `--prefix <dir>` (or run inside the dir). Cleaned up.
- **Security model:** admins = bcrypt-hashed passwords + JWT (Authorization: Bearer). Devices
  = per-device random apiKey (x-api-key header), stored select:false so it never leaks on reads.
- **Cloud file storage:** Render's free filesystem is temporary, so firmware binaries use
  MongoDB GridFS. Upload/download checksums match and the simulator completed against it.
- **Version safety:** compare `major.minor.patch` numerically; offer only newer firmware,
  never a downgrade.
- **Production browser access:** Vite uses a configurable `VITE_API_URL`; Express allows
  only the configured `CLIENT_ORIGIN`. Curl and devices remain usable without Origin.
- **Admin setup:** public admin creation is closed by default and can only bootstrap the
  first account when `ALLOW_ADMIN_REGISTRATION=true`.

## Current state
- **Phase 7 IN PROGRESS.** Deployment code is ready and locally verified. The repository
  is pushed to GitHub at st4rk-7/Nexus. Backend (Render) and frontend (Vercel) cloud
  services remain to be connected when ready.
- A complete manual browser, curl, simulator, Atlas, and code-reading walkthrough is
  available in `docs/TESTING.md`.

## Next action
Follow `docs/TESTING.md` to test and understand every layer. Then begin Phase 8:
write the architecture/design explanation and prepare for the viva. When cloud
deployment resumes, follow `docs/DEPLOYMENT.md`.
