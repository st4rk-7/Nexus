# Architecture Brief: Nexus DevOps Platform

## 1. Project Context & Need
- **Problem / Opportunity Statement:** In IoT fleet management, manual deployments and unmonitored infrastructure lead to downtime, failed over-the-air (OTA) updates, and security vulnerabilities. Nexus requires a reliable, automated delivery lifecycle and observable deployment platform on modern cloud infrastructure.
- **Core Objective:** Build a fully automated, containerized, orchestrated, and observed deployment pipeline for the Nexus IoT Device and Firmware Management Platform conforming to EC5207 DevOps criteria (LO-1 through LO-5).
- **Project Form:** Engineered System / Academic Capstone & Infrastructure Delivery.
- **Primary Stakeholders & Users:**
  - Academic Evaluators (Department of Electrical and Information Engineering, University of Ruhuna).
  - System Administrators (managing firmware rollouts and platform health).
  - IoT Edge Devices (performing authenticated OTA checks and firmware downloads).
- **High-Level Success Criteria:**
  - 100% reproducible local and cloud deployment via single-command or scripted automation.
  - Zero-downtime rolling updates verified on Kubernetes.
  - Automated CI/CD pipeline validating code, building images, deploying, and testing via an IoT simulator.
  - Full observability stack capturing platform metrics, HTTP performance, and OTA update traffic in real-time.

---

## 2. Boundaries & Constraints
- **In-Scope:**
  - Multi-stage Docker containerization of Backend (Bun) and Frontend (Vite/React/Nginx).
  - Declarative Kubernetes workload orchestration (Deployments, Services, Ingress, Probes, ConfigMaps, Secrets).
  - Infrastructure as Code (Terraform) provisioning AWS networking and compute.
  - Configuration Management (Ansible) configuring Linux host, Docker, and K3s.
  - CI/CD Automation (Jenkins Pipeline in Groovy) with automated testing, packaging, and deployment.
  - Observability (Prometheus metric scraping + Grafana dashboards).
  - Simulated IoT device test suite for end-to-end OTA verification.
- **Out-of-Scope (Exclusions):**
  - Physical hardware testing (strictly simulated devices via HTTP REST).
  - Multi-region high-availability cloud setups (unnecessary cloud expense).
  - Complex device telemetry ingestion (MQTT/CoAP) — strictly HTTP REST OTA scope.
- **Hard Constraints:**
  - Student/academic cloud budget (< $10 total AWS expenditure).
  - Strict preservation of the existing EC4307 web codebase in its independent branch/worktree.
  - Cloud storage safety: Firmware binaries must remain in MongoDB Atlas GridFS.
- **Operating Context:**
  - Development: Linux x86_64 workstation running Docker, K3d/Minikube, and Bun.
  - Cloud Staging/Demo: AWS EC2 (Ubuntu 24.04 LTS) running K3s, accessible over public IPv4.

---

## 3. Requirements & Quality Attributes

| ID | Requirement Statement | Type | Criticality | Verification Method |
|:---|:---|:---|:---|:---|
| REQ-01 | Containerize backend into lean, unprivileged Docker image (< 150MB) | Functional / Quality | High | Inspection & `docker build` |
| REQ-02 | Containerize frontend into multi-stage Nginx image (< 50MB) | Functional / Quality | High | Inspection & `docker build` |
| REQ-03 | Provide local single-command orchestration via Docker Compose | Operational | High | Demonstration (`docker compose up`) |
| REQ-04 | Provide Kubernetes manifests with Liveness/Readiness probes and resource limits | Functional | High | `kubectl apply` & pod inspection |
| REQ-05 | Implement zero-downtime rolling update mechanism on Kubernetes | Performance | High | Demonstration during simulator run |
| REQ-06 | Provision AWS VPC, Subnets, Security Groups, and EC2 instance via Terraform | Functional | High | `terraform plan` & `terraform apply` |
| REQ-07 | Terraform state must be remotely locked and encrypted without committing secrets | Security | High | Code review & S3 state audit |
| REQ-08 | Configure target host, K3s, and dependencies idempotently using Ansible | Operational | High | `ansible-playbook --check` |
| REQ-09 | Execute declarative Jenkins pipeline written in Groovy | Functional | High | Jenkins build log & execution trace |
| REQ-10 | Expose application metrics (`/metrics`) via Prometheus format in backend | Functional | Medium | HTTP GET `/metrics` check |
| REQ-11 | Scrape and visualize Golden Signals and OTA events on Grafana dashboard | Observability | High | Visual inspection of Grafana dashboard |
| REQ-12 | Verify end-to-end OTA loop (register $\rightarrow$ check $\rightarrow$ download) post-deployment | Functional | High | Automated execution of `simulator/device.js` |

---

## 4. Alternatives & Trade-Off Analysis

| Candidate Approach | Key Advantages | Key Drawbacks / Risks | Decision / Rationale |
|:---|:---|:---|:---|
| **Option A: Ephemeral EC2 + K3s via Terraform & Ansible (Selected)** | Extremely cost-effective (< $0.05/hr), demonstrates complete Linux & OS automation (LO-3), 100% compatible with standard K8s API. | Requires managing OS and single-node cluster lifecycle manually via Ansible. | **Selected**: Perfect match for academic evaluation and budget while demonstrating full IaC + config management. |
| **Option B: AWS EKS (Managed Kubernetes)** | Fully managed control plane, native AWS integrations. | Fixed $0.10/hr fee ($72/mo), complex IAM roles, high barrier for short demos. | **Rejected**: Waste of budget; obscures OS automation required by LO-3. |
| **Option C: Pure Local Kubernetes (Minikube/K3d only)** | Zero cloud cost, fastest feedback cycle. | Does not demonstrate AWS infrastructure provisioning (Terraform) required by syllabus LO-2 & LO-4. | **Hybrid**: Used for daily local dev/testing; Option A used for cloud demonstration. |

---

## 5. System Architecture / Structural Decomposition

### A. Context & Topology Diagram

```mermaid
graph TD
    subgraph Local Dev & CI
        Dev[Developer / Workstation]
        Git[Git Repository: devops branch]
        Jenkins[Jenkins Controller: Pipeline-as-Code]
    end

    subgraph AWS Cloud Infrastructure [Terraform Provisioned]
        VPC[AWS VPC: 10.0.0.0/16]
        SG[Security Group: 80, 443, 6443, 3000-3001]
        EC2[Ubuntu EC2 Instance: Ansible Managed]

        subgraph K3s Cluster
            Ingress[Traefik Ingress Controller]
            BackendPods[Nexus Backend Pods: Replicas 2]
            FrontendPods[Nexus Frontend Pods: Replicas 2]
            Prometheus[Prometheus Server]
            Grafana[Grafana Dashboards]
        end
    end

    subgraph External Managed Services
        Atlas[(MongoDB Atlas + GridFS)]
        GHCR[Container Registry: GHCR / DockerHub]
    end

    Dev -->|git push| Git
    Git -->|webhook / trigger| Jenkins
    Jenkins -->|build & push| GHCR
    Jenkins -->|kubectl deploy| K3s Cluster
    Ingress --> FrontendPods
    Ingress --> BackendPods
    BackendPods --> Atlas
    Prometheus -->|scrape /metrics| BackendPods
    Prometheus -->|scrape node/cAdvisor| EC2
    Grafana -->|query| Prometheus
```

### B. Structural Subsystems
1. **Infrastructure Subsystem (`terraform/`):**
   - VPC, Public Subnet, Internet Gateway, Route Tables.
   - EC2 instance resource, Key Pair, and Security Groups restricting ingress.
   - Remote S3 backend for safe state storage.
2. **Configuration Subsystem (`ansible/`):**
   - Roles: `base` (packages, firewalls), `k3s` (cluster initialization, kubeconfig fetch), `monitoring-prereqs`.
3. **Application Packaging (`docker/`):**
   - Multi-stage Dockerfile for Bun API (production dependencies only).
   - Multi-stage Dockerfile for React UI (static build served by Nginx).
   - `docker-compose.yml` for instant full-stack local execution.
4. **Orchestration Subsystem (`kubernetes/`):**
   - Deployments with health probes (`/health` readiness/liveness), HPA capability.
   - ClusterIP Services + Ingress routing (`/api` to backend, `/` to frontend).
   - Sealed/Environment Secrets for Atlas URI and JWT secret.
5. **CI/CD Subsystem (`jenkins/`):**
   - `Jenkinsfile` (Declarative Groovy) driving the delivery pipeline.
6. **Observability Subsystem (`monitoring/`):**
   - Express metrics middleware (`prom-client`).
   - Prometheus ConfigMap and Deployment.
   - Provisioned Grafana dashboard definitions.

---

## 6. Verification & Validation (V&V) Strategy

- **Verification (Building the system right):**
  - Lint and compile checks in backend and frontend.
  - Container vulnerability and configuration linting (`hadolint` / `dockerfile` checks).
  - `terraform validate` and `terraform plan` syntax and resource verification.
  - `ansible-playbook --syntax-check` and `--check` mode execution.
  - Kubernetes dry-run validation: `kubectl apply --dry-run=client`.
- **Validation (Building the right system):**
  - **The Simulated OTA Verification**: Run `simulator/device.js` against the Kubernetes Ingress. Validate registration, API key issuance, firmware update check, and successful download of binary from GridFS.
  - **Rolling Update Test**: Trigger a rolling deployment while simulator runs continuous requests; observe zero dropped requests and seamless pod rollover.
  - **Monitoring Verification**: Observe real-time Grafana graphs reflecting HTTP request spikes and firmware download bytes generated by the simulator.

---

## 7. Uncertainty, Assumptions & Risk Exposure

- **Explicit Facts:**
  - The web application is 100% functional on commit `930f836` and `aec7176`.
  - MongoDB Atlas and GridFS are already connected and verified.
- **Explicit Assumptions:**
  - AWS free tier or minimal credit balance is accessible for on-demand demonstration.
  - The evaluator values seeing both local and cloud-based DevOps execution.
- **Key Risks & Mitigations:**
  - *Risk 1: Accidental AWS Overbilling.* Mitigation: Implement strict `terraform destroy` workflow and budget alert threshold; use single EC2 instance for demo.
  - *Risk 2: CI/CD Pipeline Agent Resource Exhaustion.* Mitigation: Use lightweight Alpine base containers; cache npm/bun packages.
  - *Risk 3: Disruption to Web Module (EC4307).* Mitigation: Maintain strict branch isolation (`main` vs `devops`) and dedicated local ports/database names.

