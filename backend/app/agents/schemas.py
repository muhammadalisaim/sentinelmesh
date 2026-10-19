from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class TriageOutput(BaseModel):
    alert_id: str
    severity: str = Field(..., description="low, medium, high, critical")
    confidence: float = Field(..., ge=0.0, le=1.0)
    is_noise: bool
    reason: str
    suggested_next: List[str] = Field(default_factory=list)

class TimelineItem(BaseModel):
    step: int
    phase: str
    description: str

class InvestigatorOutput(BaseModel):
    attack_timeline: List[TimelineItem] = Field(default_factory=list)
    affected_assets: List[str] = Field(default_factory=list)
    compromised_users: List[str] = Field(default_factory=list)
    mitre_techniques: List[str] = Field(default_factory=list)
    summary: str

class IOCMatch(BaseModel):
    ioc: str
    type: str
    reputation_score: int
    threat_actor: Optional[str] = None
    abuse_confidence: Optional[str] = None
    tags: List[str] = Field(default_factory=list)

class ThreatIntelOutput(BaseModel):
    ioc_matches: List[IOCMatch] = Field(default_factory=list)
    threat_level: str
    matched_advisories: List[str] = Field(default_factory=list)

class ProposedAction(BaseModel):
    action_type: str = Field(..., description="block_ip, lock_user, isolate_host, rotate_key")
    target: str
    risk_level: str = Field(..., description="low, medium, high")
    description: str
    rollback_steps: str

class ResponderOutput(BaseModel):
    proposed_actions: List[ProposedAction] = Field(default_factory=list)
    requires_approval: bool = True
    urgency: str = "IMMEDIATE"

class ReporterOutput(BaseModel):
    report_en: str
    report_ur: str
    status: str = "generated"
