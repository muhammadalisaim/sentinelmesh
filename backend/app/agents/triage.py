import os
from typing import Dict, Any, List
from app.core.llm_client import llm_client
from app.agents.schemas import TriageOutput

class TriageAgent:
    def __init__(self):
        prompt_path = os.path.join(os.path.dirname(__file__), "prompts", "triage.txt")
        with open(prompt_path, "r") as f:
            self.system_prompt = f.read()

    async def run(self, alert_id: str, events: List[Dict[str, Any]]) -> Dict[str, Any]:
        log_sample = "\n".join([f"[{e.get('source')}] {e.get('raw')}" for e in events[:10]])
        user_prompt = f"""Evaluate incoming alert {alert_id} based on the following security events:
<log_data>
{log_sample}
</log_data>

Determine if this is real threat or noise, calculate confidence, assign severity, and explain why. Output strict JSON."""

        res, tokens_in, tokens_out, latency_ms = await llm_client.call_llm(
            system_prompt=self.system_prompt,
            user_prompt=user_prompt,
            agent_name="triage"
        )
        return {
            "output": res,
            "tokens_in": tokens_in,
            "tokens_out": tokens_out,
            "latency_ms": latency_ms,
            "agent_name": "triage"
        }

triage_agent = TriageAgent()
