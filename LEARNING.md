# Nexus — Learning Glossary

Plain-English notes on every concept we use, in the order we meet them.
This is your viva cheat-sheet. We add to it as we build. Keep entries short.

---

## Architecture

**MERN** — the stack: **M**ongoDB (database), **E**xpress (web server framework),
**R**eact (frontend), **N**ode.js (runs JavaScript outside the browser). All JavaScript,
front to back.

**Client–server model** — the *client* (browser/device) asks; the *server* (our backend)
answers. They talk over HTTP.

**HTTP** — the language of the web. A request has a **method** (GET, POST, …) + a **URL**,
and gets back a **status code** + a **body** (usually JSON).

**REST API** — the menu of requests our server understands. Each entry = method + URL,
e.g. `POST /api/devices/register` means "create a new device." REST treats things as
**resources** (devices, firmware) you act on with standard HTTP methods.

**JSON** — the text format we send data in. Looks like a JavaScript object:
`{ "name": "sensor-01", "status": "online" }`.

**HTTP methods we use**
- `GET` — read (list devices)
- `POST` — create / send data (register a device)
- `PUT`/`PATCH` — update
- `DELETE` — remove

**Status codes we use**
- `200` OK · `201` Created · `400` Bad request (your input was wrong)
- `401` Unauthorized (not logged in) · `403` Forbidden (logged in, not allowed)
- `404` Not found · `500` Server error (we broke)

## Why we split the code (MVC-ish) — graded under LO1
- **models/** — the *shape* of the data (a Device has a name, status, firmware version).
- **routes/** — maps a URL to a handler ("a POST to /api/devices/register → do X").
- **controllers/** — the actual logic for each route.
- **server.js** — boots everything and wires it together.
Separation = each file has one job. Easier to read, test, and explain.

## Express (the web server framework)

**`express()`** — creates our app: the thing that listens for HTTP requests and routes
each one to a handler function.

**Route** — `app.get("/health", handler)` means "when a GET request hits /health, run
this function." The handler gets `(req, res)`: `req` = the incoming request, `res` = the
reply we build. `res.json({...})` sends JSON back.

**Middleware** — a function Express runs on a request *before* it reaches your route.
`app.use(express.json())` is middleware that reads a JSON request body into `req.body`.

**Port** — the numbered "door" the server listens on (we use 3000 in dev). The browser
reaches it at `http://localhost:3000`.

**Bun** — our runtime + package manager (replaces node + npm). `bun add x` installs,
`bun --watch server.js` runs and auto-restarts on save (no nodemon needed).

---

*(more entries added as we build — Mongoose, .env, JWT, etc.)*
