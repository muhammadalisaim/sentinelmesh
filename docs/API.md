# SentinelMesh API Reference Contract

Base URL: `http://localhost:8000/api/v1`

---

## 1. Authentication

### `POST /auth/login`
Authenticates a SOC analyst or administrator and returns a JWT bearer token.
- **Request Body:**
```json
{
  "email": "analyst@sentinelmesh.ai",
  "password": "sentinel123"
}
```
- **Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOi...",
  "token_type": "bearer",
  "user_id": "u-101",
  "role": "analyst",
  "email": "analyst@sentinelmesh.ai"
}
```

---

## 2. Ingestion & Telemetry

### `POST /logs/ingest`
Ingests a batch of raw or structured security logs.
- **Request Body:**
```json
{
  "logs": [
    {
      "source": "auth_log",
      "raw": "Oct 19 00:30:10 corp-db-01 sshd[12801]: Failed password for invalid user admin from 194.26.29.112 port 41201 ssh2"
    }
  ]
}
```
- **Response (200 OK):**
```json
{
  "status": "success",
  "ingested_count": 1,
  "alerts_generated": 1,
  "alert_ids": ["alert-8491"]
}
```

---

## 3. Alerts & Incidents

### `GET /alerts?status=open&severity=high&hide_noise=true`
Retrieves triaged alerts with optional filtering.

### `GET /incidents`
Lists investigated incidents with timeline summaries and MITRE tags.

### `GET /incidents/{id}`
Returns complete incident details, including agent reasoning runs and proposed response actions.

---

## 4. Human Containment Gate

### `POST /actions/{id}/approve`
Approves a proposed containment action (`block_ip`, `lock_user`, `isolate_host`, `rotate_key`).
- **Response (200 OK):**
```json
{
  "id": "act-992",
  "incident_id": "inc-102",
  "action_type": "block_ip",
  "target": "194.26.29.112",
  "risk_level": "low",
  "status": "executed",
  "approved_by": "analyst@sentinelmesh.ai",
  "executed_at": "2026-10-19T00:35:10Z"
}
```

### `POST /actions/{id}/reject`
Rejects a proposed action.

---

## 5. Reports & Benchmarks

### `GET /reports/{incident_id}`
Returns English and Urdu markdown reports for the incident.

### `GET /reports/{incident_id}/pdf?lang=ur|en`
Downloads the formatted PDF report.

### `GET /metrics/benchmark`
Returns AMD Instinct GPU performance benchmarks and cost comparison statistics.

---

## 6. Live WebSocket Stream

### `WS /ws/stream`
Real-time full duplex stream broadcasting agent reasoning tokens, status transitions, and action updates.
