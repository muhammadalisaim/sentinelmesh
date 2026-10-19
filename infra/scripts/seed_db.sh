#!/usr/bin/env bash
set -e
echo "[*] Seeding SentinelMesh database with initial IOCs and users..."
python3 -c "
from app.db.session import SessionLocal, init_db
from app.db import crud
db = SessionLocal()
init_db()
crud.create_user(db, 'analyst@sentinelmesh.ai', 'sentinel123', role='analyst', full_name='SOC Analyst')
crud.create_user(db, 'admin@sentinelmesh.ai', 'admin123', role='admin', full_name='SOC Administrator')
print('Database seeded with demo analyst & admin credentials.')
db.close()
"
