# Nexus — IoT Device and Firmware Management Platform

## Module

EC5207 — DevOps Engineering, University of Ruhuna.
Reference: [module information sheet](docs/devops/EC5207_MIS_C23.pdf).

## Brief description

Nexus is a web application for registering IoT devices, monitoring their
connectivity, and managing firmware releases. Administrators upload firmware
and view device information through a dashboard. Devices communicate with
REST APIs to check for and download updates. MongoDB Atlas stores device
records and firmware metadata; GridFS stores firmware binaries in MongoDB.
Simulated devices support repeatable tests and demonstrations.

This version extends the existing web application with DevOps practices for
infrastructure provisioning, configuration, testing, deployment, orchestration,
and monitoring. The original EC4307 version remains in the sibling Nexus folder.

## Technology usage

- Frontend: ReactJS and Vite.
- Backend: ExpressJS, Bun runtime, and REST APIs.
- Database: MongoDB Atlas, with GridFS for firmware files.
- Version control: Git, with separate module branches and worktrees.
- Planned DevOps tools: Terraform and AWS; Ansible; Jenkins with Groovy
  pipelines; Docker; Kubernetes; Prometheus and Grafana.

## Scope

Preserve registration, device status, authentication, firmware management,
version checks, downloads, dashboard, and the simulator. Extend how the app
is tested, delivered, operated, and observed. Application metrics and
infrastructure metrics support DevOps evaluation. Real hardware, device
telemetry, device groups, and staged firmware rollouts remain future work.

## Proposed acceptance criteria

These are project targets mapped to the module, not a lecturer-issued rubric.

- A clean checkout can build and run using documented commands and containers.
- Automated checks cover authentication failures and the firmware OTA flow.
- Terraform provisions a documented AWS environment and Ansible configures it.
- Jenkins runs a Groovy pipeline to test, build, publish images, and deploy.
- Kubernetes runs the application with health checks and a demonstrated update.
- Prometheus collects useful metrics and Grafana displays service health.
- A simulator demonstrates registration, update checking, and a verified download.
- The design document explains architecture, networking, tool choices, secret
  handling, costs, operation, and teardown; progress demos preserve evidence.

See docs/PROGRESS.md for the staged plan and actual completion status.
