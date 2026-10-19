import re
from datetime import datetime
from typing import Dict, Any, Optional

class AuthLogParser:
    """
    Parses standard Linux /var/log/auth.log lines:
    - Failed password for invalid user ... from ... port ... ssh2
    - Accepted password for ... from ... port ... ssh2
    - sudo: ... COMMAND=...
    - session opened for user root
    """
    
    # Regex patterns
    SSH_FAILED = re.compile(r"(?P<month>\w+)\s+(?P<day>\d+)\s+(?P<time>[\d:]+)\s+(?P<host>[\w\.\-]+)\s+sshd\[\d+\]:\s+Failed password for (?:invalid user\s+)?(?P<user>[\w\.\-]+)\s+from\s+(?P<src_ip>[\d\.]+)\s+port\s+(?P<port>\d+)")
    SSH_ACCEPTED = re.compile(r"(?P<month>\w+)\s+(?P<day>\d+)\s+(?P<time>[\d:]+)\s+(?P<host>[\w\.\-]+)\s+sshd\[\d+\]:\s+Accepted password for (?P<user>[\w\.\-]+)\s+from\s+(?P<src_ip>[\d\.]+)\s+port\s+(?P<port>\d+)")
    SUDO_EXEC = re.compile(r"(?P<month>\w+)\s+(?P<day>\d+)\s+(?P<time>[\d:]+)\s+(?P<host>[\w\.\-]+)\s+sudo:\s+(?P<user>[\w\.\-]+)\s*:\s+TTY=\S+\s*;\s*PWD=\S+\s*;\s*USER=(?P<target_user>\S+)\s*;\s*COMMAND=(?P<command>.*)")

    def parse_line(self, line: str) -> Optional[Dict[str, Any]]:
        line = line.strip()
        if not line:
            return None

        # Check Failed SSH
        m = self.SSH_FAILED.search(line)
        if m:
            return {
                "source": "auth_log",
                "event_type": "ssh_login_failed",
                "host": m.group("host"),
                "user_name": m.group("user"),
                "src_ip": m.group("src_ip"),
                "dst_ip": "127.0.0.1",
                "raw": line,
                "normalized_json": {
                    "port": int(m.group("port")),
                    "action": "authentication_failure",
                    "protocol": "ssh"
                }
            }

        # Check Accepted SSH
        m = self.SSH_ACCEPTED.search(line)
        if m:
            return {
                "source": "auth_log",
                "event_type": "ssh_login_success",
                "host": m.group("host"),
                "user_name": m.group("user"),
                "src_ip": m.group("src_ip"),
                "dst_ip": "127.0.0.1",
                "raw": line,
                "normalized_json": {
                    "port": int(m.group("port")),
                    "action": "authentication_success",
                    "protocol": "ssh"
                }
            }

        # Check Sudo Escalation
        m = self.SUDO_EXEC.search(line)
        if m:
            return {
                "source": "auth_log",
                "event_type": "privilege_escalation_sudo",
                "host": m.group("host"),
                "user_name": m.group("user"),
                "src_ip": "127.0.0.1",
                "dst_ip": "127.0.0.1",
                "raw": line,
                "normalized_json": {
                    "target_user": m.group("target_user"),
                    "command": m.group("command"),
                    "action": "privilege_escalation"
                }
            }

        # Generic auth line fallback
        return {
            "source": "auth_log",
            "event_type": "auth_generic",
            "host": "localhost",
            "user_name": "system",
            "src_ip": "127.0.0.1",
            "dst_ip": "127.0.0.1",
            "raw": line,
            "normalized_json": {"message": line}
        }
