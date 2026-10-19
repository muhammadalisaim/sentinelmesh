#!/usr/bin/env bash
set -e
echo "[*] Loading MITRE ATT&CK techniques into vector knowledge base..."
PYTHONPATH=backend python3 -m app.rag.load_mitre
