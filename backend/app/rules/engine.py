import os
import yaml
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from collections import defaultdict
from app.db.models import LogEvent, Alert

class RuleEngine:
    def __init__(self, rules_path: Optional[str] = None):
        if not rules_path:
            base_dir = os.path.dirname(__file__)
            rules_path = os.path.join(base_dir, "rules.yaml")
        self.rules_path = rules_path
        self.rules = self.load_rules()
        # In-memory sliding window buffer: key -> list of (timestamp, event_id, event)
        self.history = defaultdict(list)

    def load_rules(self) -> List[Dict[str, Any]]:
        try:
            with open(self.rules_path, "r") as f:
                data = yaml.safe_load(f)
                return data.get("rules", [])
        except Exception as e:
            print(f"[RuleEngine Error] Failed to load rules from {self.rules_path}: {e}")
            return []

    def evaluate_events(self, events: List[LogEvent]) -> List[Dict[str, Any]]:
        """
        Evaluates new log events against configured pre-filter rules.
        Returns candidate alert payloads.
        """
        alerts_to_create = []
        now = datetime.utcnow()

        for event in events:
            # Clean old history (> 10 minutes)
            cutoff = now - timedelta(minutes=10)
            for k in list(self.history.keys()):
                self.history[k] = [item for item in self.history[k] if item[0] > cutoff]

            # Key by (src_ip, event_type)
            key = (event.src_ip or "unknown", event.event_type)
            self.history[key].append((event.ts or now, event.id, event))

            # Match against rules
            for rule in self.rules:
                if rule["event_type"] == event.event_type:
                    window_sec = rule.get("window_seconds", 120)
                    threshold = rule.get("threshold", 1)
                    
                    window_cutoff = (event.ts or now) - timedelta(seconds=window_sec)
                    matching_events = [
                        item for item in self.history[key]
                        if item[0] >= window_cutoff
                    ]

                    if len(matching_events) >= threshold:
                        # Threshold hit!
                        event_ids = [item[1] for item in matching_events]
                        alert_dict = {
                            "rule_id": rule["id"],
                            "title": f"{rule['name']} ({event.src_ip})",
                            "event_ids": event_ids,
                            "severity": rule["severity"],
                            "confidence": 0.90 if len(matching_events) > threshold else 0.82,
                            "is_noise": False,
                            "mitre_technique": rule.get("mitre_technique")
                        }
                        # Avoid duplicate alerts for the same burst
                        if not any(a["rule_id"] == rule["id"] and set(a["event_ids"]) == set(event_ids) for a in alerts_to_create):
                            alerts_to_create.append(alert_dict)

        return alerts_to_create

rule_engine = RuleEngine()
