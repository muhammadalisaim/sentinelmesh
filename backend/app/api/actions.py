from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db import crud, schemas
from app.agents.tools import ActionCatalog
from app.api.stream import manager

router = APIRouter()

@router.post("/{action_id}/approve", response_model=schemas.ResponseActionResponse)
async def approve_action(action_id: str, db: Session = Depends(get_db)):
    action = crud.get_action_by_id(db, action_id)
    if not action:
        raise HTTPException(status_code=404, detail="Action not found")
    
    # Execute action via authorized ActionCatalog
    result = ActionCatalog.execute(action.action_type, action.target)
    
    # Update DB status
    updated = crud.update_action_status(db, action_id, status="executed", approved_by="analyst@sentinelmesh.ai")
    
    # Audit log
    crud.create_audit_log(
        db,
        action="approve_containment_action",
        entity="response_action",
        entity_id=action_id,
        details={"result": result, "action_type": action.action_type, "target": action.target}
    )

    # Check if all actions in incident are resolved
    inc = crud.get_incident_by_id(db, action.incident_id)
    if inc and all(a.status in ["executed", "rejected"] for a in inc.actions):
        inc.status = "contained"
        db.commit()

    # Broadcast live event
    await manager.broadcast({
        "type": "action_updated",
        "action_id": action_id,
        "incident_id": action.incident_id,
        "status": "executed",
        "result": result
    })

    return updated

@router.post("/{action_id}/reject", response_model=schemas.ResponseActionResponse)
async def reject_action(action_id: str, db: Session = Depends(get_db)):
    action = crud.get_action_by_id(db, action_id)
    if not action:
        raise HTTPException(status_code=404, detail="Action not found")
    
    updated = crud.update_action_status(db, action_id, status="rejected", approved_by="analyst@sentinelmesh.ai")
    
    crud.create_audit_log(
        db,
        action="reject_containment_action",
        entity="response_action",
        entity_id=action_id,
        details={"reason": "Rejected by security analyst"}
    )

    await manager.broadcast({
        "type": "action_updated",
        "action_id": action_id,
        "incident_id": action.incident_id,
        "status": "rejected"
    })

    return updated
