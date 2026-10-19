import os
from typing import Dict, Any, List
from app.core.llm_client import llm_client

class ThreatIntelAgent:
    def __init__(self):
        prompt_path = os.path.join(os.path.dirname(__file__), "prompts", "threat_intel.txt")
        with open(prompt_path, "r") as f:
            self.system_prompt = f.read()

    async def run(self, iocs: List[Dict[str, str]], attack_summary: str) -> Dict[str, Any]:
        ioc_str = "\n".join([f"- {item.get('type')}: {item.get('value')}" for item in iocs]) or "No explicit external IOCs"
        user_prompt = f"""Analyze the threat profile and reputation of extracted indicators:
IOCs:
{ioc_str}

Attack Summary:
{attack_summary}

Assess threat level, confidence, and adversary tactics. Output strict JSON."""

        res, tokens_in, tokens_out, latency_ms = await llm_client.call_llm(
            system_prompt=self.system_prompt,
            user_prompt=user_prompt,
            agent_name="threat_intel"
        )
        return {
            "output": res,
            "tokens_in": tokens_in,
            "tokens_out": tokens_out,
            "latency_ms": latency_ms,
            "agent_name": "threat_intel"
        }

threat_intel_agent = ThreatIntelAgent()
