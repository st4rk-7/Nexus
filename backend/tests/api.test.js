import { afterAll, beforeAll, expect, test } from "bun:test";
import { fileURLToPath } from "node:url";

const backendDirectory = fileURLToPath(new URL("..", import.meta.url));

let server;
let base;
let token;
const password = "test-password-2026";

async function startServer() {
  server = Bun.spawn([process.execPath, "server.js"], {
    cwd: backendDirectory,
    env: {
      ...process.env,
      PORT: "0",
      JWT_SECRET: "integration-test-secret-only",
      ADMIN_USERNAME: "test-admin",
      ADMIN_PASSWORD: password,
      ALLOW_ADMIN_REGISTRATION: "false",
      MAX_FIRMWARE_SIZE_MB: "1",
    },
    stdout: "pipe",
    stderr: "inherit",
  });
  const reader = server.stdout.getReader();
  const timeout = setTimeout(() => server.kill(), 5000);
  let output = "";
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) throw new Error("Backend stopped before startup");
      output += new TextDecoder().decode(value);
      const match = output.match(/http:\/\/localhost:\d+/);
      if (match) { base = match[0]; return; }
    }
  } finally {
    clearTimeout(timeout);
    reader.releaseLock();
  }
}

async function stopServer() {
  if (!server) return;
  server.kill();
  await server.exited;
}

function post(path, body, headers = {}) {
  return fetch(`${base}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

function upload(version, bytes = new Uint8Array([0, 1, 127, 255])) {
  const form = new FormData();
  form.append("version", version);
  form.append("releaseNotes", "Lab release");
  form.append("file", new Blob([bytes]), "firmware.bin");
  return fetch(`${base}/api/firmware`, {
    method: "POST", headers: { Authorization: `Bearer ${token}` }, body: form,
  });
}

beforeAll(async () => {
  await startServer();
  const response = await post("/api/auth/login", { username: "test-admin", password });
  expect(response.status).toBe(200);
  token = (await response.json()).token;
});
afterAll(stopServer);

test("health and authentication work without a database", async () => {
  expect((await fetch(`${base}/health`)).status).toBe(200);
  expect((await fetch(`${base}/api/devices`)).status).toBe(401);
  expect((await post("/api/auth/login", { username: "test-admin", password: "wrong" })).status).toBe(401);
  expect((await post("/api/auth/register", { username: "second", password })).status).toBe(403);
  expect((await fetch(`${base}/api/firmware`, { method: "POST" })).status).toBe(401);
});

test("devices validate input, reject duplicates and hide API keys", async () => {
  expect((await post("/api/devices/register", { name: " ", type: "sensor" })).status).toBe(400);
  const response = await post("/api/devices/register", { name: "sensor-01", type: "sensor" });
  expect(response.status).toBe(201);
  const registered = await response.json();
  expect(registered.apiKey).toHaveLength(64);
  expect(registered.device.apiKey).toBeUndefined();
  expect((await post("/api/devices/register", { name: "sensor-01", type: "sensor" })).status).toBe(400);
  const list = await fetch(`${base}/api/devices`, { headers: { Authorization: `Bearer ${token}` } });
  const { devices } = await list.json();
  expect(devices[0].name).toBe("sensor-01");
  expect(devices[0].apiKey).toBeUndefined();
  expect(devices[0].status).toBe("online");
  expect((await post("/api/devices/check-update", {})).status).toBe(401);
  const check = await post("/api/devices/check-update", {}, { "x-api-key": registered.apiKey });
  expect((await check.json()).updateAvailable).toBe(false);
});

test("firmware upload, version selection and binary download work together", async () => {
  expect((await upload("1.2.0")).status).toBe(201);
  expect((await upload("1.10.0")).status).toBe(201);
  expect((await upload("1.10.0")).status).toBe(400);
  expect((await upload("bad-version")).status).toBe(400);
  const registration = await post("/api/devices/register", { name: "update-sensor", type: "sensor" });
  const { apiKey } = await registration.json();
  const check = await post("/api/devices/check-update", { currentFirmwareVersion: "1.0.0" }, { "x-api-key": apiKey });
  const update = await check.json();
  expect(update.latestVersion).toBe("1.10.0");
  const binary = await fetch(`${base}${update.downloadUrl}`);
  expect(binary.status).toBe(200);
  expect(new Uint8Array(await binary.arrayBuffer())).toEqual(new Uint8Array([0, 1, 127, 255]));
  for (const version of ["1.10.0", "2.0.0"]) {
    const response = await post("/api/devices/check-update", { currentFirmwareVersion: version }, { "x-api-key": apiKey });
    expect((await response.json()).updateAvailable).toBe(false);
  }
  const list = await fetch(`${base}/api/firmware`, { headers: { Authorization: `Bearer ${token}` } });
  const { firmwares } = await list.json();
  expect(firmwares).toHaveLength(2);
  expect(firmwares[0].buffer).toBeUndefined();
  expect((await fetch(`${base}/api/firmware/missing/download`)).status).toBe(404);
});

test("oversized uploads and malformed requests are rejected", async () => {
  expect((await upload("3.0.0", new Uint8Array(1024 * 1024 + 1))).status).toBe(413);
  const response = await fetch(`${base}/api/auth/login`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: "{bad",
  });
  expect(response.status).toBe(400);
});

test("the original simulator completes an update against the backend", async () => {
  const simulator = Bun.spawn([process.execPath, "../simulator/device.js"], {
    cwd: backendDirectory,
    env: { ...process.env, API_URL: base }, stdout: "pipe", stderr: "inherit",
  });
  const output = await new Response(simulator.stdout).text();
  expect(await simulator.exited).toBe(0);
  expect(output).toContain("OTA loop complete");
});

test("restart clears temporary data and recreates the configured lab account", async () => {
  await stopServer();
  await startServer();
  expect((await fetch(`${base}/api/devices`, { headers: { Authorization: `Bearer ${token}` } })).status).toBe(401);
  const login = await post("/api/auth/login", { username: "test-admin", password });
  expect(login.status).toBe(200);
  const freshToken = (await login.json()).token;
  for (const path of ["devices", "firmware"]) {
    const response = await fetch(`${base}/api/${path}`, { headers: { Authorization: `Bearer ${freshToken}` } });
    expect((await response.json()).count).toBe(0);
  }
});
