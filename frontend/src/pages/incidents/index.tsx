import React, { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/api";
import { SeverityBadge } from "@/components/SeverityBadge";
import { ShieldAlert, ArrowUpRight, Clock, ShieldCheck, Terminal, Layers } from "lucide-react";

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getIncidents()
      .then(setIncidents)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in-up">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-red-600 text-white tracking-widest shimmer-badge">
              Active Kill-Chain Campaigns
            </span>
            <span className="text-xs text-slate-400 font-mono">MITRE ATT&CK Mapped</span>
          </div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <ShieldAlert className="w-6 h-6 text-red-500 animate-pulse" />
            Security Incidents Registry
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Multi-agent investigated cyber campaigns reconstructed from raw endpoint and perimeter logs.
          </p>
        </div>
      </div>

      {/* Incidents Grid */}
      <div className="grid grid-cols-1 gap-4 animate-fade-in-up-1">
        {incidents.length === 0 ? (
          <div className="p-16 text-center text-slate-500 glass-panel rounded-2xl border border-white/10 text-xs space-y-2">
            <Layers className="w-8 h-8 mx-auto opacity-30 text-cyan-400 animate-pulse" />
            <p>No active incidents recorded.</p>
            <p className="text-[11px] text-slate-600">Launch a simulation from the Attack Simulator to generate campaigns.</p>
          </div>
        ) : (
          incidents.map((inc) => (
            <Link
              key={inc.id}
              href={`/incidents/${inc.id}`}
              className="p-5 sm:p-6 rounded-2xl glass-panel-elevated hover:border-cyan-400/50 hover:-translate-y-0.5 transition-all duration-200 group block shadow-xl"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <SeverityBadge severity={inc.severity} size="md" />
                    <h3 className="font-extrabold text-sm sm:text-base text-white group-hover:text-cyan-400 transition">
                      {inc.title}
                    </h3>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 font-mono">
                    <span>Incident: {inc.id.slice(0, 12)}...</span>
                    <span>•</span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      {new Date(inc.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`text-[11px] uppercase font-mono font-bold px-3 py-1 rounded-xl border ${
                    inc.status === "action_required"
                      ? "bg-amber-950/80 text-amber-300 border-amber-800/80 animate-pulse shadow-md"
                      : inc.status === "contained"
                      ? "bg-emerald-950/80 text-emerald-300 border-emerald-800/80 shadow-md"
                      : "bg-slate-900 text-slate-400 border-slate-800"
                  }`}>
                    {inc.status.replace("_", " ")}
                  </span>

                  <div className="p-2.5 rounded-xl bg-slate-900 group-hover:bg-cyan-500/20 text-slate-400 group-hover:text-cyan-400 border border-slate-800 transition">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {inc.mitre_techniques?.length > 0 && (
                <div className="mt-4 pt-3.5 border-t border-white/5 flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-mono font-bold uppercase text-slate-500">MITRE ATT&CK:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {inc.mitre_techniques.map((t: string) => (
                      <span key={t} className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-950 text-cyan-300 border border-slate-800 shadow-inner">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
