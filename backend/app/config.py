import os
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "SentinelMesh"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Environment
    ENV: str = os.getenv("ENV", "development")
    DEBUG: bool = os.getenv("DEBUG", "true").lower() == "true"
    
    # Security / Auth
    SECRET_KEY: str = os.getenv("SECRET_KEY", "sentinelmesh_super_secret_jwt_key_2026_amd_hackathon")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # Database (Postgres default with automatic SQLite fallback)
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "sqlite:///./sentinelmesh.db"
    )
    
    # Redis Queue & PubSub
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    USE_MEMORY_QUEUE_FALLBACK: bool = True
    
    # Qdrant Vector DB
    QDRANT_URL: str = os.getenv("QDRANT_URL", "http://localhost:6333")
    QDRANT_COLLECTION: str = "mitre_attack_techniques"
    USE_MEMORY_VECTOR_FALLBACK: bool = True
    
    # LLM Serving (AMD GPU ROCm + vLLM / OpenAI-compatible endpoint)
    VLLM_API_BASE: str = os.getenv("VLLM_API_BASE", "http://localhost:8001/v1")
    VLLM_API_KEY: str = os.getenv("VLLM_API_KEY", "EMPTY")
    MODEL_NAME: str = os.getenv("MODEL_NAME", "meta-llama/Llama-3.1-8B-Instruct")
    LLM_TIMEOUT: float = float(os.getenv("LLM_TIMEOUT", "60.0"))
    LLM_TEMPERATURE: float = 0.1
    USE_MOCK_LLM_FALLBACK: bool = True  # Allows live presentation demo if GPU vLLM is offline
    
    # AMD Hardware Telemetry Mock/Real values for dashboard
    AMD_GPU_MODEL: str = os.getenv("AMD_GPU_MODEL", "AMD Instinct MI250X (128GB HBM2e)")
    AMD_ROCM_VERSION: str = os.getenv("AMD_ROCM_VERSION", "ROCm 6.2")
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ]
    
    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
