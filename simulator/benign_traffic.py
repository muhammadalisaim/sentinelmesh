#!/usr/bin/env python3
"""
SentinelMesh Noise Generator: Benign Enterprise Traffic
Used to demonstrate Triage Agent's noise discrimination capability.
"""
import argparse
import httpx

def main():
    parser = argparse.ArgumentParser(description="Generate Benign Enterprise Traffic")
    parser.add_argument("--target", default="http://127.0.0.1:8080", help="SentinelMesh Base URL")
    args = parser.parse_args()

    print(f"\n[*] Generating benign internal traffic & static web requests...")
    url = f"{args.target.rstrip('/')}/api/v1/simulator/run"
    params = {"scenario": "benign_traffic"}

    try:
        with httpx.Client(timeout=30.0) as client:
            resp = client.post(url, params=params)
            print(f"[+] Response ({resp.status_code}): {resp.json()}")
    except Exception as e:
        print(f"[-] Error: {e}")

if __name__ == "__main__":
    main()
