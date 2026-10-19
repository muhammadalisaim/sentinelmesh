from datetime import datetime
import uuid
from sqlalchemy import (
    Column, Integer, String, Text, Boolean, Float, DateTime, ForeignKey, JSON
)
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

def generate_uuid() -> str:
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=generate_uuid)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, default="analyst")  # admin, analyst
    full_name = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class LogEvent(Base):
    __tablename__ = "log_events"

    id = Column(String, primary_key=True, default=generate_uuid)
    ts = Column(DateTime, default=datetime.utcnow, index=True)
    host = Column(String, index=True, nullable=True)
    source = Column(String, index=True, nullable=True)  # auth_log, nginx, windows_json
    user_name = Column(String, index=True, nullable=True)
    src_ip = Column(String, index=True, nullable=True)
    dst_ip = Column(String, index=True, nullable=True)
    event_type = Column(String, index=True, nullable=True)
    raw = Column(Text, nullable=True)
    normalized_json = Column(JSON, default=dict)

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(String, primary_key=True, default=generate_uuid)
    rule_id = Column(String, index=True, nullable=False)
    title = Column(String, nullable=True)
    event_ids = Column(JSON, default=list)  # list of log_events.id
    severity = Column(String, default="medium", index=True)  # low, medium, high, critical
    confidence = Column(Float, default=0.5)
    is_noise = Column(Boolean, default=False)
    status = Column(String, default="new", index=True)  # new, open, closed
    created_at = Column(DateTime, default=datetime.utcnow)

class Incident(Base):
    __tablename__ = "incidents"

    id = Column(String, primary_key=True, default=generate_uuid)
    alert_ids = Column(JSON, default=list)
    title = Column(String, nullable=False)
    severity = Column(String, default="high", index=True)
    mitre_techniques = Column(JSON, default=list)  # list of technique IDs (e.g., ["T1110", "T1078"])
    timeline_json = Column(JSON, default=list)  # chronological attack events
    status = Column(String, default="open", index=True)  # open, investigating, action_required, contained, closed
    created_at = Column(DateTime, default=datetime.utcnow)
    closed_at = Column(DateTime, nullable=True)
    
    # Relationships
    runs = relationship("AgentRun", back_populates="incident", cascade="all, delete-orphan")
    actions = relationship("ResponseAction", back_populates="incident", cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="incident", cascade="all, delete-orphan")

class AgentRun(Base):
    __tablename__ = "agent_runs"

    id = Column(String, primary_key=True, default=generate_uuid)
    incident_id = Column(String, ForeignKey("incidents.id"), nullable=False, index=True)
    started_at = Column(DateTime, default=datetime.utcnow)
    finished_at = Column(DateTime, nullable=True)
    model = Column(String, default="meta-llama/Llama-3.1-8B-Instruct")
    total_tokens = Column(Integer, default=0)
    latency_ms = Column(Float, default=0.0)

    incident = relationship("Incident", back_populates="runs")
    steps = relationship("AgentStep", back_populates="run", cascade="all, delete-orphan")

class AgentStep(Base):
    __tablename__ = "agent_steps"

    id = Column(String, primary_key=True, default=generate_uuid)
    run_id = Column(String, ForeignKey("agent_runs.id"), nullable=False, index=True)
    agent_name = Column(String, nullable=False, index=True)  # triage, investigator, threat_intel, responder, reporter
    prompt = Column(Text, nullable=True)
    output_json = Column(JSON, default=dict)
    tokens_in = Column(Integer, default=0)
    tokens_out = Column(Integer, default=0)
    latency_ms = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)

    run = relationship("AgentRun", back_populates="steps")

class ResponseAction(Base):
    __tablename__ = "response_actions"

    id = Column(String, primary_key=True, default=generate_uuid)
    incident_id = Column(String, ForeignKey("incidents.id"), nullable=False, index=True)
    action_type = Column(String, nullable=False)  # block_ip, lock_user, isolate_host, rotate_key
    target = Column(String, nullable=False)
    risk_level = Column(String, default="low")  # low, medium, high
    status = Column(String, default="proposed", index=True)  # proposed, approved, rejected, executed
    approved_by = Column(String, nullable=True)
    executed_at = Column(DateTime, nullable=True)
    rollback_info = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)

    incident = relationship("Incident", back_populates="actions")

class ThreatIntelIOC(Base):
    __tablename__ = "threat_intel_iocs"

    id = Column(String, primary_key=True, default=generate_uuid)
    ioc_type = Column(String, nullable=False, index=True)  # ip, domain, hash
    value = Column(String, nullable=False, index=True)
    source = Column(String, default="LocalThreatDB")
    score = Column(Integer, default=75)  # 0 to 100 risk score
    first_seen = Column(DateTime, default=datetime.utcnow)
    tags = Column(JSON, default=list)

class Report(Base):
    __tablename__ = "reports"

    id = Column(String, primary_key=True, default=generate_uuid)
    incident_id = Column(String, ForeignKey("incidents.id"), nullable=False, index=True)
    lang = Column(String, default="en")  # en, ur
    content_md = Column(Text, nullable=False)
    pdf_path = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    incident = relationship("Incident", back_populates="reports")

class AuditLog(Base):
    __tablename__ = "audit_log"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, nullable=True, index=True)
    action = Column(String, nullable=False)  # approve_action, reject_action, trigger_pipeline, login
    entity = Column(String, nullable=True)  # response_action, incident, user
    entity_id = Column(String, nullable=True)
    ts = Column(DateTime, default=datetime.utcnow, index=True)
    ip = Column(String, nullable=True)
    details = Column(JSON, default=dict)
