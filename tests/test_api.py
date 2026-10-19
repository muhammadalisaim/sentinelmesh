import pytest
from fastapi.testclient import TestClient
from app.main import app

@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c

def test_health_check(client):
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["status"] == "healthy"

def test_benchmark_metrics(client):
    res = client.get("/api/v1/metrics/benchmark")
    assert res.status_code == 200
    data = res.json()
    assert "tokens_per_second" in data
    assert "cost_savings_percent" in data

def test_simulator_and_alerts(client):
    res = client.post("/api/v1/simulator/run?scenario=ssh_bruteforce")
    assert res.status_code == 200
    assert res.json()["status"] == "launched"

    alerts_res = client.get("/api/v1/alerts")
    assert alerts_res.status_code == 200
    assert isinstance(alerts_res.json(), list)
