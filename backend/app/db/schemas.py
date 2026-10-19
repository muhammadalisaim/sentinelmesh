from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

# Auth Schemas
class Token(BaseModel):
    access_token: str
    token_type: str
    user_id: str
    role: str
    email: str

class TokenPayload(BaseModel):
    sub: Optional[str] = None
    role: Optional[str] = None
    exp: Optional[int] = None

class UserLogin(BaseModel):
    email: str
    password: str

class UserCreate(BaseModel):
    email: str
    password: str
    role: Optional[str] = "analyst"
    full_name: Optional[str] = None

class UserResponse(BaseModel):
    id: str
    email: str
    role: str
    full_name: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# Log Schemas
class LogEventCreate(BaseModel):
    ts: Optional[datetime] = None
    host: Optional[str] = None
    source: Optional[str] = "unknown"
    user_name: Optional[str] = None
    src_ip: Optional[str] = None
    dst_ip: Optional[str] = None
    event_type: Optional[str] = None
    raw: str
    normalized_json: Optional[Dict[str, Any]] = None

class LogBatchIngest(BaseModel):
    logs: List[LogEventCreate]

class LogEventResponse(BaseModel):
    id: str
    ts: datetime
    host: Optional[str]
    source: Optional[str]
    user_name: Optional[str]
    src_ip: Optional[str]
    dst_ip: Optional[str]
    event_type: Optional[str]
    raw: Optional[str]
    normalized_json: Optional[Dict[str, Any]]

    class Config:
        from_attributes = True

# Alert Schemas
class AlertResponse(BaseModel):
    id: str
    rule_id: str
    title: Optional[str]
    event_ids: List[str]
    severity: str
    confidence: float
    is_noise: bool
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

# Action Schemas
class ResponseActionResponse(BaseModel):
    id: str
    incident_id: str
    action_type: str
    target: str
    risk_level: str
    status: str
    approved_by: Optional[str]
    executed_at: Optional[datetime]
    rollback_info: Optional[Dict[str, Any]]
    created_at: datetime

    class Config:
        from_attributes = True

# Agent Step Schemas
class AgentStepResponse(BaseModel):
    id: str
    run_id: str
    agent_name: str
    prompt: Optional[str]
    output_json: Optional[Dict[str, Any]]
    tokens_in: int
    tokens_out: int
    latency_ms: float
    created_at: datetime

    class Config:
        from_attributes = True

# Agent Run Schemas
class AgentRunResponse(BaseModel):
    id: str
    incident_id: str
    started_at: datetime
    finished_at: Optional[datetime]
    model: str
    total_tokens: int
    latency_ms: float
    steps: List[AgentStepResponse] = []

    class Config:
        from_attributes = True

# Incident Schemas
class IncidentResponse(BaseModel):
    id: str
    alert_ids: List[str]
    title: str
    severity: str
    mitre_techniques: List[str]
    timeline_json: List[Dict[str, Any]]
    status: str
    created_at: datetime
    closed_at: Optional[datetime]

    class Config:
        from_attributes = True

class IncidentDetailResponse(IncidentResponse):
    runs: List[AgentRunResponse] = []
    actions: List[ResponseActionResponse] = []

# Report Schemas
class ReportResponse(BaseModel):
    id: str
    incident_id: str
    lang: str
    content_md: str
    pdf_path: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

# Benchmark Metrics
class BenchmarkMetrics(BaseModel):
    gpu_model: str
    rocm_version: str
    tokens_per_second: float
    time_to_first_token_ms: float
    avg_latency_ms: float
    total_inferences: int
    cost_per_1m_tokens_amd: float
    cost_per_1m_tokens_cloud_api: float
    cost_savings_percent: float
    long_context_window: str

# Simulator Schemas
class SimulatorRunRequest(BaseModel):
    scenario: str = Field(..., description="ssh_bruteforce, phishing_c2, sqli_webshell, or benign_traffic")
    target_host: Optional[str] = "corp-db-01.internal"
    attacker_ip: Optional[str] = "194.26.29.112"

class SimulatorRunResponse(BaseModel):
    scenario: str
    status: str
    logs_generated: int
    incident_id: Optional[str] = None
    message: str
