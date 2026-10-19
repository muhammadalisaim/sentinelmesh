import pytest
from app.agents.schemas import TriageOutput, InvestigatorOutput, ThreatIntelOutput, ResponderOutput, ReporterOutput

def test_triage_schema_validation():
    sample = {
        "alert_id": "a-101",
        "severity": "high",
        "confidence": 0.95,
        "is_noise": False,
        "reason": "Suspicious login burst",
        "suggested_next": ["investigate"]
    }
    validated = TriageOutput(**sample)
    assert validated.severity == "high"
    assert validated.confidence == 0.95

def test_responder_schema_validation():
    sample = {
        "proposed_actions": [
            {
                "action_type": "block_ip",
                "target": "194.26.29.112",
                "risk_level": "low",
                "description": "Block IP in iptables",
                "rollback_steps": "iptables -D INPUT"
            }
        ],
        "requires_approval": True,
        "urgency": "IMMEDIATE"
    }
    validated = ResponderOutput(**sample)
    assert len(validated.proposed_actions) == 1
    assert validated.requires_approval is True
