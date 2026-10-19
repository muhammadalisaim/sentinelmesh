from datetime import datetime
from typing import Dict, Any, Optional
from app.ingest.parsers import AuthLogParser, NginxLogParser, WindowsJsonParser

class LogNormalizer:
    def __init__(self):
        self.auth_parser = AuthLogParser()
        self.nginx_parser = NginxLogParser()
        self.win_parser = WindowsJsonParser()

    def normalize(self, raw_input: Any, source_hint: Optional[str] = None) -> Dict[str, Any]:
        """
        Takes raw string or JSON log, identifies source format,
        and produces standard LogEvent dict.
        """
        raw_str = str(raw_input)
        
        # 1. Windows JSON check
        if source_hint == "windows_json" or (raw_str.strip().startswith("{") and "EventID" in raw_str):
            parsed = self.win_parser.parse_event(raw_input)
            if parsed:
                return self._finalize_event(parsed)

        # 2. Nginx access log check
        if source_hint == "nginx" or ("HTTP/" in raw_str and ('"GET ' in raw_str or '"POST ' in raw_str or '"PUT ' in raw_str)):
            parsed = self.nginx_parser.parse_line(raw_str)
            if parsed:
                return self._finalize_event(parsed)

        # 3. Auth.log check
        if source_hint == "auth_log" or ("sshd[" in raw_str or "sudo:" in raw_str or "Failed password" in raw_str):
            parsed = self.auth_parser.parse_line(raw_str)
            if parsed:
                return self._finalize_event(parsed)

        # 4. Fallback generic normalization
        return {
            "ts": datetime.utcnow(),
            "host": "generic-host",
            "source": source_hint or "generic",
            "user_name": "unknown",
            "src_ip": "127.0.0.1",
            "dst_ip": "127.0.0.1",
            "event_type": "generic_event",
            "raw": raw_str,
            "normalized_json": {"raw": raw_str}
        }

    def _finalize_event(self, parsed: Dict[str, Any]) -> Dict[str, Any]:
        if "ts" not in parsed:
            parsed["ts"] = datetime.utcnow()
        return parsed

normalizer = LogNormalizer()
