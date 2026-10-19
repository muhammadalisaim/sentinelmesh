import asyncio
from typing import List
from fastapi import APIRouter, Depends, BackgroundTasks
from sqlalchemy.orm import Session
from app.db.session import get_db, SessionLocal
from app.db import crud, schemas, models
from app.ingest.normalizer import normalizer
from app.rules.engine import rule_engine
from app.agents.orchestrator import orchestrator

router = APIRouter()

async def run_pipeline_bg(alert_id: str):
    # Run pipeline in fresh DB session
    db = SessionLocal()
    try:
        await orchestrator.run_pipeline_for_alert(db, alert_id)
    finally:
        db.close()

@router.post("/ingest")
async def ingest_logs(
    batch: schemas.LogBatchIngest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    normalized_list = []
    for item in batch.logs:
        norm = normalizer.normalize(item.raw, source_hint=item.source)
        # Apply overrides if provided
        if item.host: norm["host"] = item.host
        if item.src_ip: norm["src_ip"] = item.src_ip
        if item.user_name: norm["user_name"] = item.user_name
        if item.event_type: norm["event_type"] = item.event_type
        normalized_list.append(norm)

    # Save to log_events table
    created_events = crud.create_log_events(db, normalized_list)

    # Evaluate pre-filter rules
    candidate_alerts = rule_engine.evaluate_events(created_events)
    created_alerts = []

    for alert_data in candidate_alerts:
        alert = crud.create_alert(
            db=db,
            rule_id=alert_data["rule_id"],
            title=alert_data["title"],
            event_ids=alert_data["event_ids"],
            severity=alert_data["severity"],
            confidence=alert_data["confidence"],
            is_noise=alert_data["is_noise"]
        )
        created_alerts.append(alert.id)
        # Launch multi-agent pipeline in background
        background_tasks.add_task(run_pipeline_bg, alert.id)

    return {
        "status": "success",
        "ingested_count": len(created_events),
        "alerts_generated": len(created_alerts),
        "alert_ids": created_alerts
    }

@router.get("/recent", response_model=List[schemas.LogEventResponse])
def get_recent_logs(limit: int = 50, db: Session = Depends(get_db)):
    return crud.get_recent_logs(db, limit=limit)
