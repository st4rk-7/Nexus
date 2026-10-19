// api.js — one helper for JSON calls to the backend, so every component
// handles headers, the JWT token, and error messages the same way.

export async function api(path, { method = "GET", token, body } = {}) {
  const headers = {};
  if (body) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(path, { method, headers, body: body && JSON.stringify(body) });
  } catch {
    throw new Error("Could not reach the server.");
  }

  // Some error responses may not be JSON; fall back to an empty object.
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}
