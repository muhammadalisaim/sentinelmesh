from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.core.logging import setup_logging, logger
from app.db.session import init_db
from app.rag.load_mitre import load_mitre_data
from app.api import (
    auth, logs, alerts, incidents, actions, reports, metrics, stream, simulator
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup:
    setup_logging()
    logger.info("Initializing SentinelMesh Database...")
    init_db()
    logger.info("Loading MITRE ATT&CK RAG techniques...")
    load_mitre_data()
    logger.info(f"SentinelMesh v{settings.VERSION} online. Acceleration: {settings.AMD_GPU_MODEL} with {settings.AMD_ROCM_VERSION}")
    yield
    # Shutdown
    logger.info("SentinelMesh shutting down...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Autonomous AI SOC on AMD GPU (ROCm + vLLM) - Multi-Agent Threat Detection, Investigation, Containment & Reporting",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(logs.router, prefix="/api/v1/logs", tags=["Log Ingestion"])
app.include_router(alerts.router, prefix="/api/v1/alerts", tags=["Alerts"])
app.include_router(incidents.router, prefix="/api/v1/incidents", tags=["Incidents"])
app.include_router(actions.router, prefix="/api/v1/actions", tags=["Response Actions"])
app.include_router(reports.router, prefix="/api/v1/reports", tags=["Reports"])
app.include_router(metrics.router, prefix="/api/v1/metrics", tags=["Benchmarks"])
app.include_router(simulator.router, prefix="/api/v1/simulator", tags=["Attack Simulator"])
app.include_router(stream.router, tags=["WebSocket Live Stream"])

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "gpu_accelerator": settings.AMD_GPU_MODEL,
        "rocm_version": settings.AMD_ROCM_VERSION
    }
