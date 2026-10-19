#!/usr/bin/env python3
"""
SentinelMesh Attack Scenario 2: Web SQLi to Web Shell Persistence
MITRE ATT&CK: T1190 (Exploit Public-Facing App), T1505.003 (Web Shell)
"""
import argparse
import httpx

def main():
    parser = argparse.ArgumentParser(description="Simulate SQLi to Web Shell Attack Sequence")
    parser.add_argument("--target", default="http://127.0.0.1:8080", help="SentinelMesh Base URL")
    parser.add_argument("--attacker-ip", default="194.26.29.112", help="Simulated adversary IP")
    args = parser.parse_args()

    print(f"\n[!] Initiating Web Application Exploit Simulation...")
    print(f"[*] Scenario: SQL Injection probing -> Web Shell upload -> Interactive OS commands")

    url = f"{args.target.rstrip('/')}/api/v1/simulator/run"
    params = {"scenario": "sqli_webshell", "attacker_ip": args.attacker_ip}

    try:
        with httpx.Client(timeout=30.0) as client:
            resp = client.post(url, params=params)
            print(f"[+] Response ({resp.status_code}): {resp.json()}")
    except Exception as e:
        print(f"[-] Error: {e}")

if __name__ == "__main__":
    main()
