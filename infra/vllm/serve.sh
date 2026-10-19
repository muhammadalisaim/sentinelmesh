#!/usr/bin/env bash
# ========================================================
# SentinelMesh: AMD ROCm vLLM High-Throughput Serving Script
# Target: AMD Instinct MI210 / MI250X / MI300
# ========================================================
set -euo pipefail

MODEL_ID="${1:-meta-llama/Llama-3.1-8B-Instruct}"
MAX_MODEL_LEN="${2:-32768}"
PORT="${3:-8001}"

echo "[*] Initializing vLLM on AMD ROCm Architecture..."
echo "[*] Selected Model: ${MODEL_ID}"
echo "[*] Context Window: ${MAX_MODEL_LEN} tokens"
echo "[*] ROCm Acceleration Port: ${PORT}"

# Export ROCm flags for optimal matrix multiplication performance
export HIP_VISIBLE_DEVICES=0
export VLLM_ENGINE_ITERATION_TIMEOUT_S=120
export PYTORCH_ROCM_ALLOC_CONF=garbage_collection_threshold:0.8,max_split_size_mb:128

exec python3 -m vllm.entrypoints.openai.api_server \
    --model "${MODEL_ID}" \
    --port "${PORT}" \
    --host "0.0.0.0" \
    --max-model-len "${MAX_MODEL_LEN}" \
    --trust-remote-code \
    --enforce-eager
