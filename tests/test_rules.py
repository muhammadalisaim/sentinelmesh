import pytest
from datetime import datetime
from app.rules.engine import RuleEngine
from app.db.models import LogEvent

def test_rule_engine_burst_detection():
    engine = RuleEngine()
    
    # Create 6 failed SSH events from same IP
    events = []
    for i in range(6):
        events.append(LogEvent(
            id=f"ev-{i}",
            ts=datetime.utcnow(),
            event_type="ssh_login_failed",
            src_ip="194.26.29.112",
            host="corp-db-01",
            raw=f"Failed SSH attempt {i}"
        ))

    alerts = engine.evaluate_events(events)
    assert len(alerts) >= 1
    assert alerts[0]["rule_id"] == "RULE-SSH-BRUTE"
    assert alerts[0]["severity"] == "high"
