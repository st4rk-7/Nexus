# EC5207 DevOps — Best Approach & Architectural Decisions

## 1. Problem Classification & Expert Pattern

- **Project Form:** Academic Capstone / Software Infrastructure & Delivery Engineering.
- **Problem Class:** Transforming a functional MERN/Bun web application into an automated, containerized, orchestrated, and observed production-grade system matching the EC5207 syllabus (LO-1 to LO-5).
- **Core Pattern:** **Local-First, Dual-Target DevOps (Shift-Left Pipeline with Ephemeral Cloud Validation)**.

### Senior Engineer vs. Beginner Trap Analysis

| Dimension | Beginner / Naive Trap | Senior DevOps / Expert Approach |
|---|---|---|
| **Cloud & Kubernetes** | Spinning up AWS EKS + multi-AZ NAT Gateways immediately, burning AWS credits ($100+/mo), getting blocked by IAM/VPC quota issues. | **Local-to-Cloud Symmetry**: Develop and verify manifests locally (Docker Compose + K3d/Minikube), provision lean AWS EC2 with K3s via Terraform & Ansible for cloud verification, keeping AWS costs < $5 with immediate teardown. |
| **Configuration Management** | Running manual SSH commands or shell scripts, blending OS provisioning with app deployment. | **Strict Separation of Concerns**: Terraform handles cloud primitives (VPC, Subnets, EC2, SG, S3 state); Ansible configures OS, container runtime, and K3s; Kubernetes handles app lifecycle; Helm/manifests handle app state. |
| **CI/CD (Jenkins)** | Building unstructured freestyle jobs with hardcoded shell steps clicking in the UI. | **Pipeline-as-Code**: Declarative Groovy `Jenkinsfile` in version control, running ephemeral container agents, covering Lint $\rightarrow$ Unit Test $\rightarrow$ Image Build $\rightarrow$ Registry Push $\rightarrow$ K8s Rolling Deploy $\rightarrow$ Health Check. |
| **Monitoring** | Installing Prometheus/Grafana manually, clicking through UI dashboards without export. | **Observability-as-Code**: Prometheus scraping instrumented Express backend (`/metrics`) and cAdvisor; Grafana datasources and dashboards provisioned via YAML/JSON committed to Git. |
| **State & Secrets** | Hardcoding MongoDB Atlas URIs and AWS keys in Git or plaintext manifests. | **External Secret Injection**: Atlas remains outside cluster; secrets injected via Kubernetes Secrets / Ansible Vault / environment variables from protected CI credentials. |

---

## 2. Technology Stack & Trade-Off Analysis

### A. Infrastructure as Code (IaC): Terraform on AWS
- **Selected Approach:** Modular Terraform configuration targeting AWS VPC, single/dual EC2 instances (Ubuntu LTS), Security Groups, and Elastic IP. Remote S3 state backend with state locking.
- **Why Not AWS EKS Managed Cluster?** EKS charges $0.10/hr ($72/month) flat cluster fee plus worker nodes and NAT gateways. For an academic module evaluation, a hardened, production-like K3s cluster on EC2 demonstrates identical Kubernetes API mechanics, storage classes, and ingress at 10% the cost, while highlighting Linux/system engineering skills (LO-3).

### B. Configuration Management: Ansible
- **Selected Approach:** Playbook structure with dedicated roles (`common`, `docker`, `k3s_server`, `monitoring`).
- **Standard Applied:** Idempotent tasks, tag-based execution, strict variable isolation, and automated validation using `ansible-playbook --check`.

### C. Containerization: Docker Multi-Stage Builds
- **Selected Approach:**
  - **Backend:** Official `oven/bun:1-alpine` multi-stage container, running as non-root user, exposing port 3001 and `/health` + `/metrics`.
  - **Frontend:** Multi-stage build (Vite build on Bun/Node $\rightarrow$ static assets served by unprivileged Nginx on Alpine).

### D. Container Orchestration: Kubernetes
- **Selected Approach:** Clean declarative Kubernetes manifests:
  - Namespaces: `nexus` (application), `monitoring` (Prometheus/Grafana).
  - Deployments with explicit `requests`/`limits`, `readinessProbe`, and `livenessProbe`.
  - ClusterIP services with Ingress (Traefik/Nginx) for single-entry routing.
  - ConfigMaps for environment configs, Secrets for Atlas connection and JWT keys.

### E. CI/CD: Jenkins with Declarative Groovy Pipeline
- **Selected Approach:** Version-controlled `Jenkinsfile` implementing:
  1. `Checkout & Validate`: Source code lint and unit/security scan.
  2. `Test`: Backend unit tests & syntax checks.
  3. `Build & Package`: Docker multi-stage image creation.
  4. `Push`: Push versioned tags (commit SHA + build ID) to GitHub Container Registry (GHCR) or Docker Hub.
  5. `Deploy`: Update Kubernetes deployment (`kubectl set image` or `kubectl apply`).
  6. `Post-Deploy Smoke Test`: Trigger simulated IoT device OTA update loop against the newly deployed pods.

### F. Observability: Prometheus & Grafana
- **Selected Approach:**
  - Backend instrumentation using `prom-client` to expose HTTP request duration, status codes, active device connections, and firmware downloads.
  - Prometheus scraping application targets and container metrics.
  - Grafana dashboard JSON provisioned automatically displaying Golden Signals (Latency, Traffic, Errors, Saturation) plus IoT-specific metrics.

