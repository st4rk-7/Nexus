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

## Database & secrets

**`.env`** — a file holding secrets (DB password, etc.) as `KEY=value` lines. It's listed
in `.gitignore` so it's never saved to git. `import "dotenv/config"` loads it into
`process.env` so code can read `process.env.MONGODB_URI`. `.env.example` is a safe copy
(no real values) that *is* committed, so others know what keys are needed.

**Mongoose** — the helper that talks to MongoDB for us. `mongoose.connect(uri)` opens the
connection using the secret address from `.env`. We put this in its own file (`config/db.js`)
so each file has one job (clean structure = LO1 marks).

**Connection string** — the secret address of the database, e.g.
`mongodb+srv://user:password@cluster.../nexus`. The bit after the last `/` (`nexus`) names
the database. Passwords with symbols (`@ / : #`) break it — use letters+numbers only.

**`bunfig.toml` / preload** — Bun's config file. `preload` runs a file before our app.
We use it to load `bun-patch.js`, a shim that fixes a missing Bun feature the DB needs.

## Firmware & Uploads

**Multer** — a middleware for Express that handles file uploads. Express `express.json()`
can only read text (JSON). When uploading files, the request type is `multipart/form-data`.
Multer catches the file, saves it to a folder (like `uploads/`), and adds `req.file`
so our code knows where to find it.

## Auth & security (LO3)

**Authentication vs authorization** — *authentication* = "who are you?" (login).
*authorization* = "are you allowed to do this?" (only admins may upload). Two different questions.

**Hashing (bcrypt)** — we never store real passwords. bcrypt scrambles a password into a
one-way "hash" (`$2b$10$...`). You can't un-scramble it. To check a login, we hash what
the user typed and compare hashes. If the DB leaks, the real passwords aren't in it.
A "salt" is random data mixed in so two identical passwords get different hashes.

**JWT (JSON Web Token)** — after a correct login the server hands back a signed "badge."
The client sends it on later requests as a header: `Authorization: Bearer <token>`.
The server checks the signature (using `JWT_SECRET`) to trust it — no DB lookup of a
password each time. Tokens expire (we use 1 day) so a stolen one doesn't last forever.

**Middleware as a gate** — `protect` runs *before* a route. It reads the token, verifies it,
and either calls `next()` (continue) or replies `401`. Same idea as `express.json()`, but
for security. `deviceAuth` is the device version: it checks an `x-api-key` header.

**Device API key** — each device gets a long random secret (`crypto.randomBytes`) at
registration — its "password." It sends it as `x-api-key` to check in. We mark the field
`select: false` so it's hidden on normal reads (listing devices never leaks keys); we only
fetch it with `.select("+apiKey")` when verifying. Shown to the owner once, at registration.

**401 vs 403** — `401 Unauthorized` = "I don't know who you are / bad credentials."
`403 Forbidden` = "I know who you are, but you're not allowed." We use vague, identical
login errors ("Invalid username or password") so attackers can't tell which usernames exist.

---

*(more entries added as we build — React, etc.)*
