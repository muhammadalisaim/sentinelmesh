#!/usr/bin/env python3
"""
SentinelMesh Attack Scenario 3: Spearphishing Macro to C2 Beaconing
MITRE ATT&CK: T1566 (Phishing), T1071 (C2 over Web Protocols)
"""
import argparse
import httpx

def main():
    parser = argparse.ArgumentParser(description="Simulate Spearphishing to C2 Beaconing")
    parser.add_argument("--target", default="http://127.0.0.1:8080", help="SentinelMesh Base URL")
    args = parser.parse_args()

    print(f"\n[!] Initiating Endpoint Compromise Simulation...")
    print(f"[*] Scenario: Phishing email -> Macro execution -> PowerShell process -> Outbound HTTPS beaconing")

    url = f"{args.target.rstrip('/')}/api/v1/simulator/run"
    params = {"scenario": "phishing_c2"}

    try:
        with httpx.Client(timeout=30.0) as client:
            resp = client.post(url, params=params)
            print(f"[+] Response ({resp.status_code}): {resp.json()}")
    except Exception as e:
        print(f"[-] Error: {e}")

if __name__ == "__main__":
    main()
