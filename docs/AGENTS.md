# SentinelMesh Multi-Agent Specification

SentinelMesh organizes autonomous defense into five specialized agents communicating over a state machine orchestrator.

---

## 1. Triage Agent
- **Purpose:** Rapid triage of incoming pre-filter alert candidates.
- **Input:** Normalized event batch + rule triggering metadata.
- **Tools:** DB event queries, noise discrimination engine.
- **Output Schema:**
```json
{
  "alert_id": "a-1042",
  "severity": "high",
  "confidence": 0.94,
  "is_noise": false,
  "reason": "12 failed SSH attempts in 60s followed by successful login from external untrusted IP.",
  "suggested_next": ["investigate", "threat_intel"]
}
```

---

## 2. Investigator Agent
- **Purpose:** Kill chain reconstruction and MITRE ATT&CK technique mapping.
- **Input:** Alert metadata + sliding window log context.
- **Tools:** Qdrant vector semantic search (MITRE knowledge base).
- **Output Schema:**
```json
{
  "attack_timeline": [
    {"step": 1, "phase": "Credential Access", "description": "SSH password brute forcing detected."},
    {"step": 2, "phase": "Privilege Escalation", "description": "Sudo bash session spawned."}
  ],
  "affected_assets": ["corp-db-01.internal"],
  "compromised_users": ["ubuntu"],
  "mitre_techniques": ["T1110.001", "T1078.003", "T1548.003"],
  "summary": "External adversary breached bastion host and escalated to root."
}
```

---

## 3. Threat Intel Agent
- **Purpose:** Indicator of Compromise (IOC) reputation scoring.
- **Input:** Extracted source IPs, domains, hashes, and attack narrative.
- **Tools:** Local Threat DB query, Tor exit node & APT actor feed match.
- **Output Schema:**
```json
{
  "ioc_matches": [
    {
      "ioc": "194.26.29.112",
      "type": "ip",
      "reputation_score": 92,
      "threat_actor": "Known Tor Exit Node / Credential Brute-Force Botnet",
      "abuse_confidence": "98%",
      "tags": ["tor", "brute_force"]
    }
  ],
  "threat_level": "CRITICAL",
  "matched_advisories": ["CISA-AA24-012A"]
}
```

---

## 4. Responder Agent
- **Purpose:** Cataloging targeted remediation with rollback safeguards.
- **Input:** Investigation findings, affected assets, and threat level.
- **Authorized Catalog:** `block_ip`, `lock_user`, `isolate_host`, `rotate_key`.
- **Output Schema:**
```json
{
  "proposed_actions": [
    {
      "action_type": "block_ip",
      "target": "194.26.29.112",
      "risk_level": "low",
      "description": "Block inbound and outbound packets via iptables.",
      "rollback_steps": "iptables -D INPUT -s 194.26.29.112 -j DROP"
    }
  ],
  "requires_approval": true,
  "urgency": "IMMEDIATE"
}
```

---

## 5. Reporter Agent
- **Purpose:** Dual-language executive and technical briefings.
- **Languages:** English (LTR) + Urdu (اردو RTL Nastaliq).
- **Tools:** HTML template shaper + WeasyPrint PDF compiler.
