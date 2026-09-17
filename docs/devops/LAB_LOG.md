# EC5207 DevOps Engineering — Lab Work Logbook

## Group Information
- **Project:** Nexus — IoT Device & Firmware Management Platform (DevOps Edition)
- **Repository:** https://github.com/st4rk-7/Nexus (Branch: `devops`)
- **Group Members:**
  - **Member 1 (Lead / st4rk):** [Name / Registration No]
  - **Member 2 (Partner):** [Name / Registration No]

---

## Logbook Index

| Day | Date | Focus Area / Topic | Primary Tasks | Status |
|:---:|:---:|:---|:---|:---:|
| **Day 1** | [Date Today] | Project Setup & Baseline Verification | Environment setup, worktree check, Day 1 baseline test | In Progress |
| **Day 2** | TBD | Docker Containerization | Backend & Frontend Dockerfiles, Docker Compose | Planned |
| **Day 3** | TBD | Kubernetes Local Orchestration | Manifests, Pods, Services, Health Probes | Planned |
| **Day 4** | TBD | Infrastructure as Code (Terraform) | AWS VPC, Security Groups, EC2 provisioning | Planned |
| **Day 5** | TBD | Configuration Management (Ansible) | Host configuration, K3s installation | Planned |
| **Day 6** | TBD | CI/CD Pipeline (Jenkins) | Jenkinsfile, automated test, build, deploy | Planned |
| **Day 7** | TBD | Monitoring (Prometheus & Grafana) | Metrics endpoint, Prometheus scrape, Dashboards | Planned |
| **Day 8** | TBD | Final Integration & Viva Rehearsal | Full OTA demonstration, teardown verification | Planned |

---

## Daily Logs

### Day 1: Project Setup, Branching & Baseline Verification

- **Objective:** Set up the DevOps environment on lab machines, verify the existing Nexus application runs cleanly on the isolated `devops` branch/worktree, and establish individual task responsibilities for the 2-member team.
- **Lecturer / Lab Directive:** [Fill in: Did lecturer introduce a lecture topic, assign specific tasks, or ask you to work on your project?]

#### Work Distribution for Day 1
- **Member 1:**
  - Git repository setup: Verify `devops` branch, local ports (API: 3001, Frontend: 5174), and database separation (`nexus_devops`).
  - Run backend API, test `/health` endpoint, verify MongoDB Atlas connection.
- **Member 2:**
  - Run frontend dashboard, verify proxy connection to backend on port 3001.
  - Run IoT simulator (`bun simulator/device.js`) to confirm baseline device registration and update check loop.
  - Record environment details (OS version, Docker version, Bun/Node version) in this logbook.

#### Execution Record & Commands Run
```bash
# 1. Clone or pull the devops branch
git clone -b devops https://github.com/st4rk-7/Nexus.git Nexus-DevOps
cd Nexus-DevOps

# 2. Check installed tools on the lab PC
git --version
docker --version
bun --version || node --version

# 3. Start Backend (Terminal 1)
cd backend
bun install --frozen-lockfile
bun run dev

# 4. Start Frontend (Terminal 2)
cd ../frontend
bun install --frozen-lockfile
bun run dev

# 5. Run the IoT Simulator (Terminal 3)
cd ..
bun simulator/device.js
```

#### Verification & Outcome Checklist
- [ ] Backend starts on `http://localhost:3001` and connects to MongoDB Atlas.
- [ ] `curl http://localhost:3001/health` returns `{"status":"ok","service":"nexus-backend"}`.
- [ ] Frontend opens on `http://localhost:5174` without port conflicts with Web Dev module.
- [ ] IoT simulator registers a virtual device and queries for updates.
- [ ] Daily log updated and pushed to GitHub.

#### Notes & Lecturer Feedback:
- [Add any specific notes or instructions given by the lecturer today]

---

### Day 2: [Next Lab Date] — Containerization (Template)

- **Objective:**
- **Lecturer Directive:**
- **Work Distribution:**
  - **Member 1:**
  - **Member 2:**
- **Commands Executed:**
- **Verification Result:**
