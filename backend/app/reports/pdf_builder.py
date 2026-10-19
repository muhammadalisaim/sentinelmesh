import os
import weasyprint
from typing import Dict, Any, Optional

REPORTS_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "reports_generated")
os.makedirs(REPORTS_DIR, exist_ok=True)

def generate_incident_pdf(incident_data: Dict[str, Any], lang: str = "en") -> str:
    """
    Generates a high-quality professional PDF report using WeasyPrint.
    Supports English LTR and Urdu RTL.
    """
    incident_id = incident_data.get("id", "INC-000")
    title = incident_data.get("title", "Security Incident")
    severity = incident_data.get("severity", "HIGH").upper()
    techniques = ", ".join(incident_data.get("mitre_techniques", []))
    content_md = incident_data.get("content_md", "")
    created_at = incident_data.get("created_at", "2026-10-19")
    
    # Severity badge color
    sev_color = "#dc2626" if severity in ["HIGH", "CRITICAL"] else "#f59e0b"
    
    is_urdu = lang == "ur"
    direction = "rtl" if is_urdu else "ltr"
    align = "right" if is_urdu else "left"
    lang_attr = "ur" if is_urdu else "en"
    
    html_content = f"""<!DOCTYPE html>
<html lang="{lang_attr}" dir="{direction}">
<head>
<meta charset="utf-8">
<style>
    @page {{
        size: A4;
        margin: 20mm;
        @bottom-right {{
            content: "Page " counter(page) " of " counter(pages);
            font-size: 9pt;
            color: #64748b;
        }}
    }}
    body {{
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Nastaliq Urdu", sans-serif;
        direction: {direction};
        text-align: {align};
        color: #0f172a;
        line-height: 1.6;
        margin: 0;
        padding: 0;
    }}
    .header {{
        border-bottom: 2px solid #0284c7;
        padding-bottom: 12px;
        margin-bottom: 24px;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }}
    .brand {{
        font-size: 24pt;
        font-weight: 800;
        color: #0369a1;
        letter-spacing: -0.5px;
    }}
    .badge {{
        background: {sev_color};
        color: white;
        padding: 6px 14px;
        border-radius: 6px;
        font-weight: bold;
        font-size: 11pt;
        display: inline-block;
    }}
    .meta-box {{
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 24px;
    }}
    .meta-item {{
        margin-bottom: 6px;
        font-size: 10.5pt;
    }}
    .meta-label {{
        font-weight: bold;
        color: #475569;
    }}
    h1 {{
        font-size: 18pt;
        color: #0f172a;
        margin-top: 0;
    }}
    h2 {{
        font-size: 14pt;
        color: #1e293b;
        border-bottom: 1px solid #e2e8f0;
        padding-bottom: 4px;
        margin-top: 20px;
    }}
    .content-area {{
        font-size: 11pt;
        white-space: pre-wrap;
    }}
    .footer-note {{
        margin-top: 40px;
        padding-top: 12px;
        border-top: 1px solid #e2e8f0;
        font-size: 9pt;
        color: #94a3b8;
        text-align: center;
    }}
</style>
</head>
<body>
    <div class="header">
        <div class="brand">SentinelMesh</div>
        <div class="badge">SEVERITY: {severity}</div>
    </div>

    <h1>{title}</h1>

    <div class="meta-box">
        <div class="meta-item"><span class="meta-label">Incident ID:</span> {incident_id}</div>
        <div class="meta-item"><span class="meta-label">Generated Timestamp:</span> {created_at}</div>
        <div class="meta-item"><span class="meta-label">Target MITRE ATT&CK:</span> {techniques or "N/A"}</div>
        <div class="meta-item"><span class="meta-label">Acceleration Engine:</span> AMD ROCm (vLLM Open LLM Pipeline)</div>
    </div>

    <h2>Executive & Technical Briefing ({'Urdu' if is_urdu else 'English'})</h2>
    <div class="content-area">{content_md}</div>

    <div class="footer-note">
        SentinelMesh Autonomous AI SOC • AMD Developer Hackathon: ACT III • Self-Hosted On-Premise Security Intelligence
    </div>
</body>
</html>"""

    filename = f"report_{incident_id}_{lang}.pdf"
    output_path = os.path.join(REPORTS_DIR, filename)
    weasyprint.HTML(string=html_content).write_pdf(output_path)
    return output_path
