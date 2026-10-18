# 07 — Code map and viva practice

[Guide index](README.md)

## Find the relevant file

Paths below are relative to the repository root. Read in the order shown when tracing the app.

| File or group | What to look for |
|---|---|
| `frontend/index.html`, `src/main.jsx` | Root DOM element, React mount and stylesheet import |
| `frontend/src/App.jsx` | Login/dashboard decision, token ownership and logout |
| `frontend/src/Login.jsx` | Controlled form, JSON login request and callback to App |
| `frontend/src/api.js` | Shared JSON request helper and error handling |
| `frontend/src/DeviceList.jsx` | Search/filter/sort effect, screen switching, loading and error states |
| `frontend/src/DeviceForm.jsx`, `DeviceDetail.jsx` | Add/edit form with validation; detail view, update history and delete |
| `frontend/src/FirmwareUpload.jsx`, `Releases.jsx` | Multipart upload and the releases list |
| `frontend/src/Landing.jsx`, `landing.css` | Public landing page shown before login; scroll reveals use IntersectionObserver |
| `frontend/src/NexusLogo.jsx` | The logo (red mark, or white on red backgrounds) |
| `frontend/vite.config.js` | Local `/api` proxy |
| `frontend/src/index.css`, `src/fonts/` | Design tokens, components, responsive rules and bundled fonts |
| `backend/server.js` | Express setup, routes, database connection and listener |
| `backend/routes/*.js` | Which handlers and authentication gates each endpoint uses |
| `backend/middleware/*.js` | JWT and device-key verification |
| `backend/controllers/*.js` | Auth, device and firmware business operations |
| `backend/models/*.js` | Admin, Device, Firmware and UpdateLog schemas, validation rules and password hook |
| `backend/models/*.test.js` | Validation tests (`bun test`) |
| `backend/config/db.js` | Database connection before server startup |
| `backend/routes/firmwareRoutes.js` | Multer storage in `backend/uploads/` |
| `simulator/device.js` | Registration, update check, download and install report |
| Backend/frontend `package.json` and `backend/bun.lock` | Scripts, declared dependencies and resolved versions |
| `backend/bunfig.toml`, `bun-patch.js` | Local compatibility preload for the database library's V8 snapshot call |
| `backend/.env.example`, `.gitignore` files | Configuration template and secret/build exclusions |
| `instruction.md`, `intro.md` | Course announcement and project brief |
| `README.md`, `LEARNING.md`, `docs/` | Setup, ERD and screenshots, concepts, progress and this guide |

A lockfile records resolved dependencies; installed `node_modules` and generated `dist` are not source files to commit.

## A short demonstration

1. Open the dashboard and log in with an existing administrator account. Explain the password check and returned JWT.
2. Refresh the browser. Explain why localStorage restores the token and why the API still checks it.
3. Show the device table. Search, filter by status and change the sort order. Explain the query parameters and the 5-minute last-seen rule.
4. Add a device, open it, edit it, then delete it. Point out the confirmation prompt and a server validation message (for example a duplicate name).
5. Upload a small test binary with an unused version. Explain FormData, Multer disk storage and release metadata.
6. Run the simulator, then open its device. Show the update history row and explain UpdateLog. Explain the two separate credentials: admin JWT for management and API key for device check-in.
7. Show that an unauthenticated firmware upload is rejected, then discuss public list and registration routes.
8. Explain what a real bootloader would still need: validate compatibility and signature, install safely, recover from failure, and report the install only after verifying the new image boots.

For a local demonstration, run these in separate terminals from their indicated directories:

```bash
# backend/
bun install
bun run dev

# frontend/
bun install
bun run dev

# repository root, after the backend is running
bun simulator/device.js
```

Configure `backend/.env` from its example first. Use a valid Atlas URI and a generated secret; do not publish their values.

## Questions you should be able to answer

| Question | Essential answer |
|---|---|
| Why three layers? | UI, request rules and persistent data have different responsibilities and can change separately |
| Why React? | Components and state organize an interactive dashboard; HTML/CSS/JavaScript still underlie it |
| Why Express middleware? | Shared parsing and access checks run consistently before controller logic |
| What does update checking record? | The device's last-seen time. Installs are recorded by `report-update` as UpdateLog documents |
| Is MongoDB the same as Mongoose? | MongoDB stores data; Mongoose is an application library for schemas and queries |
| Why hash passwords? | Verify knowledge of the password without storing the original value |
| Does JWT encrypt data? | No; the signature detects tampering, while HTTPS protects transport |
| Is a JWT enough in this app? | Middleware also verifies that the administrator still exists in MongoDB |
| Is the current version comparison safe? | No; any different string can be offered, including an older version |
| Does download prove installation? | No. The simulator reports an install, and the server trusts that report. A real device would report only after flashing and verifying the image |
| How are devices and firmware related? | Through UpdateLog: one document per install, referencing one device and one firmware |
| Why does deleting a device delete its logs? | MongoDB has no foreign-key constraints, so the controller keeps references consistent itself |
| Does the backend start without Atlas? | No; it connects before listening |
| Can this scale without changes? | No; local firmware files and full-list queries need redesign for multiple backend instances |

## Readiness checklist

- [ ] I can draw the browser → Express → MongoDB flow without looking.
- [ ] I can trace login, firmware upload and device check-in through their files.
- [ ] I can explain props versus state, and when the device effect runs.
- [ ] I can name each endpoint's access requirement.
- [ ] I can demonstrate a rejected unauthorized upload and a successful authorized upload.
- [ ] I can explain both a benefit and a limitation of each major design choice.
- [ ] I can distinguish implemented behavior, live verification and future work.

If an answer is unclear, return to the relevant chapter and open the named source file. Understanding the data flow is more useful than memorizing a script.
