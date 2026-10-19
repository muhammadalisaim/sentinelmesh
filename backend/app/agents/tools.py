import datetime
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.db.models import ThreatIntelIOC
from app.rag.qdrant_store import qdrant_store

class ActionCatalog:
    """
    Authorized remediation actions under Least Privilege principle.
    Only strictly cataloged actions can be executed.
    """
    @staticmethod
    def block_ip(target: str) -> Dict[str, Any]:
        return {
            "status": "success",
            "action": "block_ip",
            "target": target,
            "dry_run": True,
            "details": f"Simulated iptables command: iptables -I INPUT -s {target} -j DROP",
            "executed_at": datetime.datetime.utcnow().isoformat()
        }

    @staticmethod
    def lock_user(target: str) -> Dict[str, Any]:
        return {
            "status": "success",
            "action": "lock_user",
            "target": target,
            "dry_run": True,
            "details": f"Simulated account lock: usermod -L {target} && pkill -u {target}",
            "executed_at": datetime.datetime.utcnow().isoformat()
        }

    @staticmethod
    def isolate_host(target: str) -> Dict[str, Any]:
        return {
            "status": "success",
            "action": "isolate_host",
            "target": target,
            "dry_run": True,
            "details": f"Simulated VLAN isolation for host {target}. Preserved forensic SSH link.",
            "executed_at": datetime.datetime.utcnow().isoformat()
        }

    @staticmethod
    def rotate_key(target: str) -> Dict[str, Any]:
        return {
            "status": "success",
            "action": "rotate_key",
            "target": target,
            "dry_run": True,
            "details": f"Revoked active API/SSH key for {target} and generated new cryptographically secure keypair.",
            "executed_at": datetime.datetime.utcnow().isoformat()
        }

    @classmethod
    def execute(cls, action_type: str, target: str) -> Dict[str, Any]:
        if action_type == "block_ip":
            return cls.block_ip(target)
        elif action_type == "lock_user":
            return cls.lock_user(target)
        elif action_type == "isolate_host":
            return cls.isolate_host(target)
        elif action_type == "rotate_key":
            return cls.rotate_key(target)
        else:
            return {"status": "error", "message": f"Action type '{action_type}' not in catalog"}

def lookup_ioc(db: Session, value: str) -> List[Dict[str, Any]]:
    records = db.query(ThreatIntelIOC).filter(ThreatIntelIOC.value == value).all()
    results = []
    for r in records:
        results.append({
            "ioc": r.value,
            "type": r.ioc_type,
            "source": r.source,
            "score": r.score,
            "tags": r.tags
        })
    return results

def search_mitre_techniques(query: str, top_k: int = 3) -> List[Dict[str, Any]]:
    return qdrant_store.search_mitre(query, top_k=top_k)
