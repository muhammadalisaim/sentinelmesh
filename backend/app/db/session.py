import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.config import settings
from app.db.models import Base

# Format database URL properly
db_url = settings.DATABASE_URL

# Handle sqlite relative paths and thread check
connect_args = {}
if db_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

try:
    engine = create_engine(db_url, connect_args=connect_args, pool_pre_ping=True)
except Exception as e:
    # Fallback to local SQLite if PostgreSQL fails to connect
    fallback_url = "sqlite:///./sentinelmesh.db"
    print(f"[DB Warning] Could not connect to {db_url}: {e}. Falling back to {fallback_url}")
    engine = create_engine(fallback_url, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """Create all tables in the database"""
    Base.metadata.create_all(bind=engine)
