# SentinelMesh Technical Architecture

SentinelMesh is architected as an autonomous, on-premise security intelligence platform. It replaces legacy manual log triage with a distributed multi-agent state machine accelerated on AMD ROCm Instinct GPUs.

---

## 1. High-Level Design Principles

1. **Zero Data Egress:** Raw enterprise logs (containing PII, user tokens, passwords, and internal IPs) are strictly prohibited from leaving the customer's AMD GPU hardware enclave.
2. **Deterministic Rules Pre-Filter:** LLM inference is reserved only for anomalous and suspicious events. Simple statistical thresholding filters out 90%+ of routine benign logs at 100k events/sec.
3. **Structured Pydantic Contract:** Every AI agent communicates strictly via strongly-typed JSON schemas. No unparsed natural language flows between agents.
4. **Human-in-the-Loop Safeguard:** Destructive containment actions (firewall blocks, account terminations, host isolation) require explicit human analyst authorization.
5. **Traceable Auditability:** Every prompt, completion token, latency timestamp, and user approval is recorded immutably in the PostgreSQL audit log.

---

## 2. Component Pipeline

### A. Ingestion & Normalization Layer
- **Collector Endpoint:** Ingests batches of security logs via `/api/v1/logs/ingest`.
- **Specialized Parsers:**
  - `auth_log.py`: Extracts SSH failed/accepted authentications and sudo privilege elevation commands.
  - `nginx.py`: Identifies web requests, URL-decoded SQL injection attacks, and webshell drops.
  - `windows_json.py`: Parses Windows Security Event IDs (4624, 4625, 4672, 4688) and Sysmon C2 beacons.
- **Normalizer:** Casts incoming payloads into standard schema (`ts`, `host`, `source`, `user_name`, `src_ip`, `dst_ip`, `event_type`, `normalized_json`).

### B. Pre-Filter Engine
- Sliding time-window buffer tracks event frequency per `(src_ip, event_type)`.
- If an adversary attempts 5+ failed logins in 120s, an Alert is instantiated and handed over to the orchestrator.

### C. Multi-Agent Orchestrator
- Implemented as a state machine:
  1. **Triage:** Decides whether the alert is genuine or noise.
  2. **Investigator:** Queries database logs, traces kill chain, and embeds query into Qdrant vector store to match MITRE ATT&CK techniques.
  3. **Threat Intel:** Evaluates attacker reputation scores.
  4. **Responder:** Recommends remediation actions from the catalog with rollback commands.
  5. **Human Gate:** Halts state transition until approval received.
  6. **Reporter:** Compiles executive summaries in English and Urdu Nastaliq.

---

## 3. Hardware Synergy: Why AMD Instinct GPUs?

- **128GB HBM2e High-Bandwidth Memory:** Enables processing massive log batches in a single 32k-128k prompt context without running out of VRAM or truncating evidence.
- **vLLM on ROCm 6.2:** Custom PagedAttention kernels maximize GPU utilization, achieving over 138 tokens/second.
- **Cost Predictability:** Amortized hardware ownership costs ~$3.80 per 1M tokens vs unpredictable, recurring commercial API pricing of $18.50 - $30.00/1M tokens.
