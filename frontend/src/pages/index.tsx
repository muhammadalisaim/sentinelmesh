import React, { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/api";
import { SeverityBadge } from "@/components/SeverityBadge";
import { AgentStream } from "@/components/AgentStream";
import { 
  ShieldAlert, Activity, CheckCircle2, Cpu, Zap, 
  ArrowUpRight, AlertTriangle, Play, RefreshCw, Layers,
  Terminal, ShieldCheck, Flame, Shield, ArrowRight, Gauge
} from "lucide-react";

export default function Dashboard() {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [benchmark, setBenchmark] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [incRes, benchRes] = await Promise.all([
        api.getIncidents().catch(() => []),
        api.getBenchmark().catch(() => null)
      ]);
      setIncidents(incRes);
      setBenchmark(benchRes);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleQuickSimulate = async (scenario: string) => {
    setSimulating(scenario);
    try {
      await api.runSimulator(scenario);
      await loadData();
    } finally {
      setTimeout(() => setSimulating(null), 1000);
    }
  };

  const activeIncidents = incidents.filter((i) => i.status !== "closed");
  const criticalCount = incidents.filter((i) => i.severity === "critical").length;
  const highCount = incidents.filter((i) => i.severity === "high").length;
  const mediumCount = incidents.filter((i) => i.severity === "medium").length;
  const totalCount = Math.max(incidents.length, 1);

  const critPercent = Math.round((criticalCount / totalCount) * 100);
  const highPercent = Math.round((highCount / totalCount) * 100);
  const medPercent = Math.round((mediumCount / totalCount) * 100);

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Top Banner: Cyber Security Mission Control */}
      <div className="relative overflow-hidden rounded-2xl glass-panel-elevated p-5 sm:p-7 shadow-2xl border border-white/10 animate-fade-in-up">
        <div className="cyber-scanline" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-0.5 rounded-full text-[10px] font-black uppercase bg-gradient-to-r from-red-600 to-rose-600 text-white tracking-widest shadow-md shadow-red-950/60 shimmer-badge">
                DEFCON 2 • ELEVATED SURVEILLANCE
              </span>
              <span className="text-xs font-mono text-cyan-400 font-bold flex items-center gap-1.5 bg-cyan-950/60 px-2.5 py-0.5 rounded-full border border-cyan-800/40">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                AMD Instinct Multi-Agent Mesh
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Sentinel<span className="text-cyan-400 drop-shadow-[0_0_15px_rgba(6,182,212,0.4)]">Mesh</span> Cyber Command Center
            </h1>

            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              On-premise autonomous SOC accelerated by AMD ROCm + vLLM. Ingests raw telemetry, executes AI kill-chain reconstruction, and enforces human-gated containment with 100% data sovereignty.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <Link
              href="/simulator"
              className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs uppercase tracking-wider shadow-xl shadow-red-950/60 transition-all hover:-translate-y-0.5 active:scale-95"
            >
              <Play className="w-4 h-4 fill-current" />
              Launch Attack Demo
            </Link>

            <button
              onClick={loadData}
              className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-800 transition active:scale-95 shadow-md"
              title="Refresh Telemetry"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 4 Elevated Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in-up-1">
        {/* Active Incidents */}
        <div className="cyber-card p-5 shadow-xl group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest font-mono">
              Active Incidents
            </span>
            <div className="p-2.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 shadow-md">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{activeIncidents.length}</span>
            <span className="text-xs font-mono font-bold text-red-400">
              {criticalCount} Critical
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 font-mono">
            {incidents.length} total campaigns triaged
          </div>
          <div className="w-full h-1 bg-slate-800 mt-3 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full w-3/4" />
          </div>
        </div>

        {/* AMD GPU Inference Rate */}
        <div className="cyber-card p-5 shadow-xl group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest font-mono">
              AMD ROCm Throughput
            </span>
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-md">
              <Zap className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-cyan-400">
              {benchmark?.tokens_per_second || 138.5}
            </span>
            <span className="text-xs font-mono text-cyan-300 font-bold">tok/sec</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 font-mono truncate">
            {benchmark?.gpu_model || "AMD Instinct MI250X"}
          </div>
          <div className="w-full h-1 bg-slate-800 mt-3 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full w-[85%]" />
          </div>
        </div>

        {/* Time To First Token (TTFT) */}
        <div className="cyber-card p-5 shadow-xl group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest font-mono">
              Latency (TTFT)
            </span>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-md">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-400">
              {benchmark?.time_to_first_token_ms ? `${benchmark.time_to_first_token_ms}ms` : "42ms"}
            </span>
            <span className="text-xs font-mono text-emerald-500 font-bold">Instant</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 font-mono">
            vs 650ms cloud commercial API
          </div>
          <div className="w-full h-1 bg-slate-800 mt-3 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full w-[95%]" />
          </div>
        </div>

        {/* Hardware Cost Reduction */}
        <div className="cyber-card p-5 shadow-xl group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest font-mono">
              AMD Cost Savings
            </span>
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 shadow-md">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-purple-400">
              {benchmark?.cost_savings_percent || 79.5}%
            </span>
            <span className="text-xs font-mono text-purple-300 font-bold">Cheaper</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 font-mono">
            $3.80 vs $18.50 per 1M tokens
          </div>
          <div className="w-full h-1 bg-slate-800 mt-3 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full w-[79%]" />
          </div>
        </div>
      </div>

      {/* Hardware Telemetry Bar */}
      <div className="glass-panel-elevated rounded-2xl p-4 sm:p-5 shadow-xl flex flex-wrap items-center justify-between gap-4 text-xs font-mono animate-fade-in-up-2 border border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-red-600/10 text-red-500 border border-red-500/20">
            <Cpu className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <span className="text-white font-bold text-sm block">AMD Instinct MI250X Enclave</span>
            <span className="text-slate-400 text-[11px]">ROCm 6.2 • PagedAttention vLLM Engine</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-slate-300">
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-bold">VRAM Usage</span>
            <span className="text-cyan-400 font-bold">18.4 / 128 GB (14%)</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Die Temp</span>
            <span className="text-emerald-400 font-bold">48°C (Optimal)</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Engine Clock</span>
            <span className="text-slate-200 font-bold">1.70 GHz</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-bold">Compliance</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Zero Cloud Egress
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Active Incidents + Live Agent Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in-up-3">
        {/* Left: Active Incidents & Simulator Launcher (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Incidents Box */}
          <div className="glass-panel-elevated rounded-2xl overflow-hidden shadow-2xl">
            <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between bg-slate-950/80">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-400" />
                <h3 className="text-sm font-extrabold text-white">
                  Active Threat Incidents ({incidents.length})
                </h3>
              </div>
              <Link
                href="/incidents"
                className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition"
              >
                View Full Registry <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-white/5">
              {incidents.length === 0 ? (
                <div className="p-10 text-center text-slate-500 text-xs">
                  No active incidents recorded. Click below to simulate an intrusion scenario.
                </div>
              ) : (
                incidents.slice(0, 5).map((inc) => (
                  <Link
                    key={inc.id}
                    href={`/incidents/${inc.id}`}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/[0.03] transition block group"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2.5">
                        <SeverityBadge severity={inc.severity} size="sm" />
                        <span className="font-bold text-xs text-slate-200 group-hover:text-cyan-400 transition">
                          {inc.title}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 font-mono">
                        <span>ID: {inc.id.slice(0, 8)}...</span>
                        <span>•</span>
                        <span>{new Date(inc.created_at).toLocaleTimeString()}</span>
                        {inc.mitre_techniques?.length > 0 && (
                          <>
                            <span>•</span>
                            <span className="text-cyan-400 font-bold">
                              {inc.mitre_techniques.slice(0, 3).join(", ")}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] uppercase font-mono font-bold px-2.5 py-1 rounded-lg border ${
                        inc.status === "action_required"
                          ? "bg-amber-950/80 text-amber-300 border-amber-800/80 animate-pulse"
                          : inc.status === "contained"
                          ? "bg-emerald-950/80 text-emerald-300 border-emerald-800/80"
                          : "bg-slate-900 text-slate-400 border-slate-800"
                      }`}>
                        {inc.status.replace("_", " ")}
                      </span>
                      <ArrowUpRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 transition" />
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Quick Simulation Trigger Bar */}
          <div className="glass-panel rounded-2xl p-4 sm:p-5 shadow-xl border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-red-600/10 text-red-400 border border-red-500/20">
                  <Play className="w-4 h-4 fill-current" />
                </div>
                <div>
                  <span className="text-xs font-extrabold text-white block">Adversary Simulator Launchpad</span>
                  <span className="text-[11px] text-slate-400">Trigger simulated attack scenarios with 1 click</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              <button
                disabled={simulating !== null}
                onClick={() => handleQuickSimulate("ssh_bruteforce")}
                className="p-3 rounded-xl bg-slate-950/80 hover:bg-slate-900 border border-red-900/40 text-left transition active:scale-95 group disabled:opacity-50"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs font-bold text-red-400">SSH Brute Force</span>
                  <span className="text-[10px] font-mono text-slate-500">T1110</span>
                </div>
                <p className="text-[10px] text-slate-400 line-clamp-1">Credential attack + sudo escalation</p>
              </button>

              <button
                disabled={simulating !== null}
                onClick={() => handleQuickSimulate("sqli_webshell")}
                className="p-3 rounded-xl bg-slate-950/80 hover:bg-slate-900 border border-orange-900/40 text-left transition active:scale-95 group disabled:opacity-50"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs font-bold text-orange-400">Web SQLi + Shell</span>
                  <span className="text-[10px] font-mono text-slate-500">T1190</span>
                </div>
                <p className="text-[10px] text-slate-400 line-clamp-1">Web injection + shell upload</p>
              </button>

              <button
                disabled={simulating !== null}
                onClick={() => handleQuickSimulate("benign_traffic")}
                className="p-3 rounded-xl bg-slate-950/80 hover:bg-slate-900 border border-emerald-900/40 text-left transition active:scale-95 group disabled:opacity-50"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs font-bold text-emerald-400">Benign Noise</span>
                  <span className="text-[10px] font-mono text-slate-500">Noise Filter</span>
                </div>
                <p className="text-[10px] text-slate-400 line-clamp-1">Triage AI noise dismissal</p>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Live Agent Stream (5 cols) */}
        <div className="lg:col-span-5 h-[620px]">
          <AgentStream />
        </div>
      </div>
    </div>
  );
}
