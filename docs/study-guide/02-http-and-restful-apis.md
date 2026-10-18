# 02 — HTTP and REST

[Guide index](README.md) · Next: [Backend and database](03-backend-and-database.md)

## Requests and responses

HTTP is the protocol clients use to request resources and send data. A request has a method, path, headers and sometimes a body. The response has a status code, headers and a body. HTTPS adds transport encryption through TLS. HTTP itself does not remember a logged-in user between requests; applications add authentication or session mechanisms. [Reference: MDN HTTP overview](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Overview).

For example, a registered device sends:

```http
POST /api/devices/check-update HTTP/1.1
Content-Type: application/json
x-api-key: <device-key>

{"currentFirmwareVersion":"1.0.0"}
```

With a newer release available, the response body includes:

```json
{
  "updateAvailable": true,
  "latestVersion": "1.2.0",
  "firmwareId": "<release-id>",
  "downloadUrl": "/api/firmware/<release-id>/download",
  "releaseNotes": "Example release"
}
```

JSON is a text format for exchanging structured data. `JSON.stringify()` converts an object into JSON; `response.json()` parses a JSON response. Firmware transfer uses binary data instead. Uploads use `multipart/form-data` to carry both a file and text fields.

## REST principles

REST is an architectural style, not a library or a synonym for JSON.

| Principle | Meaning and Nexus connection |
|---|---|
| Client–server separation | Clients render or consume results; the API handles data and rules |
| Stateless requests | Each protected request carries its own token or key |
| Uniform interface | Predictable resource URLs, HTTP methods and representations |
| Cacheability | Responses should make caching behavior clear; private data needs care |
| Layered system | The browser reaches Express through Vite's local proxy |
| Optional code on demand | A server may supply executable client code; not required for an API |

Nexus uses resource routes such as `/api/firmware` and action routes such as `/check-update`. It is a practical REST-style API, not a demonstration of every REST constraint. `check-update` also records the device's last-seen time. A separate `report-update` call saves the newly installed version and an UpdateLog record.

GET reads a resource. POST creates or processes data. PUT replaces and DELETE removes a resource: Nexus uses `PUT /api/devices/:id` to edit a device and `DELETE /api/devices/:id` to remove one. PATCH (partial update) is not used. Idempotence means repeating a request has the same intended effect as doing it once. Repeated device registration is not a safe retry strategy: duplicate names are rejected.

## Endpoint reference

Paths are relative to the backend origin.

| Method and path | Access | Input / successful result |
|---|---|---|
| `GET /health` | Public | `200`: process response |
| `POST /api/auth/register` | Public | `username`, `password`; `201` with token; currently permits additional administrators |
| `POST /api/auth/login` | Public | `username`, `password`; `200` with username and token |
| `GET /api/devices` | Public | Optional `search`, `status`, `sort` query; `200`: `{count, devices}` |
| `POST /api/devices/register` | Public | `name`, `type`, optional `currentFirmwareVersion`; `201` with device and API key |
| `GET /api/devices/:id` | Public | `200`: `{device, updates}` (update history, newest first) |
| `PUT /api/devices/:id` | Admin JWT | `name`, `type`, `currentFirmwareVersion`, `status`; `200` with the updated device |
| `DELETE /api/devices/:id` | Admin JWT | `200`; also deletes the device's update history |
| `POST /api/devices/check-update` | Device API key | Optional current version; `200` with update decision; records last-seen |
| `POST /api/devices/report-update` | Device API key | `firmwareId`; `201`; saves the new version and an UpdateLog |
| `POST /api/firmware` | Admin JWT | Multipart `file`, `version`, optional `releaseNotes`; `201` with firmware metadata |
| `GET /api/firmware` | Public | `200`: `{count, firmwares}` with each uploader's username |
| `GET /api/firmware/:id/download` | Public | `200`: firmware binary when available |

Admin requests use `Authorization: Bearer <token>`. Device check-ins use `x-api-key: <key>`. These credentials are not interchangeable.

## Interpreting errors

- **400:** a field failed validation (for example a name that is too short or a version that is not `x.y.z`), or a malformed id such as `/api/devices/abc`. The message names the problem.
- **401:** missing, invalid or expired credentials.
- **404:** the device or release does not exist, or a release's file is missing on the server.
- **409:** the device name or firmware version is already taken.
- **500:** an unexpected internal failure.

The same rules run in the browser (HTML `required`, `minLength`, `pattern`) and on the server (Mongoose schema). The browser checks are for convenience; the server checks are the real protection, because any client can skip the browser. Upload size is still not limited.

**Self-check:** Does a `200` from `/health` prove that a firmware file can be downloaded? No: it only confirms the server responded to that request.
