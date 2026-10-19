import React, { useState } from "react";
import { 
  Skull, Server, User, ShieldCheck, Terminal, AlertTriangle, 
  ArrowRight, ShieldAlert, Zap, Globe, Lock, CheckCircle2 
} from "lucide-react";

interface Props {
  incident?: any;
}

export const AttackGraph: React.FC<Props> = ({ incident }) => {
  const [selectedNode, setSelectedNode] = useState<string>("attacker");

  const attackerIp = "194.26.29.112";
  const isSSH = incident?.title?.toLowerCase().includes("ssh") ?? true;
  
  const targetHost = isSSH ? "corp-db-01.internal" : "web-srv-01";
  const vector = isSSH ? "SSH Brute-Force (Port 22)" : "SQLi Payload (HTTP/S)";
  const compromisedEntity = isSSH ? "Account: ubuntu (sudo bash)" : "Webshell: /uploads/cmd.php";
  const containment = incident?.status === "contained" ? "Perimeter IP Block Enforced" : "Action Proposed (Awaiting Approval)";

  const nodes = [
    {
      id: "attacker",
      label: "Threat Actor",
      sub: attackerIp,
      tag: "Adversary Source",
      icon: Skull,
      glow: "border-red-500/80 bg-red-950/40 text-red-400 shadow-red-900/30",
      accent: "text-red-400",
      badge: "Tor Exit Node",
      details: "External threat infrastructure located in Netherlands. Correlated with automated credential stuffing botnet. Abuse confidence: 98%."
    },
    {
      id: "vector",
      label: "Exploit Vector",
      sub: vector,
      tag: "Initial Access",
      icon: Terminal,
      glow: "border-orange-500/80 bg-orange-950/40 text-orange-400 shadow-orange-900/30",
      accent: "text-orange-400",
      badge: "MITRE T1110",
      details: "High-rate dictionary authentication attempts against SSH daemon. 12 failed attempts followed by accepted session."
    },
    {
      id: "host",
      label: "Victim Asset",
      sub: targetHost,
      tag: "Core Infrastructure",
      icon: Server,
      glow: "border-amber-500/80 bg-amber-950/40 text-amber-400 shadow-amber-900/30",
      accent: "text-amber-400",
      badge: "VLAN 10.0.1.0/24",
      details: "Production database server holding mission-critical tables and credentials. High forensic priority asset."
    },
    {
      id: "privilege",
      label: "Escalation",
      sub: compromisedEntity,
      tag: "Privilege Escalation",
      icon: User,
      glow: "border-purple-500/80 bg-purple-950/40 text-purple-400 shadow-purple-900/30",
      accent: "text-purple-400",
      badge: "MITRE T1078 / T1548",
      details: "Adversary executed 'sudo /bin/bash' to escape unprivileged session and gain root administrative authority."
    },
    {
      id: "containment",
      label: "Containment",
      sub: containment,
      tag: "Autonomous Remediation",
      icon: ShieldCheck,
      glow: "border-emerald-500/80 bg-emerald-950/40 text-emerald-400 shadow-emerald-900/30",
      accent: "text-emerald-400",
      badge: incident?.status === "contained" ? "ACTIVE" : "PENDING",
      details: "Surgical iptables firewall block and account session kill cataloged by Responder Agent with automated rollback commands."
    }
  ];

  const activeNode = nodes.find((n) => n.id === selectedNode) || nodes[0];

  return (
    <div className="glass-panel-elevated rounded-2xl p-4 sm:p-6 shadow-2xl relative overflow-hidden">
      {/* Background cyber accent */}
      <div className="cyber-scanline" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
            <h3 className="text-base font-extrabold text-white tracking-wide">
              Adversary Attack Topology & Kill Chain
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time causal graph reconstructed by SentinelMesh Investigator Agent
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 font-bold shadow-sm">
            5 Kill-Chain Stages
          </span>
        </div>
      </div>

      {/* Topology Nodes Scrollable Area */}
      <div className="py-4 overflow-x-auto scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
        <div className="flex items-center justify-between min-w-[1080px] gap-2 px-1">
          {nodes.map((node, i) => {
            const Icon = node.icon;
            const isSelected = selectedNode === node.id;

            return (
              <React.Fragment key={node.id}>
                <button
                  onClick={() => setSelectedNode(node.id)}
                  className={`flex-1 min-w-[195px] max-w-[245px] p-4 rounded-2xl border transition-all duration-200 text-left relative group cursor-pointer ${
                    node.glow
                  } ${
                    isSelected
                      ? "ring-2 ring-cyan-400 -translate-y-1 bg-slate-900/95 shadow-xl shadow-cyan-950/60"
                      : "opacity-80 hover:opacity-100 hover:-translate-y-0.5"
                  }`}
                >
                  {/* Stage indicator & Badge row (never intersects) */}
                  <div className="flex items-center justify-between gap-1.5 mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-cyan-400 animate-ping" : "bg-slate-500"}`} />
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                        Stage 0{i + 1}
                      </span>
                    </div>
                    <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-md bg-black/70 border border-white/10 text-cyan-300 shrink-0 whitespace-nowrap shadow-sm">
                      {node.badge}
                    </span>
                  </div>

                  {/* Dedicated Category Tag row */}
                  <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400/90 mb-2 truncate">
                    {node.tag}
                  </div>

                  {/* Icon & Label row */}
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`p-1.5 rounded-lg bg-black/50 border border-white/10 shrink-0 ${node.accent}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="font-extrabold text-xs text-white truncate">
                      {node.label}
                    </span>
                  </div>

                  {/* Subtitle / Asset Target Box */}
                  <div 
                    className="font-mono text-xs font-semibold text-slate-200 truncate bg-black/40 px-2.5 py-1.5 rounded-lg border border-white/5"
                    title={node.sub}
                  >
                    {node.sub}
                  </div>
                </button>

                {i < nodes.length - 1 && (
                  <div className="shrink-0 flex items-center justify-center px-0.5 text-slate-600">
                    <div className="flex items-center gap-0.5">
                      <div className="w-3 h-0.5 bg-gradient-to-r from-slate-700 to-cyan-500" />
                      <ArrowRight className="w-3.5 h-3.5 text-cyan-400/80" />
                    </div>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Selected Node Forensic Inspection HUD */}
      <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800/80 shadow-inner flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-950/60 border border-cyan-800/60 text-cyan-400 shrink-0 mt-0.5 sm:mt-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase text-white font-mono">
                {activeNode.label}:
              </span>
              <span className="font-mono text-cyan-300 text-xs font-semibold">
                {activeNode.sub}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                {activeNode.badge}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              {activeNode.details}
            </p>
          </div>
        </div>

        <div className="text-[11px] font-mono text-slate-500 shrink-0 sm:text-right">
          Telemetry Verified via AMD ROCm
        </div>
      </div>
    </div>
  );
};
