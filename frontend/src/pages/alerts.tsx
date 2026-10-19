import React, { useEffect, useState } from "react";
import { api } from "@/api";
import { SeverityBadge } from "@/components/SeverityBadge";
import { BellRing, Filter, EyeOff, Eye, RefreshCw, CheckCircle2, ShieldAlert, Search } from "lucide-react";

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [hideNoise, setHideNoise] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const sev = severityFilter === "all" ? undefined : severityFilter;
      const data = await api.getAlerts(undefined, sev, hideNoise);
      setAlerts(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [severityFilter, hideNoise]);

  const filteredAlerts = alerts.filter((a) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      a.title?.toLowerCase().includes(q) ||
      a.rule_id?.toLowerCase().includes(q) ||
      a.severity?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in-up">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-cyan-600 text-white tracking-widest shimmer-badge">
              Telemetry Ingestion Queue
            </span>
            <span className="text-xs text-slate-400 font-mono">Real-Time Filtering</span>
          </div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <BellRing className="w-6 h-6 text-cyan-400 animate-pulse" />
            Alerts Telemetry & Triage Matrix
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Pre-filtered log alerts evaluated by SentinelMesh Triage Agent with noise discrimination.
          </p>
        </div>

        {/* Right Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setHideNoise(!hideNoise)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-mono font-bold border transition hover:-translate-y-0.5 active:scale-95 ${
              hideNoise
                ? "bg-cyan-950/80 text-cyan-300 border-cyan-800/80 shadow-md shadow-cyan-950/40"
                : "bg-amber-950/80 text-amber-300 border-amber-800/80"
            }`}
          >
            {hideNoise ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            {hideNoise ? "Noise Filter: Active" : "Showing Raw Noise"}
          </button>

          <button
            onClick={fetchAlerts}
            className="p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-800 shadow-md transition active:scale-95"
            title="Refresh Alerts"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="glass-panel rounded-2xl p-4 shadow-xl border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in-up-1">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search alerts, rules, IP..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500 shadow-inner"
          />
        </div>

        {/* Severity Selector */}
        <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-xl p-1 text-xs font-mono overflow-x-auto w-full sm:w-auto">
          {["all", "critical", "high", "medium", "low"].map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-3 py-1.5 rounded-lg uppercase text-[10px] font-bold transition whitespace-nowrap ${
                severityFilter === sev
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Table Container */}
      <div className="glass-panel-elevated rounded-2xl overflow-hidden shadow-2xl border border-white/10 animate-fade-in-up-2">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950/90 border-b border-white/10 text-slate-400 uppercase text-[10px] font-mono tracking-wider font-bold">
                <th className="py-3.5 px-4">Severity</th>
                <th className="py-3.5 px-4">Rule Signature / Title</th>
                <th className="py-3.5 px-4">Confidence</th>
                <th className="py-3.5 px-4">Threat Classification</th>
                <th className="py-3.5 px-4">Telemetry Events</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredAlerts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-500 font-mono text-xs">
                    No security alerts found matching the active filter.
                  </td>
                </tr>
              ) : (
                filteredAlerts.map((alert) => (
                  <tr key={alert.id} className="hover:bg-white/[0.02] transition">
                    <td className="py-4 px-4">
                      <SeverityBadge severity={alert.severity} size="sm" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-extrabold text-white text-xs">{alert.title || alert.rule_id}</div>
                      <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                        Rule ID: {alert.rule_id}
                      </div>
                    </td>
                    <td className="py-4 px-4 font-mono font-bold text-cyan-300">
                      {Math.round(alert.confidence * 100)}%
                    </td>
                    <td className="py-4 px-4">
                      {alert.is_noise ? (
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                          DISMISSED NOISE
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-red-950/80 text-red-300 border border-red-800/80 shadow-sm">
                          GENUINE THREAT
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 font-mono text-slate-300">
                      {alert.event_ids?.length || 0} events
                    </td>
                    <td className="py-4 px-4">
                      <span className="uppercase text-[10px] font-mono font-bold text-slate-300 px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                        {alert.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-slate-400 font-mono text-[11px]">
                      {new Date(alert.created_at).toLocaleTimeString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
