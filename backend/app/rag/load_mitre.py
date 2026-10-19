from app.rag.qdrant_store import qdrant_store

MITRE_TECHNIQUES = [
    {
        "id": "T1110.001",
        "name": "Password Guessing (Brute Force)",
        "description": "Adversaries may attempt to brute force valid credentials by trying multiple common passwords against targeted user accounts via SSH, RDP or Web APIs.",
        "tactics": ["Credential Access"],
        "mitigations": ["Account lockout thresholds", "Multi-factor authentication (MFA)", "IP fail2ban rate limiting"]
    },
    {
        "id": "T1078.003",
        "name": "Valid Accounts: Local Accounts",
        "description": "Adversaries may obtain and abuse credentials of existing local administrator or system accounts to gain initial access, execute commands, and persist.",
        "tactics": ["Defense Evasion", "Persistence", "Privilege Escalation", "Initial Access"],
        "mitigations": ["Enforce strong password complexity", "Audit sudoers configurations", "Disable direct root SSH login"]
    },
    {
        "id": "T1190",
        "name": "Exploit Public-Facing Application (SQLi / RCE)",
        "description": "Adversaries may attempt to take advantage of a weakness in an Internet-facing computer or program, such as SQL injection in web portals, to execute malicious code.",
        "tactics": ["Initial Access"],
        "mitigations": ["Input parameterization and prepared statements", "Web Application Firewall (WAF) inspection", "Regular vulnerability patching"]
    },
    {
        "id": "T1505.003",
        "name": "Server Software Component: Web Shell",
        "description": "Adversaries may backdoor web servers by uploading a web shell (e.g., PHP, JSP script) to establish persistent access and execute arbitrary OS commands.",
        "tactics": ["Persistence"],
        "mitigations": ["Disable execution permissions in file upload folders", "File integrity monitoring (FIM)", "Network egress filtering"]
    },
    {
        "id": "T1566.001",
        "name": "Phishing: Spearphishing Attachment",
        "description": "Adversaries may send spearphishing emails with a malicious macro attachment to execute initial payloads and compromise enterprise endpoints.",
        "tactics": ["Initial Access"],
        "mitigations": ["Email attachment sandboxing", "Block malicious macro execution via GPO", "Security awareness training"]
    },
    {
        "id": "T1071.001",
        "name": "Application Layer Protocol: Web Protocols (C2 Beaconing)",
        "description": "Adversaries may communicate using application layer protocols (HTTP/HTTPS) to bypass network filtering and maintain active Command and Control (C2) beaconing.",
        "tactics": ["Command and Control"],
        "mitigations": ["Network intrusion detection systems (NIDS)", "Threat intelligence IOC blacklisting", "TLS inspection and domain reputation scoring"]
    },
    {
        "id": "T1021.004",
        "name": "Remote Services: SSH / Lateral Movement",
        "description": "Adversaries may use valid credentials or private keys to log into a remote service such as SSH to move laterally across enterprise networks.",
        "tactics": ["Lateral Movement"],
        "mitigations": ["Network microsegmentation", "Jump bastion access controls", "SSH key rotation policies"]
    }
]

def load_mitre_data():
    for tech in MITRE_TECHNIQUES:
        qdrant_store.insert_technique(
            technique_id=tech["id"],
            name=tech["name"],
            description=tech["description"],
            tactics=tech["tactics"],
            mitigations=tech["mitigations"]
        )
    print(f"[RAG] Successfully loaded {len(MITRE_TECHNIQUES)} MITRE ATT&CK techniques into vector store.")

if __name__ == "__main__":
    load_mitre_data()
