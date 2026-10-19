import React, { useState } from "react";
import Link from "next/link";
import { api } from "@/api";
import { 
  PlayCircle, Terminal, ShieldAlert, CheckCircle2, 
  ArrowRight, RefreshCw, AlertTriangle, ShieldCheck, Flame, Zap, Play, Trash2, RotateCcw 
} from "lucide-react";

export default function SimulatorPage() {
  const [selectedScenario, setSelectedScenario] = useState("ssh_bruteforce");
  const [attackerIp, setAttackerIp] = useState("194.26.29.112");
  const [targetHost, setTargetHost] = useState("corp-db-01.internal");
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [executionLog, setExecutionLog] = useState<string[]>([]);
  const [incidentLink, setIncidentLink] = useState<string | null>(null);

  const handleReset = async () => {
    if (!window.confirm("Are you sure you want to purge all past simulation results, alerts, incidents, and generated reports? This will reset the SOC to a fresh state.")) {
      return;
    }
    setResetLoading(true);
    try {
      await api.resetData();
      setIncidentLink(null);
      setExecutionLog([
        `[${new Date().toLocaleTimeString()}] [✔] ALL SOC RESULTS CLEARED: Database & reports wiped to fresh state.`,
      ]);
    } catch (e: any) {
      setExecutionLog((prev) => [
        `[${new Date().toLocaleTimeString()}] [✖] Reset Error: ${e.message}`,
        ...prev
      ]);
    } finally {
      setResetLoading(false);
    }
  };

  const scenarios = [
    {
      id: "ssh_bruteforce",
      name: "SSH Brute Force to Sudo Escalation",
      mitre: "T1110.001, T1078, T1548",
      desc: "Simulates 12 high-rate failed SSH attempts, followed by valid password discovery for user 'ubuntu' and root privilege escalation via sudo.",
      severity: "critical",
      glow: "border-red-500/60 shadow-red-950/40 text-red-400"
    },
    {
      id: "sqli_webshell",
      name: "Web SQLi to Interactive Web Shell",
      mitre: "T1190, T1505.003",
      desc: "Simulates SQL injection reconnaissance on web endpoints, followed by malicious PHP web shell drop and remote OS command execution.",
      severity: "critical",
      glow: "border-orange-500/60 shadow-orange-950/40 text-orange-400"
    },
    {
      id: "phishing_c2",
      name: "Spearphishing Macro to C2 Beaconing",
      mitre: "T1566.001, T1071.001",
      desc: "Simulates malicious attachment execution spawning hidden PowerShell process with periodic outbound HTTPS beaconing to adversary infrastructure.",
      severity: "high",
      glow: "border-purple-500/60 shadow-purple-950/40 text-purple-400"
    },
    {
      id: "benign_traffic",
      name: "Benign Enterprise Background Traffic",
      mitre: "Noise Baseline",
      desc: "Generates normal internal web requests and routine background activity. Demonstrates SentinelMesh Triage Agent's ability to dismiss noise without alert fatigue.",
      severity: "low",
      glow: "border-emerald-500/60 shadow-emerald-950/40 text-emerald-400"
    }
  ];

  const handleLaunch = async () => {
    setLoading(true);
    setIncidentLink(null);
    setExecutionLog((prev) => [
      `[${new Date().toLocaleTimeString()}] [+] INITIATING SIMULATION: ${selectedScenario.toUpperCase()}`,
      `[${new Date().toLocaleTimeString()}] [*] Adversary IP: ${attackerIp} | Target Host: ${targetHost}`,
      ...prev
    ]);

    try {
      const res = await api.runSimulator(selectedScenario, attackerIp, targetHost);
      setExecutionLog((prev) => [
        `[${new Date().toLocaleTimeString()}] [✔] Injected ${res.logs_generated} raw logs into /api/v1/logs/ingest`,
        `[${new Date().toLocaleTimeString()}] [✔] Pre-filter engine evaluated sliding window threshold`,
        `[${new Date().toLocaleTimeString()}] [✔] Multi-Agent SOC Pipeline triggered on AMD Instinct MI250X`,
        `[${new Date().toLocaleTimeString()}] [✔] Live WebSockets streaming thoughts to dashboard`,
        ...prev
      ]);

      setTimeout(async () => {
        const incs = await api.getIncidents();
        if (incs.length > 0) {
          setIncidentLink(incs[0].id);
        }
      }, 1500);

    } catch (e: any) {
      setExecutionLog((prev) => [
        `[${new Date().toLocaleTimeString()}] [✖] Simulation Error: ${e.message}`,
        ...prev
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in-up">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-red-600 text-white tracking-widest shimmer-badge">
              Live Attack Emulator
            </span>
            <span className="text-xs text-slate-400 font-mono">MITRE ATT&CK Validated</span>
          </div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <PlayCircle className="w-6 h-6 text-red-500 animate-pulse" />
            Adversary Attack Simulation Suite
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Inject realistic adversary tactics in real time to demonstrate how SentinelMesh autonomously detects, triages, reconstructs kill chains, and proposes containment actions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleReset}
            disabled={resetLoading || loading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900/90 hover:bg-red-950/50 text-red-400 hover:text-red-300 border border-red-500/30 hover:border-red-500/60 text-xs font-bold transition-all shadow-lg disabled:opacity-50 hover:-translate-y-0.5 active:scale-95 cursor-pointer"
            title="Purge all incidents, alerts, logs and generated reports"
          >
            {resetLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin text-red-400" />
            ) : (
              <Trash2 className="w-4 h-4 text-red-400" />
            )}
            <span>Clear / Reset All Results</span>
          </button>
        </div>
      </div>

      {/* Scenario Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in-up-1">
        {scenarios.map((sc) => {
          const isSelected = selectedScenario === sc.id;

          return (
            <button
              key={sc.id}
              onClick={() => setSelectedScenario(sc.id)}
              className={`p-5 rounded-2xl border text-left transition-all duration-200 relative overflow-hidden shadow-xl cursor-pointer ${
                isSelected
                  ? "bg-slate-900/95 border-cyan-400 ring-2 ring-cyan-400/50 -translate-y-1 shadow-cyan-950/60"
                  : "glass-panel opacity-80 hover:opacity-100 hover:-translate-y-0.5 hover:border-white/20"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <span className="font-extrabold text-sm text-white shrink min-w-0">{sc.name}</span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-black/70 text-cyan-300 border border-white/10 shrink-0">
                  {sc.mitre}
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                {sc.desc}
              </p>
            </button>
          );
        })}
      </div>

      {/* Simulation Control Console */}
      <div className="glass-panel-elevated rounded-2xl p-6 sm:p-7 shadow-2xl border border-white/10 space-y-4 animate-fade-in-up-2">
        <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          Attack Simulation Vector Configuration
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-mono font-bold text-slate-400 block mb-1">
              Simulated Attacker Source IP:
            </label>
            <input
              type="text"
              value={attackerIp}
              onChange={(e) => setAttackerIp(e.target.value)}
              className="w-full bg-slate-950/90 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500 shadow-inner"
            />
          </div>

          <div>
            <label className="text-xs font-mono font-bold text-slate-400 block mb-1">
              Victim Server / Hostname:
            </label>
            <input
              type="text"
              value={targetHost}
              onChange={(e) => setTargetHost(e.target.value)}
              className="w-full bg-slate-950/90 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500 shadow-inner"
            />
          </div>
        </div>

        <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/5">
          <div className="text-xs font-mono text-slate-400">
            Selected Vector: <span className="font-bold text-white uppercase">{selectedScenario.replace("_", " ")}</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {incidentLink && (
              <Link
                href={`/incidents/${incidentLink}`}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-lg shadow-cyan-950/50 transition hover:-translate-y-0.5 active:scale-95"
              >
                Inspect Created Incident <ArrowRight className="w-4 h-4" />
              </Link>
            )}

            <button
              disabled={loading}
              onClick={handleLaunch}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-black uppercase tracking-wider shadow-xl shadow-red-950/60 transition hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Ingesting Telemetry...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" /> Execute Attack
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Live STDOUT Terminal Box */}
      <div className="bg-black/90 rounded-2xl border border-white/10 p-5 shadow-2xl space-y-2 animate-fade-in-up-3">
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-bold">
            <Terminal className="w-4 h-4" />
            <span>attack_simulator.stdout</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span>LIVE FEED</span>
          </div>
        </div>

        <div className="font-mono text-xs text-emerald-400 space-y-1.5 max-h-52 overflow-y-auto pt-2">
          {executionLog.length === 0 ? (
            <p className="text-slate-600 italic">No simulation events recorded yet in this session.</p>
          ) : (
            executionLog.map((log, idx) => (
              <div key={idx} className="leading-relaxed">
                {log}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
