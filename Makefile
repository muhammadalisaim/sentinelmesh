.PHONY: help setup run-backend run-frontend simulate-ssh simulate-sqli test benchmark

help:
	@echo "SentinelMesh - Autonomous AI SOC on AMD GPU"
	@echo "Available commands:"
	@echo "  make setup        - Install backend & frontend dependencies"
	@echo "  make run-backend  - Start FastAPI backend server on port 8000"
	@echo "  make run-frontend - Start Next.js frontend on port 3000"
	@echo "  make simulate-ssh - Execute SSH brute-force attack scenario"
	@echo "  make simulate-sqli- Execute SQLi to web shell attack scenario"
	@echo "  make test         - Run pytest unit tests"

setup:
	cd backend && pip install -r requirements.txt
	cd frontend && npm install

run-backend:
	cd backend && PYTHONPATH=. uvicorn app.main:app --reload --port 8000

run-frontend:
	cd frontend && npm run dev

simulate-ssh:
	python3 simulator/attack_ssh_bruteforce.py --target http://localhost:8000

simulate-sqli:
	python3 simulator/attack_sqli_webshell.py --target http://localhost:8000

test:
	PYTHONPATH=backend python3 -m pytest tests/ -v
