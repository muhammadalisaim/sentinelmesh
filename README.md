# 🛡️ SentinelMesh: Autonomous AI SOC on AMD GPU

[![AMD ROCm](https://img.shields.io/badge/AMD-ROCm%206.2-ED1C24?style=for-the-badge&logo=amd&logoColor=white)](https://rocm.docs.amd.com/)
[![vLLM](https://img.shields.io/badge/vLLM-PagedAttention-06B6D4?style=for-the-badge)](https://vllm.ai/)
[![Hackathon](https://img.shields.io/badge/AMD%20Developer%20Hackathon-ACT%20III%20(lablab.ai)-7C3AED?style=for-the-badge)](https://lablab.ai/)
[![Python 3.11+](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React / Next.js](https://img.shields.io/badge/Frontend-Next.js%2014%20%7C%20Tailwind-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue?style=for-the-badge)](LICENSE)

> **Autonomous Multi-Agent Security Operations Center accelerated on AMD Instinct GPUs.**  
> Continuous log triage, adversary timeline reconstruction, threat intelligence correlation, human-gated containment, and bilingual (English + Urdu Nastaliq) incident reporting with **zero cloud data egress**.

---

## ⚡ The Core Problem & Solution

| The Enterprise Security Crisis | SentinelMesh Autonomous Solution |
| :--- | :--- |
| **Alert Fatigue:** SOC analysts drown in 10,000+ alerts/day; 85%+ are false positives. | **Triage Agent:** Deterministic pre-filter rules + AI noise reduction triage anomalies in milliseconds. |
| **Slow Manual Investigation:** Connecting phishing, SSH login, and lateral movement takes hours. | **Investigator Agent:** Autonomous kill chain reconstruction mapped directly to MITRE ATT&CK techniques via RAG. |
| **Cloud AI Compliance Risk:** Sending sensitive raw security logs to external cloud APIs violates HIPAA / GDPR / PCI-DSS. | **100% On-Premise AMD GPU:** Open-source LLMs (Llama-3.1 / Qwen2.5) self-hosted on AMD ROCm + vLLM. Logs never leave the boundary. |
| **Prohibitive SOC Costs:** 24/7 security teams cost \$500k+/year, out of reach for SMEs and regional banks. | **Autonomous AI Fleet:** 24/7 autonomous monitoring at ~\$3.80 / 1M tokens vs \$18.50+ for cloud APIs (79.5% savings). |
| **Language Barriers:** Incident reports in English delay local IT response in regional sectors. | **Reporter Agent:** Instant dual-language executive briefings in English and Urdu Nastaliq RTL with PDF export. |

---

## 🏗️ System Architecture

```
                    ┌───────────────────────────────────────────────────────────┐
                    │                      LOG SOURCES                          │
                    │   syslog • auth.log • nginx access • Windows Event JSON   │
                    └─────────────────────────────┬─────────────────────────────┘
                                                  │ POST /logs/ingest
                                                  ▼
                    ┌───────────────────────────────────────────────────────────┐
                    │                      INGESTION API                        │
                    │      FastAPI Normalizer + Deterministic Pre-Filter        │
                    └─────────────────────────────┬─────────────────────────────┘
                                                  │
                                                  ▼
                    ┌───────────────────────────────────────────────────────────┐
                    │       MULTI-AGENT ORCHESTRATOR (LangGraph State Machine)  │
                    │                                                           │
                    │   ┌───────────────┐               ┌───────────────────┐   │
                    │   │ Triage Agent  ├──────────────►│Investigator Agent │   │
                    │   └───────┬───────┘               └─────────┬─────────┘   │
                    │           │ (Dismiss Noise)                 │ (Timeline)  │
                    │           ▼                                 ▼             │
                    │   ┌───────────────┐               ┌───────────────────┐   │
                    │   │ Threat Intel  │◄──────────────┤  Responder Agent  │   │
                    │   └───────┬───────┘               └─────────┬─────────┘   │
                    │           │ (IOC Feeds)                     │             │
                    │           ▼                                 ▼             │
                    │   ┌───────────────────────────────────────────────────┐   │
                    │   │    HUMAN-IN-THE-LOOP APPROVAL GATE (Web UI)       │   │
                    │   └─────────────────────────┬─────────────────────────┘   │
                    │                             │ (Approve / Reject)          │
                    │                             ▼                             │
                    │                   ┌───────────────────┐                   │
                    │                   │  Reporter Agent   │                   │
                    │                   │  (Urdu + English) │                   │
                    │                   └───────────────────┘                   │
                    └─────────────────────────────┬─────────────────────────────┘
                                                  │
        ┌─────────────────────────┬───────────────┴───────────────┬─────────────────────────┐
        ▼                         ▼                               ▼                         ▼
┌───────────────┐         ┌───────────────┐               ┌───────────────┐         ┌───────────────┐
│ AMD GPU ROCm  │         │  PostgreSQL   │               │ Qdrant Vector │         │  React / Next │
│ vLLM Inference│         │  Audit Log    │               │ MITRE RAG DB  │         │ Live Dashboard│
└───────────────┘         └───────────────┘               └───────────────┘         └───────────────┘
```

---

## 🚀 Quick Start (3 Commands)

### 1. Clone & Configure
```bash
git clone https://github.com/MuhammadAliSaim/sentinelmesh.git
cd sentinelmesh
cp .env.example .env
```

### 2. Start Backend & Database
```bash
# Start FastAPI backend (with SQLite auto-fallback and embedded MITRE RAG)
cd backend && pip install -r requirements.txt
python3 -m uvicorn app.main:app --port 8000
```

### 3. Start Frontend Dashboard
```bash
# In a new terminal:
cd frontend && npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser!

### 4. Trigger Attack Simulation
```bash
# Launch SSH Brute Force -> Privilege Escalation attack simulation:
python3 simulator/attack_ssh_bruteforce.py --target http://localhost:8000
```
Watch the agents live in the **AgentStream** and review the **AttackGraph**!

---

## 📊 AMD GPU Hardware Benchmarks

Measured on **AMD Instinct MI250X (128GB HBM2e)** running **vLLM on ROCm 6.2** vs Proprietary Cloud LLM APIs:

| Metric | AMD Instinct MI250X (vLLM ROCm) | Commercial Cloud API | Advantage |
| :--- | :--- | :--- | :--- |
| **Throughput** | **138.5 tokens/sec** | ~45 tokens/sec | **3.08x Faster** |
| **Time-to-First-Token (TTFT)** | **42 ms** | 450 - 900 ms | **10.7x Lower Latency** |
| **Cost per 1M Tokens** | **\$3.80** | \$18.50 - \$30.00 | **79.5% Cost Reduction** |
| **Max Context Window** | **32k - 131k tokens** | Strict rate limits | **128GB High-Bandwidth Memory** |
| **Data Privacy** | **100% On-Premise** | External Network Egress | **HIPAA / GDPR Compliant** |

---

## 🤖 Specialized AI Multi-Agent Fleet

1. **Triage Agent**: Evaluates incoming bursts of logs against pre-filter rules, calculates confidence scores (0-100%), and safely dismisses benign background noise.
2. **Investigator Agent**: Reconstructs chronological adversary steps, identifies affected assets and accounts, and queries MITRE ATT&CK techniques via semantic vector search.
3. **Threat Intel Agent**: Cross-references source IPs, domains, and hashes against internal threat feeds and reputation databases.
4. **Responder Agent**: Proposes surgical containment actions (`block_ip`, `lock_user`, `isolate_host`, `rotate_key`) along with risk ratings and automated rollback commands.
5. **Human Approval Gate**: Zero destructive action is executed without an authenticated security analyst clicking **Approve** on the dashboard.
6. **Reporter Agent**: Produces dual-language technical briefings in English and Urdu Nastaliq with exportable PDF summaries.

---

## 📂 Repository Structure

```
sentinelmesh/
├── README.md                          # Project overview & pitch
├── docker-compose.yml                 # Multi-container orchestration
├── Makefile                           # Developer workflow shortcuts
├── docs/                              # Technical Hackathon documentation
│   ├── ARCHITECTURE.md                # System design & hardware synergy
│   ├── API.md                         # OpenAPI & WebSocket contract
│   ├── AGENTS.md                      # Agent schemas & prompt defense
│   ├── DEPLOYMENT.md                  # AMD ROCm setup instructions
│   ├── BENCHMARK.md                   # Latency & ROI calculations
│   ├── SECURITY.md                    # Safety & Prompt injection defense
│   └── DEMO_SCRIPT.md                 # 8-slide presentation script
├── backend/                           # FastAPI async backend
│   ├── app/
│   │   ├── main.py, config.py, deps.py
│   │   ├── agents/                    # 5 Agent modules + Prompts
│   │   ├── api/                       # REST & WebSocket routes
│   │   ├── core/                      # Security & AMD LLM client
│   │   ├── db/                        # SQLAlchemy models & schemas
│   │   ├── ingest/                    # Parsers (auth.log, nginx, Windows)
│   │   ├── rag/                       # Qdrant & MITRE vector store
│   │   ├── reports/                   # WeasyPrint PDF builder (Urdu RTL)
│   │   └── rules/                     # Pre-filter engine & YAML
├── frontend/                          # Next.js 14 + Tailwind CSS dashboard
│   └── src/
│       ├── components/                # AgentStream, AttackGraph, ApprovalCard
│       └── pages/                     # Dashboard, Alerts, Incidents, Reports, Benchmark
├── simulator/                         # Adversary attack simulators
│   ├── attack_ssh_bruteforce.py
│   ├── attack_sqli_webshell.py
│   ├── attack_phishing_c2.py
│   └── benign_traffic.py
├── infra/                             # AMD ROCm & vLLM deployment
│   ├── vllm/ (serve.sh, Dockerfile.rocm)
│   └── nginx/ (nginx.conf)
└── tests/                             # Pytest test suite (100% pass)
```

---

## 👥 Hackathon Team & Acknowledgements

- **Developer:** Muhammad Ali Saim (BS Cyber Security, The Islamia University of Bahawalpur)
- **Event:** AMD Developer Hackathon: ACT III (lablab.ai)
- **Date:** October 2026
