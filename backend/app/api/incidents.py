from typing import List
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from app.db.session import get_db, SessionLocal
from app.db import crud, schemas, models
from app.agents.orchestrator import orchestrator

router = APIRouter()

async def run_analysis_bg(alert_id: str):
    db = SessionLocal()
    try:
        await orchestrator.run_pipeline_for_alert(db, alert_id)
    finally:
        db.close()

@router.get("", response_model=List[schemas.IncidentResponse])
def get_incidents(limit: int = 50, db: Session = Depends(get_db)):
    return crud.get_incidents(db, limit=limit)

@router.get("/{incident_id}", response_model=schemas.IncidentDetailResponse)
def get_incident(incident_id: str, db: Session = Depends(get_db)):
    inc = crud.get_incident_by_id(db, incident_id)
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")
    return inc

@router.post("/{incident_id}/analyze")
def trigger_analysis(incident_id: str, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    inc = crud.get_incident_by_id(db, incident_id)
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")
    if inc.alert_ids:
        background_tasks.add_task(run_analysis_bg, inc.alert_ids[0])
    return {"status": "analysis_dispatched", "incident_id": incident_id}
