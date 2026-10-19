import asyncio
from datetime import datetime
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.db import crud, models
from app.agents.triage import triage_agent
from app.agents.investigator import investigator_agent
from app.agents.threat_intel import threat_intel_agent
from app.agents.responder import responder_agent
from app.agents.reporter import reporter_agent
from app.reports.pdf_builder import generate_incident_pdf
from app.api.stream import manager

class AgentOrchestrator:
    """
    Coordinates multi-agent SOC pipeline:
    Triage -> Investigator -> Threat Intel -> Responder -> Human Gate -> Reporter
    """

    async def run_pipeline_for_alert(self, db: Session, alert_id: str) -> Optional[models.Incident]:
        alert = db.query(models.Alert).filter(models.Alert.id == alert_id).first()
        if not alert:
            return None

        # Fetch linked log events
        events = db.query(models.LogEvent).filter(models.LogEvent.id.in_(alert.event_ids)).all()
        events_dicts = [
            {
                "id": e.id,
                "ts": str(e.ts),
                "host": e.host,
                "source": e.source,
                "user_name": e.user_name,
                "src_ip": e.src_ip,
                "dst_ip": e.dst_ip,
                "event_type": e.event_type,
                "raw": e.raw,
                "normalized_json": e.normalized_json
            }
            for e in events
        ]

        # 1. Create or Find Incident
        incident = crud.create_incident(
            db=db,
            title=alert.title or f"Security Alert: {alert.rule_id}",
            alert_ids=[alert.id],
            severity=alert.severity
        )
        
        # Start Agent Run Record
        agent_run = crud.create_agent_run(
            db=db,
            incident_id=incident.id,
            model="meta-llama/Llama-3.1-8B-Instruct (AMD ROCm)"
        )

        total_tokens = 0
        total_latency = 0.0

        # Broadcast pipeline start
        await manager.broadcast({
            "type": "pipeline_started",
            "incident_id": incident.id,
            "title": incident.title,
            "timestamp": datetime.utcnow().isoformat()
        })

        # --- STEP 1: TRIAGE AGENT ---
        await self._broadcast_step_start("triage", "Analyzing event batch and evaluating noise threshold...")
        triage_res = await triage_agent.run(alert_id=alert.id, events=events_dicts)
        triage_out = triage_res["output"]
        
        crud.create_agent_step(
            db=db,
            run_id=agent_run.id,
            agent_name="triage",
            prompt=f"Alert: {alert.id}",
            output_json=triage_out,
            tokens_in=triage_res["tokens_in"],
            tokens_out=triage_res["tokens_out"],
            latency_ms=triage_res["latency_ms"]
        )
        total_tokens += (triage_res["tokens_in"] + triage_res["tokens_out"])
        total_latency += triage_res["latency_ms"]

        await self._broadcast_step_complete("triage", triage_out)

        # Update alert severity / noise status
        alert.severity = triage_out.get("severity", alert.severity)
        alert.confidence = triage_out.get("confidence", alert.confidence)
        alert.is_noise = triage_out.get("is_noise", False)
        alert.status = "closed" if alert.is_noise else "open"
        db.commit()

        if alert.is_noise:
            incident.status = "closed"
            incident.title = f"[DISMISSED NOISE] {incident.title}"
            db.commit()
            await manager.broadcast({
                "type": "pipeline_dismissed_noise",
                "incident_id": incident.id,
                "reason": triage_out.get("reason")
            })
            crud.finish_agent_run(db, agent_run.id, total_tokens, total_latency)
            return incident

        # --- STEP 2: INVESTIGATOR AGENT ---
        await self._broadcast_step_start("investigator", "Querying logs, reconstructing kill chain and retrieving MITRE ATT&CK techniques via RAG...")
        inv_res = await investigator_agent.run(
            incident_id=incident.id,
            events=events_dicts,
            triage_summary=triage_out.get("reason", "")
        )
        inv_out = inv_res["output"]

        crud.create_agent_step(
            db=db,
            run_id=agent_run.id,
            agent_name="investigator",
            prompt=f"Incident: {incident.id}",
            output_json=inv_out,
            tokens_in=inv_res["tokens_in"],
            tokens_out=inv_res["tokens_out"],
            latency_ms=inv_res["latency_ms"]
        )
        total_tokens += (inv_res["tokens_in"] + inv_res["tokens_out"])
        total_latency += inv_res["latency_ms"]

        # Update incident with timeline & MITRE
        incident.mitre_techniques = inv_out.get("mitre_techniques", [])
        incident.timeline_json = inv_out.get("attack_timeline", [])
        db.commit()

        await self._broadcast_step_complete("investigator", inv_out)

        # --- STEP 3: THREAT INTEL AGENT ---
        await self._broadcast_step_start("threat_intel", "Correlating extracted indicators against threat feeds and threat actor profiles...")
        # Extract unique IPs
        iocs = []
        for e in events_dicts:
            if e.get("src_ip") and e["src_ip"] not in ["127.0.0.1", "localhost", "0.0.0.0"]:
                iocs.append({"type": "ip", "value": e["src_ip"]})
        
        intel_res = await threat_intel_agent.run(
            iocs=iocs,
            attack_summary=inv_out.get("summary", "")
        )
        intel_out = intel_res["output"]

        crud.create_agent_step(
            db=db,
            run_id=agent_run.id,
            agent_name="threat_intel",
            prompt=f"IOCs: {len(iocs)}",
            output_json=intel_out,
            tokens_in=intel_res["tokens_in"],
            tokens_out=intel_res["tokens_out"],
            latency_ms=intel_res["latency_ms"]
        )
        total_tokens += (intel_res["tokens_in"] + intel_res["tokens_out"])
        total_latency += intel_res["latency_ms"]

        await self._broadcast_step_complete("threat_intel", intel_out)

        # --- STEP 4: RESPONDER AGENT ---
        await self._broadcast_step_start("responder", "Synthesizing remediation plan and cataloging proposed containment actions...")
        resp_res = await responder_agent.run(
            investigation_summary=inv_out.get("summary", ""),
            intel_summary=str(intel_out),
            affected_assets=inv_out.get("affected_assets", [])
        )
        resp_out = resp_res["output"]

        crud.create_agent_step(
            db=db,
            run_id=agent_run.id,
            agent_name="responder",
            prompt=f"Incident: {incident.id}",
            output_json=resp_out,
            tokens_in=resp_res["tokens_in"],
            tokens_out=resp_res["tokens_out"],
            latency_ms=resp_res["latency_ms"]
        )
        total_tokens += (resp_res["tokens_in"] + resp_res["tokens_out"])
        total_latency += resp_res["latency_ms"]

        # Save proposed containment actions into response_actions table
        for action in resp_out.get("proposed_actions", []):
            crud.create_response_action(
                db=db,
                incident_id=incident.id,
                action_type=action.get("action_type", "block_ip"),
                target=action.get("target", "unknown"),
                risk_level=action.get("risk_level", "low"),
                rollback_info={"description": action.get("description"), "rollback": action.get("rollback_steps")}
            )

        incident.status = "action_required"
        db.commit()

        await self._broadcast_step_complete("responder", resp_out)

        # --- STEP 5: REPORTER AGENT ---
        await self._broadcast_step_start("reporter", "Drafting dual-language incident briefings in English and Urdu (Nastaliq RTL)...")
        rep_res = await reporter_agent.run(incident_details={
            "id": incident.id,
            "title": incident.title,
            "severity": incident.severity,
            "mitre_techniques": incident.mitre_techniques,
            "timeline": incident.timeline_json,
            "actions": resp_out.get("proposed_actions", [])
        })
        rep_out = rep_res["output"]

        crud.create_agent_step(
            db=db,
            run_id=agent_run.id,
            agent_name="reporter",
            prompt=f"Incident: {incident.id}",
            output_json=rep_out,
            tokens_in=rep_res["tokens_in"],
            tokens_out=rep_res["tokens_out"],
            latency_ms=rep_res["latency_ms"]
        )
        total_tokens += (rep_res["tokens_in"] + rep_res["tokens_out"])
        total_latency += rep_res["latency_ms"]

        # Generate English & Urdu PDFs
        pdf_en = generate_incident_pdf({
            "id": incident.id,
            "title": incident.title,
            "severity": incident.severity,
            "mitre_techniques": incident.mitre_techniques,
            "content_md": rep_out.get("report_en", "")
        }, lang="en")

        pdf_ur = generate_incident_pdf({
            "id": incident.id,
            "title": incident.title,
            "severity": incident.severity,
            "mitre_techniques": incident.mitre_techniques,
            "content_md": rep_out.get("report_ur", "")
        }, lang="ur")

        crud.create_report(db, incident.id, lang="en", content_md=rep_out.get("report_en", ""), pdf_path=pdf_en)
        crud.create_report(db, incident.id, lang="ur", content_md=rep_out.get("report_ur", ""), pdf_path=pdf_ur)

        crud.finish_agent_run(db, agent_run.id, total_tokens, total_latency)

        await self._broadcast_step_complete("reporter", rep_out)

        # Notify pipeline completion
        await manager.broadcast({
            "type": "pipeline_completed",
            "incident_id": incident.id,
            "status": incident.status,
            "total_tokens": total_tokens,
            "total_latency_ms": round(total_latency, 2),
            "timestamp": datetime.utcnow().isoformat()
        })

        return incident

    async def _broadcast_step_start(self, agent: str, message: str):
        await manager.broadcast({
            "type": "agent_thinking",
            "agent": agent,
            "status": "thinking",
            "message": message,
            "timestamp": datetime.utcnow().isoformat()
        })
        # Micro sleep so frontend animation feels natural
        await asyncio.sleep(0.05)

    async def _broadcast_step_complete(self, agent: str, output: Dict[str, Any]):
        await manager.broadcast({
            "type": "agent_complete",
            "agent": agent,
            "status": "completed",
            "output": output,
            "timestamp": datetime.utcnow().isoformat()
        })

orchestrator = AgentOrchestrator()
