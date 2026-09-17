# Nexus — EC5207 DevOps progress

## Current state

The existing web application is the baseline, from commit `930f836`.
Its original progress is preserved in `docs/web-development/PROGRESS.md`.
The original EC4307 worktree remains unchanged on `main`.

- [x] Separate DevOps worktree on branch `devops`.
- [x] Separate local defaults: frontend 5174, API 3001, database `nexus_devops`.
- [x] Module brief, source PDF, setup guide, and criteria mapping.
- [x] Dependencies installed with frozen lockfiles; frontend production build passes.
- [x] Frontend port/proxy settings verified; backend and simulator compilation passes.
- [ ] Verify Atlas permissions and run the full app against the DevOps database.
- [ ] Implement and validate the DevOps tools below.

## Module outcomes and proposed evidence

The PDF provides learning outcomes and a syllabus, not a detailed project rubric.
The evidence below is our proposed mapping; refine it if a project rubric arrives.

| Outcome | Module focus | Proposed project evidence |
|---|---|---|
| LO1 | DevOps practices and their role | Explain the delivery workflow and responsibilities in the design document |
| LO2 | Networking and cloud fundamentals | AWS/network diagram, service ports, routing and access rules |
| LO3 | Scripting, Linux and virtualization | Reproducible setup scripts, Ansible runs and host configuration |
| LO4 | Git, IaC, infrastructure automation, CI/CD and monitoring | Git history, Terraform plan/apply evidence, Ansible, Jenkins, Prometheus/Grafana |
| LO5 | Containerization and orchestration | Docker builds and Kubernetes deployment/update demonstrations |

## Assessment checkpoints from the module sheet

- Project design document: 30% overall.
- Two project progress evaluations: 20% overall combined.
- Final project evaluation: 50% overall.

No deadlines or required allocation of features between progress evaluations
are given in this sheet. Keep dated demo notes and test/deployment evidence.

## Phase 1 — Design and repeatable baseline

- [ ] Write the design document: architecture, networking, environments, tool
  responsibilities, security, AWS cost assumptions, and cleanup procedure.
- [ ] Verify separate Atlas database access and bootstrap a DevOps admin.
- [ ] Define automated tests for auth rejection, registration, update selection,
  firmware upload/download integrity, and an isolated simulator run.
- [ ] Record the baseline demonstration and how to reproduce it.

## Phase 2 — Docker

- [ ] Containerize the Bun API and production React frontend.
- [ ] Add a local orchestration command, configuration examples and health checks.
- [ ] Prove the full OTA flow with Atlas/GridFS from containers.

## Phase 3 — Terraform and AWS

- [ ] Choose and document an affordable AWS topology and networking design.
- [ ] Write Terraform and review its plan; exclude state and secrets from Git.
- [ ] Provision, verify, and demonstrate teardown with recorded evidence.

## Phase 4 — Ansible

- [ ] Define inventory and configuration roles for the chosen hosts.
- [ ] Demonstrate repeatable configuration and an idempotent second run.

## Phase 5 — Kubernetes

- [ ] Add Deployments, Services, configuration and secret setup instructions.
- [ ] Configure resource requests/limits and readiness/liveness probes.
- [ ] Demonstrate deployment, service access, rolling update and recovery.

## Phase 6 — Jenkins and Groovy CI/CD

- [ ] Add a Jenkins pipeline for checkout, tests, builds and image publication.
- [ ] Deploy an identifiable image version to Kubernetes and run smoke checks.
- [ ] Demonstrate a failing check preventing deployment and a successful release.

## Phase 7 — Prometheus and Grafana

- [ ] Expose and collect useful API and infrastructure metrics.
- [ ] Provision a dashboard for traffic, errors, latency and service availability.
- [ ] Demonstrate monitoring during simulator traffic and a controlled failure.

## Phase 8 — Evaluation evidence

- [ ] Finish the design document and evidence from both progress evaluations.
- [ ] Rehearse the final demo from setup through pipeline, OTA and monitoring.
- [ ] Document limitations, recovery, operating cost and teardown.

## Decisions

- Git worktrees give each module a folder and branch while sharing Git history.
  Application changes in one folder do not automatically appear in the other.
- Keep the core application; add DevOps capabilities incrementally.
- Local API ports and database names differ so both versions can be used together.
- Atlas/GridFS remains the database/storage design; do not add a local MongoDB
  deployment merely to demonstrate Kubernetes.
- Deployment infrastructure is planned, not implemented. No AWS resources have
  been provisioned and no live database writes were needed for this separation.

## Next action

Follow DEVOPS.md to verify database access and the baseline app. Then start
Phase 1's design document and automated test plan before adding infrastructure.
