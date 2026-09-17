# Nexus — DevOps version (EC5207)

This is the DevOps edition of the existing Nexus application. Begin here for
this module. The inherited README and docs/TESTING.md describe the original
web-development setup; use the ports and setup below for this edition.

## Open the version you need

| Module | Folder | Git branch | Dashboard | API | Database |
|---|---|---|---|---|---|
| EC4307 Web Application Development | `/home/st4rk/Projects/Academic/Nexus` | `main` | http://localhost:5173 | http://localhost:3000 | Existing database |
| EC5207 DevOps Engineering | `/home/st4rk/Projects/Academic/Nexus-DevOps` | `devops` | http://localhost:5174 | http://localhost:3001 | `nexus_devops` |

Open the chosen folder in your editor. No branch switching is needed. These
are Git worktrees: separate files and branches that share the repository's
history. Commit changes from the appropriate folder. Do not merge DevOps
changes into main unless you intend to bring them into the web module.
Keep the original folder: the DevOps worktree depends on its Git metadata.

## Run locally

Bun is required. A local backend/.env has been prepared from the existing
Atlas connection, using the database name `nexus_devops`, a fresh JWT secret,
and port 3001. Secrets remain ignored by Git. No existing records were copied.
The Atlas account must have access to the new database; that permission has
not been tested. To set up another checkout, copy backend/.env.example to
backend/.env and enter the Atlas connection and a new JWT secret yourself.

In one terminal:

```bash
cd /home/st4rk/Projects/Academic/Nexus-DevOps/backend
bun install --frozen-lockfile
bun run dev
```

In another terminal:

```bash
cd /home/st4rk/Projects/Academic/Nexus-DevOps/frontend
bun install --frozen-lockfile
bun run dev
```

Open http://localhost:5174. The dashboard forwards API requests to port 3001.
Both module versions can run together. The DevOps Vite server fails if 5174
is occupied instead of silently selecting another port.

For the new DevOps database, create the first admin separately:

1. Set ALLOW_ADMIN_REGISTRATION=true in backend/.env and start/restart the API.
2. Register it with your chosen password:

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"username":"admin","password":"choose-a-strong-password"}'
```

3. Set ALLOW_ADMIN_REGISTRATION=false and restart the API.
4. Log in and upload firmware newer than 1.0.0 for temperature-sensor.
5. Run the simulator from this version's root folder:

```bash
cd /home/st4rk/Projects/Academic/Nexus-DevOps
bun simulator/device.js
```

The simulator defaults to port 3001 here. API_URL can override its target for
future deployments. A new database has no firmware; upload a matching release
to demonstrate downloading rather than just the no-update path.

## What has been prepared

The application is inherited from the web version, with separate local
configuration and a module-specific plan. Docker, Terraform, Ansible, Jenkins,
Kubernetes, Prometheus and Grafana are planned; their implementation and
cloud deployment have not been completed.

- [Project brief](intro.md)
- [DevOps progress and outcome mapping](docs/PROGRESS.md)
- [Module information sheet](docs/devops/EC5207_MIS_C23.pdf)
- [Original web progress](docs/web-development/PROGRESS.md)

The existing Render/Vercel files remain as baseline reference. The EC5207
AWS/Kubernetes deployment will be developed in this branch.
