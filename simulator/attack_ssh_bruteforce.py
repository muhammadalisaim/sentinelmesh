#!/usr/bin/env python3
"""
SentinelMesh Attack Scenario 1: SSH Brute Force to Privilege Escalation
MITRE ATT&CK: T1110 (Brute Force), T1078 (Valid Accounts), T1548 (Privilege Escalation)
"""
import argparse
import time
import httpx

def main():
    parser = argparse.ArgumentParser(description="Simulate SSH Brute Force Attack Sequence")
    parser.add_argument("--target", default="http://127.0.0.1:8080", help="SentinelMesh Base URL")
    parser.add_argument("--attacker-ip", default="194.26.29.112", help="Simulated adversary IP")
    parser.add_argument("--victim-host", default="corp-db-01.internal", help="Target server")
    args = parser.parse_args()

    print(f"\n[!] Initiating SentinelMesh Adversary Simulation...")
    print(f"[*] Scenario: SSH Brute Force -> Privilege Escalation")
    print(f"[*] Attacker IP: {args.attacker_ip} -> Victim Host: {args.victim_host}")

    url = f"{args.target.rstrip('/')}/api/v1/simulator/run"
    params = {
        "scenario": "ssh_bruteforce",
        "attacker_ip": args.attacker_ip,
        "target_host": args.victim_host
    }

    try:
        with httpx.Client(timeout=30.0) as client:
            resp = client.post(url, params=params)
            if resp.status_code == 200:
                data = resp.json()
                print(f"[+] Attack injected successfully! {data.get('logs_generated')} logs generated.")
                print(f"[+] Pipeline status: {data.get('message')}")
                print(f"[+] Watch live agent reasoning on Dashboard (WS /ws/stream)!")
            else:
                print(f"[-] Request failed with status code {resp.status_code}: {resp.text}")
    except Exception as e:
        print(f"[-] Error connecting to SentinelMesh API: {e}")

if __name__ == "__main__":
    main()
