import re
import urllib.parse
from typing import Dict, Any, Optional

class NginxLogParser:
    """
    Parses Nginx combined log format with robust request URI extraction:
    $remote_addr - $remote_user [$time_local] "$request" $status $body_bytes_sent "$http_referer" "$http_user_agent"
    """
    COMBINED_PATTERN = re.compile(
        r'(?P<src_ip>[\d\.]+)\s+-\s+(?P<user>\S+)\s+\[(?P<time>[^\]]+)\]\s+"(?P<method>\S+)\s+(?P<url>.+?)\s+(?P<protocol>HTTP/[0-9\.]+)"\s+(?P<status>\d+)\s+(?P<bytes>\d+)\s+"(?P<referer>[^"]*)"\s+"(?P<user_agent>[^"]*)"'
    )

    SQLI_PATTERNS = [
        r"(?i)union\s+select",
        r"(?i)'\s*or\s*'1'\s*=\s*'1",
        r"(?i)--",
        r"(?i)benchmark\s*\(",
        r"(?i)waitfor\s+delay",
        r"(?i)information_schema"
    ]

    WEBSHELL_PATTERNS = [
        r"(?i)(?:shell|cmd|c99|r57|wso|b374k|root)\.(?:php|asp|aspx|jsp)",
        r"(?i)\.php\?(?:cmd|exec|system|passthru)=",
        r"(?i)/uploads/.*\.(?:php|phtml|sh)"
    ]

    def parse_line(self, line: str) -> Optional[Dict[str, Any]]:
        line = line.strip()
        if not line:
            return None

        m = self.COMBINED_PATTERN.search(line)
        if not m:
            # Fallback simple pattern for non-standard access lines
            src_ip = line.split()[0] if line.split() else "127.0.0.1"
            url = line
            method = "GET"
            status_code = 200
            user_agent = "-"
            user = "anonymous"
        else:
            src_ip = m.group("src_ip")
            method = m.group("method")
            url = m.group("url")
            status_code = int(m.group("status"))
            user_agent = m.group("user_agent")
            user = m.group("user") if m.group("user") != "-" else "anonymous"

        # Decode URL for threat pattern detection (e.g. %20 -> space)
        decoded_url = urllib.parse.unquote(url)

        event_type = "web_access"
        threat_detected = None

        # Detect SQL Injection
        for pat in self.SQLI_PATTERNS:
            if re.search(pat, decoded_url):
                event_type = "sqli_attempt"
                threat_detected = "SQL Injection Payload in URI"
                break

        # Detect Web Shell access / upload
        if not threat_detected:
            for pat in self.WEBSHELL_PATTERNS:
                if re.search(pat, decoded_url):
                    event_type = "webshell_activity"
                    threat_detected = "Web Shell Access / Execution"
                    break

        return {
            "source": "nginx",
            "event_type": event_type,
            "host": "web-srv-01",
            "user_name": user,
            "src_ip": src_ip,
            "dst_ip": "10.0.0.10",
            "raw": line,
            "normalized_json": {
                "method": method,
                "url": url,
                "status_code": status_code,
                "user_agent": user_agent,
                "threat_flag": threat_detected
            }
        }
