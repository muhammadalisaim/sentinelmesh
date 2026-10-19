from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db import crud, schemas, models
from app.deps import get_current_user
from app.core.security import create_access_token, get_password_hash
from app.config import settings

router = APIRouter()

@router.post("/login", response_model=schemas.Token)
def login(login_data: schemas.UserLogin, db: Session = Depends(get_db)):
    user = crud.authenticate_user(db, email=login_data.email, password=login_data.password)
    if not user:
        # Pre-seed default analyst or admin if DB was newly initialized
        if login_data.email in ["admin@sentinelmesh.ai", "analyst@sentinelmesh.ai"] and login_data.password in ["sentinel123", "admin123"]:
            role = "admin" if "admin" in login_data.email else "analyst"
            user = crud.create_user(db, email=login_data.email, password=login_data.password, role=role, full_name="SOC Officer")
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
            
    access_token = create_access_token(
        subject=user.email,
        role=user.role,
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    crud.create_audit_log(db, action="login", user_id=user.id, entity="user", entity_id=user.id)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": user.id,
        "role": user.role,
        "email": user.email
    }

@router.get("/me", response_model=schemas.UserResponse)
def get_me(user: models.User = Depends(get_current_user)):
    return user
