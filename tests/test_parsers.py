import pytest
from app.ingest.parsers import AuthLogParser, NginxLogParser, WindowsJsonParser

def test_auth_log_parser():
    parser = AuthLogParser()
    
    # Test Failed SSH
    line_fail = "Oct 19 00:30:10 corp-db-01 sshd[12801]: Failed password for invalid user admin from 194.26.29.112 port 41201 ssh2"
    res_fail = parser.parse_line(line_fail)
    assert res_fail is not None
    assert res_fail["event_type"] == "ssh_login_failed"
    assert res_fail["src_ip"] == "194.26.29.112"
    assert res_fail["user_name"] == "admin"

    # Test Accepted SSH
    line_ok = "Oct 19 00:30:35 corp-db-01 sshd[12806]: Accepted password for ubuntu from 194.26.29.112 port 41206 ssh2"
    res_ok = parser.parse_line(line_ok)
    assert res_ok is not None
    assert res_ok["event_type"] == "ssh_login_success"
    assert res_ok["user_name"] == "ubuntu"

    # Test Sudo
    line_sudo = "Oct 19 00:30:40 corp-db-01 sudo: ubuntu : TTY=pts/1 ; PWD=/home/ubuntu ; USER=root ; COMMAND=/bin/bash"
    res_sudo = parser.parse_line(line_sudo)
    assert res_sudo is not None
    assert res_sudo["event_type"] == "privilege_escalation_sudo"

def test_nginx_parser():
    parser = NginxLogParser()

    # Test SQLi detection
    line_sqli = '194.26.29.112 - - [19/Oct/2026:00:32:01 +0000] "GET /api/products?id=1\' UNION SELECT username,password_hash FROM users-- HTTP/1.1" 500 1204 "https://portal.company.com" "sqlmap/1.7#dev"'
    res_sqli = parser.parse_line(line_sqli)
    assert res_sqli is not None
    assert res_sqli["event_type"] == "sqli_attempt"
    assert res_sqli["src_ip"] == "194.26.29.112"

    # Test Webshell detection
    line_shell = '194.26.29.112 - - [19/Oct/2026:00:32:25 +0000] "GET /uploads/cmd.php?cmd=whoami HTTP/1.1" 200 840 "-" "Mozilla/5.0"'
    res_shell = parser.parse_line(line_shell)
    assert res_shell is not None
    assert res_shell["event_type"] == "webshell_activity"

def test_windows_parser():
    parser = WindowsJsonParser()

    event_4688 = {
        "EventID": 4688,
        "Computer": "workstation-eng-04",
        "EventData": {
            "TargetUserName": "saim.ali",
            "NewProcessName": "C:\\Windows\\System32\\powershell.exe -enc AAAA"
        }
    }
    res_win = parser.parse_event(event_4688)
    assert res_win is not None
    assert res_win["event_type"] == "win_suspicious_process_spawn"
    assert res_win["user_name"] == "saim.ali"
