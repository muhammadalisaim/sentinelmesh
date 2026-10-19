import os
from typing import Dict, Any
from app.core.llm_client import llm_client

class ReporterAgent:
    def __init__(self):
        prompt_path = os.path.join(os.path.dirname(__file__), "prompts", "reporter.txt")
        with open(prompt_path, "r") as f:
            self.system_prompt = f.read()

    async def run(self, incident_details: Dict[str, Any]) -> Dict[str, Any]:
        user_prompt = f"""Generate dual-language (English and Urdu) executive and technical reports for this incident:
Incident Context:
- Title: {incident_details.get('title')}
- Severity: {incident_details.get('severity')}
- MITRE Techniques: {incident_details.get('mitre_techniques')}
- Timeline: {incident_details.get('timeline')}
- Containment Actions: {incident_details.get('actions')}

Provide complete Markdown reports in report_en and report_ur. Output strict JSON."""

        res, tokens_in, tokens_out, latency_ms = await llm_client.call_llm(
            system_prompt=self.system_prompt,
            user_prompt=user_prompt,
            agent_name="reporter"
        )
        return {
            "output": res,
            "tokens_in": tokens_in,
            "tokens_out": tokens_out,
            "latency_ms": latency_ms,
            "agent_name": "reporter"
        }

reporter_agent = ReporterAgent()
