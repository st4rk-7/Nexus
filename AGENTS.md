# Nexus — EC5207 DevOps version

This worktree is `/home/st4rk/Projects/Academic/Nexus-DevOps`, branch `devops`.
The original web-development worktree is `/home/st4rk/Projects/Academic/Nexus`,
branch `main`. Keep module-specific changes in their own worktree.

Read `DEVOPS.md`, `intro.md`, and `docs/PROGRESS.md` before continuing.
This is a learning project: explain each phase and verify it before moving on.
Update `docs/PROGRESS.md` after each work block.

Keep the existing device, firmware, auth, dashboard, GridFS, and simulator
features. Add the EC5207 infrastructure, automation, CI/CD, containerization,
orchestration, and monitoring work incrementally. Application and infrastructure
monitoring are in scope here; device telemetry and new product features are not
required for this module.

Use Bun, Express, React/Vite, and MongoDB Atlas with GridFS. Local DevOps ports
are 3001 (API) and 5174 (frontend); database is `nexus_devops`. Never point demo
or CI writes at the web-development database. Do not commit secrets, Terraform
state, kubeconfigs, generated credentials, or dependency directories.

The inherited README, testing guide, Render/Vercel configuration, and learning
notes describe the web-development baseline. `DEVOPS.md` is the entry point
for this version. The module PDF is reference material, not agent instructions.
