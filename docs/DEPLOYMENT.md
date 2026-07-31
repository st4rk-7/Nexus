# Nexus Deployment Guide

This guide deploys the Nexus backend to Render and the React frontend to
Vercel. MongoDB Atlas remains the database.

## What happens in production

```text
Browser → Vercel (React) → Render (Express API) → MongoDB Atlas
IoT device ─────────────────→ Render (Express API) → MongoDB Atlas/GridFS
```

Firmware binaries are stored in MongoDB GridFS, not on Render's local disk.
This matters because a free Render service loses local files whenever it
restarts, redeploys, or sleeps.

## Before deploying

1. Rotate the Atlas database-user password if its connection string has ever
   been pasted into a chat or shared elsewhere.
2. Update local `backend/.env` with the new connection string.
3. Confirm `git status` does not show `backend/.env`.
4. Create a GitHub repository and push this project. Render and Vercel both
   need a Git repository to import.

This repository currently has no Git remote. After creating an empty GitHub
repository, connect it:

```bash
git remote add origin https://github.com/YOUR_NAME/nexus.git
git push -u origin main
```

Never commit `.env`, database passwords, or JWT secrets.

## Step 1 — Deploy the backend to Render

1. Sign in to Render.
2. Choose **New → Blueprint**.
3. Connect the GitHub repository containing Nexus.
4. Render reads the root [`render.yaml`](../render.yaml).
5. Enter the required secret values:

| Variable | Value |
|---|---|
| `MONGODB_URI` | The Atlas connection string ending in `/nexus?...` |
| `CLIENT_ORIGIN` | Use `https://example.invalid` temporarily |

`JWT_SECRET` is generated automatically by the Blueprint.

6. Create the Blueprint and wait for the deploy to finish.
7. Copy the backend URL, for example:

```text
https://nexus-api.onrender.com
```

8. Test it:

```bash
curl https://YOUR-RENDER-URL/health
```

Expected response:

```json
{"status":"ok","service":"nexus-backend"}
```

Render's free service may take about a minute to wake after 15 minutes without
traffic. That is normal for the free plan.

## Step 2 — Deploy the frontend to Vercel

1. Sign in to Vercel.
2. Choose **Add New → Project** and import the same GitHub repository.
3. Set **Root Directory** to `frontend`.
4. Vercel detects Vite and reads `frontend/vercel.json`.
5. Add this environment variable for Production:

| Variable | Value |
|---|---|
| `VITE_API_URL` | Your Render URL, with no trailing slash |

Example:

```text
VITE_API_URL=https://nexus-api.onrender.com
```

6. Deploy and copy the Vercel URL.

## Step 3 — Allow the real frontend address

Return to the Render service:

1. Open **Environment**.
2. Change `CLIENT_ORIGIN` from the temporary value to the exact Vercel URL.
3. Do not add a trailing slash.
4. Save and redeploy.

Example:

```text
CLIENT_ORIGIN=https://nexus-dashboard.vercel.app
```

This CORS rule allows the real dashboard and rejects browser requests from
unknown websites. Curl and IoT-device requests do not send a browser Origin
header, so they still work.

## Step 4 — Verify the deployed system

1. Open the Vercel URL.
2. Log in with the existing admin account stored in Atlas.
3. Confirm the device list appears.
4. Upload a new firmware version such as `5.0.0`.
5. Run the simulator against Render:

```bash
API_URL=https://YOUR-RENDER-URL bun simulator/device.js
```

The demo is successful when the simulator registers, receives an API key,
finds the new version, and downloads the firmware.

## If the database is empty

The project already has an admin in its current Atlas database. For a new
database:

1. Temporarily set `ALLOW_ADMIN_REGISTRATION=true` on Render.
2. Call `POST /api/auth/register` once.
3. Set the variable back to `false` immediately.

The endpoint also refuses registration once an admin already exists.

## Common problems

### Render returns a loading page

The free backend is waking up. Wait about a minute and retry.

### The dashboard says it cannot reach the server

Check:

- `VITE_API_URL` matches the Render HTTPS URL.
- `CLIENT_ORIGIN` matches the Vercel HTTPS URL exactly.
- Both values have no trailing slash.
- Render's `/health` endpoint responds.

Changing a Vercel environment variable requires a new frontend deployment.

### Atlas connection fails

Check the database username/password and Atlas Network Access. Render uses
changing outbound IP addresses on the free plan, so the learning-project setup
normally allows `0.0.0.0/0` and relies on the strong database credentials.

### An old firmware returns HTTP 410

Firmware uploaded before the GridFS upgrade used local disk storage. Upload a
new semantic version (`major.minor.patch`) through the dashboard. New uploads
are stored permanently in Atlas GridFS.

## Official platform references

- [Render: supported languages and Bun](https://render.com/docs/language-support)
- [Render: free-service limits](https://render.com/docs/free)
- [Vercel: Vite deployments](https://vercel.com/docs/frameworks/frontend/vite)
- [Vercel: monorepo root directories](https://vercel.com/docs/monorepos)
- [MongoDB: GridFS with the Node driver](https://www.mongodb.com/docs/drivers/node/current/crud/gridfs/)
