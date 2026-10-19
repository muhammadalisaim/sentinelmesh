import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { api } from "@/api";
import { SeverityBadge } from "@/components/SeverityBadge";
import { AttackGraph } from "@/components/AttackGraph";
import { ApprovalCard } from "@/components/ApprovalCard";
import { AgentStream } from "@/components/AgentStream";
import { 
  ShieldAlert, Clock, ArrowLeft, FileText, CheckCircle2, 
  RotateCcw, ShieldCheck, Terminal, Cpu, RefreshCw, Zap 
} from "lucide-react";

export default function IncidentDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [incident, setIncident] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchDetail = async () => {
    if (!id || typeof id !== "string") return;
    try {
      const data = await api.getIncident(id);
      setIncident(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
    const interval = setInterval(fetchDetail, 5000);
    return () => clearInterval(interval);
  }, [id]);

  const handleApprove = async (actionId: string) => {
    await api.approveAction(actionId);
    await fetchDetail();
  };

  const handleReject = async (actionId: string) => {
    await api.rejectAction(actionId);
    await fetchDetail();
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-500 font-mono text-xs">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-cyan-400" />
        <p>Loading incident telemetry on AMD ROCm Enclave...</p>
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="py-24 text-center text-slate-400 font-mono text-xs">
        <p>Incident not found.</p>
        <Link href="/incidents" className="text-cyan-400 underline mt-2 block">
          Return to incidents registry
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in-up">
        <div>
          <Link
            href="/incidents"
            className="text-xs font-mono font-bold text-slate-400 hover:text-cyan-400 flex items-center gap-1.5 mb-2 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Incidents Registry
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <SeverityBadge severity={incident.severity} size="lg" />
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {incident.title}
            </h1>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Case Ref: {incident.id} • Registered: {new Date(incident.created_at).toLocaleString()}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={`/reports?incident_id=${incident.id}`}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-rose-950/50 transition hover:-translate-y-0.5 active:scale-95"
          >
            <FileText className="w-4 h-4" />
            Bilingual Report (Urdu/EN)
          </Link>

          <button
            onClick={() => api.triggerAnalysis(incident.id).then(() => fetchDetail())}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 text-xs font-mono font-bold border border-slate-800 transition active:scale-95 shadow-md"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Re-Analyze
          </button>
        </div>
      </div>

      {/* Visual Attack Topology */}
      <div className="animate-fade-in-up-1">
        <AttackGraph incident={incident} />
      </div>

      {/* Containment Gateway (Human-in-the-Loop) */}
      <div className="glass-panel-elevated rounded-2xl p-5 sm:p-6 shadow-2xl border border-white/10 space-y-4 animate-fade-in-up-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 shadow-md">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white">
                Human-in-the-Loop Containment Gateway
              </h3>
              <p className="text-xs text-slate-400">
                Authorized remediation actions proposed by Responder Agent. Mandatory analyst approval.
              </p>
            </div>
          </div>

          <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-cyan-400 font-bold">
            {incident.actions?.filter((a: any) => a.status === "executed").length} / {incident.actions?.length || 0} Contained
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {(!incident.actions || incident.actions.length === 0) ? (
            <div className="col-span-2 p-8 text-center text-slate-500 font-mono text-xs">
              No containment actions currently pending for this campaign.
            </div>
          ) : (
            incident.actions.map((act: any) => (
              <ApprovalCard
                key={act.id}
                action={act}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            ))
          )}
        </div>
      </div>

      {/* Reconstructed Timeline & Live Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in-up-3">
        {/* Left: Adversary Timeline (6 cols) */}
        <div className="lg:col-span-6 space-y-5">
          <div className="glass-panel-elevated rounded-2xl p-5 sm:p-6 shadow-2xl border border-white/10">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2 mb-4 font-mono">
              <Clock className="w-4 h-4 text-cyan-400" />
              Reconstructed Kill Chain Timeline
            </h3>

            {(!incident.timeline_json || incident.timeline_json.length === 0) ? (
              <p className="text-xs text-slate-500 py-8 text-center font-mono">
                Investigator agent is compiling chronological event timeline...
              </p>
            ) : (
              <div className="space-y-4 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-slate-800">
                {incident.timeline_json.map((step: any, i: number) => (
                  <div key={i} className="relative flex items-start gap-4 pl-8">
                    <div className="absolute left-1.5 top-1.5 w-3 h-3 rounded-full bg-cyan-400 ring-4 ring-slate-950 shadow-[0_0_10px_rgba(6,182,212,0.8)]" />
                    <div className="flex-1 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 shadow-md">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400">
                          Phase: {step.phase || "Execution"}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">Step {step.step || i + 1}</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed font-sans">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* MITRE ATT&CK Matrix Match */}
          {incident.mitre_techniques?.length > 0 && (
            <div className="glass-panel rounded-2xl p-5 shadow-xl border border-white/10">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2 mb-3 font-mono">
                <Terminal className="w-4 h-4 text-violet-400" />
                Matched MITRE ATT&CK Techniques (Qdrant RAG)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {incident.mitre_techniques.map((tech: string) => (
                  <div
                    key={tech}
                    className="p-3 rounded-xl bg-slate-950/80 border border-violet-900/40 text-xs font-mono space-y-1 shadow-inner"
                  >
                    <span className="font-extrabold text-violet-300 block">{tech}</span>
                    <span className="text-[10px] text-slate-400 block font-sans">
                      Verified via AMD ROCm Vector Knowledge Base
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Live Agent Stream (6 cols) */}
        <div className="lg:col-span-6 h-[560px]">
          <AgentStream
            initialSteps={incident.runs?.[0]?.steps || []}
            incidentId={incident.id}
          />
        </div>
      </div>
    </div>
  );
}
