import os
from typing import Dict, Any, List
from app.core.llm_client import llm_client

class ResponderAgent:
    def __init__(self):
        prompt_path = os.path.join(os.path.dirname(__file__), "prompts", "responder.txt")
        with open(prompt_path, "r") as f:
            self.system_prompt = f.read()

    async def run(self, investigation_summary: str, intel_summary: str, affected_assets: List[str]) -> Dict[str, Any]:
        user_prompt = f"""Formulate containment and mitigation actions for the incident.
Investigation: {investigation_summary}
Threat Intelligence: {intel_summary}
Affected Assets: {', '.join(affected_assets)}

Select actions strictly from the catalog: block_ip, lock_user, isolate_host, rotate_key.
Specify rollback steps and risk level for every action. Output strict JSON."""

        res, tokens_in, tokens_out, latency_ms = await llm_client.call_llm(
            system_prompt=self.system_prompt,
            user_prompt=user_prompt,
            agent_name="responder"
        )
        return {
            "output": res,
            "tokens_in": tokens_in,
            "tokens_out": tokens_out,
            "latency_ms": latency_ms,
            "agent_name": "responder"
        }

responder_agent = ResponderAgent()
