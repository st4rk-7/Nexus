# Project Plan: Nexus DevOps Implementation

## 1. Project Basis & Governance
- **Project Name:** Nexus DevOps Engineering Platform (EC5207)
- **Objective & Expected Outcome:** Deliver a production-grade, automated DevOps pipeline (Terraform, Ansible, Docker, Kubernetes, Jenkins, Prometheus/Grafana) for the Nexus IoT OTA platform, ready for continuous assessment and final evaluation.
- **Architecture Reference:** docs/devops/02-ARCHITECTURE-BRIEF.md
- **Delivery Strategy:** Incremental-Adaptive / Deliverable-Driven. Each component (Docker -> K8s -> IaC -> Ansible -> CI/CD -> Monitoring) is delivered with an independent verification test before moving to the next.
- **Project Governance & Roles:**
  - Student Engineer / Technical Lead: st4rk
  - Academic Evaluators: EC5207 Course Staff (University of Ruhuna)

---

## 2. Deliverable-Based Work Breakdown Structure (WBS)

- **1.0 Containerization & Local Orchestration**
  - 1.1 Backend Production Multi-stage Dockerfile
  - 1.2 Frontend Production Multi-stage Nginx Dockerfile
  - 1.3 Local Multi-service Docker Compose Environment (docker-compose.yml)
  - 1.4 Container Image Optimization & Healthcheck Verification
- **2.0 Kubernetes Orchestration Deliverables**
  - 2.1 Nexus Namespace, ConfigMaps, and Secret Templates
  - 2.2 Backend Deployment & Service Manifests (with Probes & Resource Limits)
  - 2.3 Frontend Deployment & Service Manifests
  - 2.4 Ingress Routing Manifests (Single domain/entrypoint)
  - 2.5 Local Cluster Verification (K3d/Minikube smoke test)
- **3.0 Infrastructure as Code (Terraform & AWS)**
  - 3.1 Network Module (VPC, Subnet, Route Table, Internet Gateway)
  - 3.2 Security Module (Security Groups for SSH, HTTP, HTTPS, Kube API)
  - 3.3 Compute Module (EC2 Instance, Key Pair, Elastic IP)
  - 3.4 State Management & Automation Scripts (plan, apply, destroy)
- **4.0 Configuration Management (Ansible)**
  - 4.1 Inventory Configuration & SSH Connectivity
  - 4.2 Base OS Hardening & Package Management Role
  - 4.3 Container Runtime & K3s Installation Role
  - 4.4 Cluster Kubeconfig Export & Ingress Setup Role
- **5.0 CI/CD Automation (Jenkins & Groovy)**
  - 5.1 Jenkinsfile Pipeline-as-Code (Declarative Groovy)
  - 5.2 Build & Test Stages (Lint, Syntax, Unit tests)
  - 5.3 Container Build & Registry Push Stage
  - 5.4 Automated Deployment & Healthcheck Stage
  - 5.5 Post-Deploy Simulated IoT Device Verification Stage
- **6.0 Observability & Monitoring (Prometheus & Grafana)**
  - 6.1 Backend Prometheus Instrumentation (/metrics endpoint via prom-client)
  - 6.2 Prometheus Server Deployment & Scrape Configuration
  - 6.3 Grafana Dashboard Provisioning (Golden Signals + IoT OTA telemetry)
  - 6.4 Metric Validation During Simulated OTA Load
- **7.0 Project Documentation & Demonstration Evidence**
  - 7.1 Comprehensive Project Design Document (for 30% Continuous Assessment)
  - 7.2 Progress Evaluation Checkpoint Recordings / Demos (for 20% CA)
  - 7.3 Final Demonstration Protocol & Teardown Playbook (for 50% End-Semester)

---

## 3. Work Package Dictionary & Dependencies

| Work Package ID | Deliverable | Pre-requisites / Inputs | Estimated Effort | Acceptance Criteria |
|:---|:---|:---|:---|:---|
| **WP-101** | Dockerfiles (Backend & Frontend) | Existing code | 2 hours | Lean images build with zero warnings; non-root user; size < 150MB. |
| **WP-102** | Docker Compose Stack | WP-101 | 1.5 hours | docker compose up boots API, UI, connects to Atlas, and passes simulator run. |
| **WP-201** | K8s Workload Manifests | WP-101 | 2.5 hours | Deployments, Services, ConfigMaps, Secrets apply cleanly; pods reach Ready state. |
| **WP-202** | Ingress & Rolling Update Verification | WP-201 | 2 hours | Zero HTTP drops during rolling update while simulator repeatedly polls API. |
| **WP-301** | Terraform AWS Modules | AWS Credentials | 3 hours | terraform apply provisions clean VPC + EC2; terraform destroy cleans up 100%. |
| **WP-401** | Ansible Playbooks & Roles | WP-301 | 2.5 hours | Playbook configures bare Ubuntu into ready K3s node with idempotent second run. |
| **WP-501** | Jenkinsfile Pipeline in Groovy | WP-101, WP-201 | 3.5 hours | Automated pipeline builds on commit, tests, publishes image, deploys, and verifies. |
| **WP-601** | App Metrics & Prometheus Scraper | WP-101 | 2 hours | /metrics returns standard Prometheus exposition format; Prometheus scrapes target. |
| **WP-602** | Grafana Dashboards as Code | WP-601 | 2 hours | Dashboards show live latency, error rates, and OTA downloads without manual UI setup. |
| **WP-701** | EC5207 Design Document | All WP specs | 4 hours | Formal report covering architecture, networking, security, IaC, CI/CD, and monitoring. |

---

## 4. Schedule, Milestones & Stage Gates

- **Gate 1: Local Stack Baseline:** Containers and Kubernetes run locally, pass the IoT simulator test, and have zero regressions on core web app functionality.
- **Gate 2: Automated Infrastructure:** Terraform provisions AWS resources cleanly; Ansible bootstraps K3s; terraform destroy completes cleanly without orphaned resources.
- **Gate 3: Continuous Delivery & Observability:** Jenkins triggers build on commit, runs checks, deploys to K3s, and Grafana graphs OTA update traffic in real-time.
- **Gate 4: Final Evaluation Sign-off:** Design document complete, demo video/screenshots archived, repository documentation aligned with module learning outcomes.

### Phasing Summary:
1. Phase 1 (Days 1-4): Containerization (WP-101, WP-102) & Local Kubernetes (WP-201, WP-202) -> Gate 1
2. Phase 2 (Days 5-8): AWS IaC via Terraform (WP-301) & Ansible K3s Provisioning (WP-401) -> Gate 2
3. Phase 3 (Days 9-13): CI/CD Automation with Jenkins (WP-501) & Observability Stack (WP-601, WP-602) -> Gate 3
4. Phase 4 (Days 14-16): Verification, Design Document (WP-701) & Final Demo Rehearsal -> Gate 4

---

## 5. Resource & Budget Plan

- **Compute & Tools:**
  - Local workstation: Docker Engine, kubectl, k3d/minikube, terraform, ansible, bun.
  - Cloud: AWS EC2 (Single t3.medium or t3a.medium in us-east-1 or ap-south-1).
- **Budget Control:**
  - Estimated hourly cost of t3.medium: ~$0.0416/hr.
  - 20 hours total cloud execution across development and demo sessions: **<$1.00 - $2.00 total AWS spend**.
  - All cloud runs must be scheduled with immediate terraform destroy upon completion.

---

## 6. Quality, Verification & Definition of Done (DoD)

### Definition of Done for Any Work Package
1. **Code & Manifest Integrity:** Manifests/playbooks validated (validate / --check / dry-run).
2. **Security Check:** Zero hardcoded credentials or secret leaks; ignored in .gitignore.
3. **Reproducibility:** Tested from clean state using a single documented command.
4. **Integration Test:** Passes simulated IoT device check (simulator/device.js).
5. **Documentation:** Usage steps logged in docs/PROGRESS.md and relevant README.

---

## 7. Risk Register & Uncertainty Retirement

| Risk Description | Probability | Impact | Early Trigger | Mitigation / Contingency |
|:---|:---|:---|:---|:---|
| AWS Bill Exceeds Expectations | Low | High | Running instance left overnight | Automated teardown script + CloudWatch $5 budget alert |
| Jenkins Server Resource Starvation | Medium | Medium | Java OOM on small instance | Run Jenkins with JVM heap limits or use Docker agent runner |
| MongoDB Atlas IP Whitelist Lockout | Medium | Medium | Cloud node IP changes on reboot | Use 0.0.0.0/0 with strong DB user credentials for demo cluster, or update Atlas IP Access via API |
| Conflict with Web Dev (EC4307) | Low | High | Accidental merge to main | Worktree separation; separate ports (3001 vs 3000) and databases (nexus_devops vs nexus) |

---

## 8. Tracking, Change Control & Project Closure

- **Tracking Cadence:** Update docs/PROGRESS.md at the end of each work package completion with command evidence.
- **Change Control:** Any change impacting the core API contracts or UI requires running bun simulator/device.js to confirm backwards compatibility before committing.
- **Project Closeout:**
  - Fully formatted Design Document PDF.
  - Exported Grafana dashboards and Prometheus metrics snapshots.
  - Video or recorded terminal cast of complete Jenkins pipeline execution and OTA update loop.
