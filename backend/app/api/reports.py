import os
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db import crud, schemas, models
from app.reports.pdf_builder import generate_incident_pdf

router = APIRouter()

@router.get("/{incident_id}", response_model=List[schemas.ReportResponse])
def get_reports(incident_id: str, db: Session = Depends(get_db)):
    reports = crud.get_reports_by_incident(db, incident_id)
    if not reports:
        # Check incident exists
        inc = crud.get_incident_by_id(db, incident_id)
        if not inc:
            raise HTTPException(status_code=404, detail="Incident not found")
    return reports

@router.get("/{incident_id}/pdf")
def download_pdf(incident_id: str, lang: str = Query("en"), db: Session = Depends(get_db)):
    inc = crud.get_incident_by_id(db, incident_id)
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")
        
    reports = crud.get_reports_by_incident(db, incident_id)
    target_report = next((r for r in reports if r.lang == lang), None)
    
    if target_report and target_report.pdf_path and os.path.exists(target_report.pdf_path):
        return FileResponse(
            path=target_report.pdf_path,
            filename=f"sentinelmesh_incident_{incident_id}_{lang}.pdf",
            media_type="application/pdf"
        )
    
    # Generate on the fly
    content = target_report.content_md if target_report else f"# Incident {incident_id}\n\nAutomated SOC Summary."
    pdf_path = generate_incident_pdf({
        "id": inc.id,
        "title": inc.title,
        "severity": inc.severity,
        "mitre_techniques": inc.mitre_techniques,
        "content_md": content
    }, lang=lang)

    return FileResponse(
        path=pdf_path,
        filename=f"sentinelmesh_incident_{incident_id}_{lang}.pdf",
        media_type="application/pdf"
    )
