from datetime import datetime
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.db.models import (
    User, LogEvent, Alert, Incident, AgentRun, AgentStep,
    ResponseAction, ThreatIntelIOC, Report, AuditLog
)
from app.core.security import get_password_hash, verify_password

# User Operations
def get_user_by_email(db: Session, email: str) -> Optional[User]:
    return db.query(User).filter(User.email == email).first()

def create_user(db: Session, email: str, password: str, role: str = "analyst", full_name: Optional[str] = None) -> User:
    user = User(
        email=email,
        password_hash=get_password_hash(password),
        role=role,
        full_name=full_name
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
    user = get_user_by_email(db, email)
    if not user:
        return None
    if not verify_password(password, user.password_hash):
        return None
    return user

# Log Events Operations
def create_log_events(db: Session, logs_data: List[Dict[str, Any]]) -> List[LogEvent]:
    events = []
    for data in logs_data:
        event = LogEvent(
            ts=data.get("ts", datetime.utcnow()),
            host=data.get("host"),
            source=data.get("source"),
            user_name=data.get("user_name"),
            src_ip=data.get("src_ip"),
            dst_ip=data.get("dst_ip"),
            event_type=data.get("event_type"),
            raw=data.get("raw"),
            normalized_json=data.get("normalized_json", {})
        )
        db.add(event)
        events.append(event)
    db.commit()
    for e in events:
        db.refresh(e)
    return events

def get_recent_logs(db: Session, limit: int = 100) -> List[LogEvent]:
    return db.query(LogEvent).order_by(desc(LogEvent.ts)).limit(limit).all()

# Alert Operations
def create_alert(
    db: Session,
    rule_id: str,
    title: str,
    event_ids: List[str],
    severity: str = "medium",
    confidence: float = 0.8,
    is_noise: bool = False
) -> Alert:
    alert = Alert(
        rule_id=rule_id,
        title=title,
        event_ids=event_ids,
        severity=severity,
        confidence=confidence,
        is_noise=is_noise,
        status="new"
    )
    db.add(alert)
    db.commit()
    db.refresh(alert)
    return alert

def get_alerts(db: Session, status: Optional[str] = None, severity: Optional[str] = None, hide_noise: bool = False) -> List[Alert]:
    query = db.query(Alert)
    if status:
        query = query.filter(Alert.status == status)
    if severity:
        query = query.filter(Alert.severity == severity)
    if hide_noise:
        query = query.filter(Alert.is_noise == False)
    return query.order_by(desc(Alert.created_at)).all()

# Incident Operations
def create_incident(
    db: Session,
    title: str,
    alert_ids: List[str],
    severity: str = "high",
    mitre_techniques: Optional[List[str]] = None,
    timeline_json: Optional[List[Dict[str, Any]]] = None
) -> Incident:
    incident = Incident(
        title=title,
        alert_ids=alert_ids,
        severity=severity,
        mitre_techniques=mitre_techniques or [],
        timeline_json=timeline_json or [],
        status="open"
    )
    db.add(incident)
    db.commit()
    db.refresh(incident)
    return incident

def get_incidents(db: Session, limit: int = 50) -> List[Incident]:
    return db.query(Incident).order_by(desc(Incident.created_at)).limit(limit).all()

def get_incident_by_id(db: Session, incident_id: str) -> Optional[Incident]:
    return db.query(Incident).filter(Incident.id == incident_id).first()

def update_incident(db: Session, incident_id: str, **kwargs) -> Optional[Incident]:
    incident = get_incident_by_id(db, incident_id)
    if incident:
        for key, val in kwargs.items():
            setattr(incident, key, val)
        db.commit()
        db.refresh(incident)
    return incident

# Agent Pipeline Logging
def create_agent_run(db: Session, incident_id: str, model: str) -> AgentRun:
    run = AgentRun(incident_id=incident_id, model=model, started_at=datetime.utcnow())
    db.add(run)
    db.commit()
    db.refresh(run)
    return run

def finish_agent_run(db: Session, run_id: str, total_tokens: int, latency_ms: float) -> Optional[AgentRun]:
    run = db.query(AgentRun).filter(AgentRun.id == run_id).first()
    if run:
        run.finished_at = datetime.utcnow()
        run.total_tokens = total_tokens
        run.latency_ms = latency_ms
        db.commit()
        db.refresh(run)
    return run

def create_agent_step(
    db: Session,
    run_id: str,
    agent_name: str,
    prompt: str,
    output_json: Dict[str, Any],
    tokens_in: int,
    tokens_out: int,
    latency_ms: float
) -> AgentStep:
    step = AgentStep(
        run_id=run_id,
        agent_name=agent_name,
        prompt=prompt,
        output_json=output_json,
        tokens_in=tokens_in,
        tokens_out=tokens_out,
        latency_ms=latency_ms
    )
    db.add(step)
    db.commit()
    db.refresh(step)
    return step

# Response Actions
def create_response_action(
    db: Session,
    incident_id: str,
    action_type: str,
    target: str,
    risk_level: str = "low",
    rollback_info: Optional[Dict[str, Any]] = None
) -> ResponseAction:
    action = ResponseAction(
        incident_id=incident_id,
        action_type=action_type,
        target=target,
        risk_level=risk_level,
        status="proposed",
        rollback_info=rollback_info or {}
    )
    db.add(action)
    db.commit()
    db.refresh(action)
    return action

def get_action_by_id(db: Session, action_id: str) -> Optional[ResponseAction]:
    return db.query(ResponseAction).filter(ResponseAction.id == action_id).first()

def update_action_status(db: Session, action_id: str, status: str, approved_by: Optional[str] = None) -> Optional[ResponseAction]:
    action = get_action_by_id(db, action_id)
    if action:
        action.status = status
        if status in ["approved", "executed"]:
            action.approved_by = approved_by or "analyst"
            action.executed_at = datetime.utcnow()
        db.commit()
        db.refresh(action)
    return action

# Report
def create_report(db: Session, incident_id: str, lang: str, content_md: str, pdf_path: Optional[str] = None) -> Report:
    report = Report(
        incident_id=incident_id,
        lang=lang,
        content_md=content_md,
        pdf_path=pdf_path
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    return report

def get_reports_by_incident(db: Session, incident_id: str) -> List[Report]:
    return db.query(Report).filter(Report.incident_id == incident_id).all()

# Audit Log
def create_audit_log(
    db: Session,
    action: str,
    user_id: Optional[str] = None,
    entity: Optional[str] = None,
    entity_id: Optional[str] = None,
    ip: Optional[str] = None,
    details: Optional[Dict[str, Any]] = None
) -> AuditLog:
    log = AuditLog(
        user_id=user_id,
        action=action,
        entity=entity,
        entity_id=entity_id,
        ip=ip,
        details=details or {}
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return log
