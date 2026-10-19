import os
from typing import Dict, Any, List
from app.core.llm_client import llm_client
from app.agents.tools import search_mitre_techniques

class InvestigatorAgent:
    def __init__(self):
        prompt_path = os.path.join(os.path.dirname(__file__), "prompts", "investigator.txt")
        with open(prompt_path, "r") as f:
            self.system_prompt = f.read()

    async def run(self, incident_id: str, events: List[Dict[str, Any]], triage_summary: str) -> Dict[str, Any]:
        log_sample = "\n".join([f"[{e.get('ts')}] {e.get('event_type')}: {e.get('raw')}" for e in events[:15]])
        
        # Retrieve relevant MITRE ATT&CK techniques via RAG
        mitre_context = search_mitre_techniques(triage_summary, top_k=2)
        mitre_text = "\n".join([f"- {m['technique_id']} {m['name']}: {m['description']}" for m in mitre_context])

        user_prompt = f"""Investigate incident {incident_id}.
Triage context: {triage_summary}

Relevant MITRE ATT&CK RAG Context:
{mitre_text}

Raw log telemetry:
<log_data>
{log_sample}
</log_data>

Reconstruct chronological attack timeline, identify targeted assets and users, and map MITRE technique IDs. Output strict JSON."""

        res, tokens_in, tokens_out, latency_ms = await llm_client.call_llm(
            system_prompt=self.system_prompt,
            user_prompt=user_prompt,
            agent_name="investigator"
        )
        return {
            "output": res,
            "tokens_in": tokens_in,
            "tokens_out": tokens_out,
            "latency_ms": latency_ms,
            "agent_name": "investigator"
        }

investigator_agent = InvestigatorAgent()
