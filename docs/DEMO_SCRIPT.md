# SentinelMesh Hackathon Pitch & Live Demo Script

**Total Duration:** 2 Minutes 45 Seconds  
**Event:** AMD Developer Hackathon: ACT III (lablab.ai)  
**Presenter:** Muhammad Ali Saim

---

### Slide 1: The Hook (0:00 - 0:20)
> *"Every single day, enterprise SOC analysts face an impossible battle: over 10,000 alerts, 85% of which are noise. When real breaches happen, tracing the kill chain takes hours—and sending sensitive security logs to cloud AI endpoints is a massive compliance and privacy violation. Today, we are proud to introduce SentinelMesh: the Autonomous AI SOC on AMD GPU."*

### Slide 2: The Architecture & Hardware Advantage (0:20 - 0:45)
> *"SentinelMesh runs a multi-agent AI system accelerated entirely on-premise on AMD Instinct GPUs using ROCm and vLLM. By keeping our models local, raw security data never leaves the building. And thanks to AMD's 128GB of high-bandwidth memory, we can feed entire multi-thousand-line log windows directly into the model at over 138 tokens per second."*

### Slide 3: Live Attack Simulation (0:45 - 1:30)
> *(Screen switches to SentinelMesh Dashboard)*  
> *"Let's see it in action. On our Simulator panel, I will launch an SSH Brute Force attack followed by privilege escalation. Watch what happens:  
> Within 100 milliseconds, our deterministic pre-filter catches the burst. The Triage Agent assesses the threat at 95% confidence. The Investigator Agent queries our Qdrant vector store and maps it directly to MITRE ATT&CK techniques T1110 and T1078. The Threat Intel Agent flags the IP as a known Tor node. And look at the Attack Graph—the entire kill chain is visualized in real-time."*

### Slide 4: Human-in-the-Loop Approval (1:30 - 1:55)
> *"Security without safeguards is reckless. SentinelMesh does not execute destructive changes blindly. Notice the Approval Card on screen: our Responder Agent has proposed blocking the IP and locking the account, complete with rollback commands. With one click, I click 'Approve', and the perimeter block is safely enforced."*

### Slide 5: Bilingual Urdu & English Reporting (1:55 - 2:20)
> *"Here is where SentinelMesh truly stands out globally: our Reporter Agent doesn't just write technical English briefings—it produces fully formatted, native Urdu Nastaliq incident reports. For local infrastructure teams and regional banks, this eliminates communication delays in critical emergencies."*

### Slide 6: Benchmarks, Cost ROI & Conclusion (2:20 - 2:45)
> *"On our Benchmark dashboard, you can see our real measured numbers: 138 tokens per second, 42ms time-to-first-token, and a massive 79.5% cost reduction compared to proprietary cloud APIs.  
> SentinelMesh delivers private, autonomous, accelerated defense for the modern enterprise. Built on AMD ROCm. Thank you!"*
