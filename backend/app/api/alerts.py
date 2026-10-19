from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db import crud, schemas

router = APIRouter()

@router.get("", response_model=List[schemas.AlertResponse])
def get_alerts(
    status: Optional[str] = Query(None),
    severity: Optional[str] = Query(None),
    hide_noise: bool = Query(False),
    db: Session = Depends(get_db)
):
    return crud.get_alerts(db, status=status, severity=severity, hide_noise=hide_noise)
