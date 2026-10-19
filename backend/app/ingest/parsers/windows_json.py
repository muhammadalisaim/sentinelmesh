import json
from typing import Dict, Any, Optional

class WindowsJsonParser:
    """
    Parses Windows Security and Sysmon Event logs in JSON format:
    - EventID 4625: An account failed to log on
    - EventID 4624: An account was successfully logged on
    - EventID 4688: A new process has been created (Process Creation)
    - EventID 4672: Special privileges assigned to new logon
    - Sysmon EventID 3: Network connection detected (C2 beaconing)
    """

    def parse_event(self, event_data: Any) -> Optional[Dict[str, Any]]:
        if isinstance(event_data, str):
            try:
                data = json.loads(event_data)
            except Exception:
                return {
                    "source": "windows_json",
                    "event_type": "windows_generic",
                    "host": "win-host-01",
                    "user_name": "SYSTEM",
                    "src_ip": "127.0.0.1",
                    "dst_ip": "127.0.0.1",
                    "raw": str(event_data),
                    "normalized_json": {"raw": event_data}
                }
        else:
            data = event_data

        event_id = str(data.get("EventID") or data.get("event_id") or "0")
        computer = data.get("Computer") or data.get("host") or "win-dc-01"
        event_data_fields = data.get("EventData", {}) or data

        user = event_data_fields.get("TargetUserName") or event_data_fields.get("user") or "SYSTEM"
        src_ip = event_data_fields.get("IpAddress") or event_data_fields.get("src_ip") or "127.0.0.1"
        dst_ip = event_data_fields.get("DestinationIp") or event_data_fields.get("dst_ip") or "127.0.0.1"
        process = event_data_fields.get("NewProcessName") or event_data_fields.get("CommandLine") or ""

        event_type = "windows_generic"
        if event_id == "4625":
            event_type = "win_logon_failed"
        elif event_id == "4624":
            event_type = "win_logon_success"
        elif event_id == "4672":
            event_type = "win_privilege_assigned"
        elif event_id == "4688":
            if "powershell" in process.lower() or "cmd.exe" in process.lower():
                event_type = "win_suspicious_process_spawn"
            else:
                event_type = "win_process_created"
        elif event_id == "3" or "beacon" in str(data).lower():
            event_type = "win_c2_beacon_network"

        return {
            "source": "windows_json",
            "event_type": event_type,
            "host": computer,
            "user_name": user,
            "src_ip": src_ip,
            "dst_ip": dst_ip,
            "raw": json.dumps(data),
            "normalized_json": {
                "event_id": event_id,
                "process_name": process,
                "logon_type": event_data_fields.get("LogonType"),
                "details": event_data_fields
            }
        }
