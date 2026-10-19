# SentinelMesh Deployment Guide

This guide covers deploying SentinelMesh on AMD ROCm Instinct GPUs, Docker Compose, or standalone development mode.

---

## 1. AMD ROCm & vLLM Setup

SentinelMesh is optimized for AMD Instinct MI210, MI250, MI250X, and MI300X accelerators.

### Step 1: Install ROCm 6.2
Ensure the official AMD ROCm driver stack is installed on Ubuntu 22.04 / 24.04:
```bash
sudo apt update
sudo apt install -y rocm-hip-sdk rocm-opencl-sdk
rocminfo | grep "Marketing Name"
```

### Step 2: Launch vLLM ROCm Server
Execute the included launch script:
```bash
bash infra/vllm/serve.sh meta-llama/Llama-3.1-8B-Instruct 32768 8001
```

---

## 2. Full Multi-Service Docker Deployment

Launch PostgreSQL, Redis, Qdrant, FastAPI backend, and Next.js frontend with a single command:
```bash
docker compose up -d
```
All containers will auto-initialize, perform healthchecks, and seed MITRE techniques.

---

## 3. Standalone Developer Mode (Zero-Dependency)

When running locally without Docker:
```bash
# Backend
cd backend
pip install -r requirements.txt
python3 -m uvicorn app.main:app --port 8000

# Frontend (in another shell)
cd frontend
npm run dev
```
SentinelMesh will automatically fallback to local SQLite, in-memory queues, and embedded semantic vector storage.
