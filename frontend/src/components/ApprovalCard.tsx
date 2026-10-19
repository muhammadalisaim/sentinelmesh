import React, { useState } from "react";
import { ShieldAlert, CheckCircle2, XCircle, AlertTriangle, Terminal, RefreshCw, Lock, ShieldCheck } from "lucide-react";

interface ActionItem {
  id: string;
  action_type: string;
  target: string;
  risk_level: string;
  status: string;
  rollback_info?: {
    description?: string;
    rollback?: string;
  };
}

interface Props {
  action: ActionItem;
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string) => Promise<void>;
}

export const ApprovalCard: React.FC<Props> = ({ action, onApprove, onReject }) => {
  const [loading, setLoading] = useState(false);

  const handleAction = async (type: "approve" | "reject") => {
    setLoading(true);
    try {
      if (type === "approve") {
        await onApprove(action.id);
      } else {
        await onReject(action.id);
      }
    } finally {
      setLoading(false);
    }
  };

  const isExecuted = action.status === "executed" || action.status === "approved";
  const isRejected = action.status === "rejected";

  return (
    <div className={`p-4 sm:p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden ${
      isExecuted
        ? "bg-emerald-950/20 border-emerald-500/40 shadow-emerald-950/20 shadow-lg"
        : isRejected
        ? "bg-slate-900/30 border-slate-800/60 opacity-60"
        : "glass-panel-elevated hover:border-cyan-400/50 hover:-translate-y-0.5 shadow-2xl"
    }`}>
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className={`p-3 rounded-xl shrink-0 ${
            action.risk_level === "high"
              ? "bg-red-500/10 text-red-400 border border-red-500/30 shadow-md shadow-red-950/30"
              : action.risk_level === "medium"
              ? "bg-amber-500/10 text-amber-400 border border-amber-500/30 shadow-md shadow-amber-950/30"
              : "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-md shadow-cyan-950/30"
          }`}>
            <ShieldAlert className="w-5 h-5" />
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono font-black text-white uppercase text-sm tracking-wide">
                {action.action_type.replace("_", " ")}
              </span>
              <span className={`text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 rounded border ${
                action.risk_level === "high"
                  ? "bg-red-950/80 text-red-300 border-red-800/60"
                  : action.risk_level === "medium"
                  ? "bg-amber-950/80 text-amber-300 border-amber-800/60"
                  : "bg-cyan-950/80 text-cyan-300 border-cyan-800/60"
              }`}>
                Risk: {action.risk_level}
              </span>
            </div>

            <p className="text-xs text-slate-400">
              Target Entity: <span className="text-cyan-300 font-mono font-bold bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/50">{action.target}</span>
            </p>
          </div>
        </div>

        {/* Buttons / Status Pill */}
        <div className="shrink-0">
          {isExecuted ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-3.5 py-1.5 rounded-xl shadow-md">
              <CheckCircle2 className="w-4 h-4" /> Executed (Dry-Run)
            </span>
          ) : isRejected ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 bg-slate-900 border border-slate-800 px-3.5 py-1.5 rounded-xl">
              <XCircle className="w-4 h-4" /> Rejected
            </span>
          ) : (
            <div className="flex items-center gap-2">
              <button
                disabled={loading}
                onClick={() => handleAction("approve")}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-black uppercase tracking-wider rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-950/50 transition active:scale-95 disabled:opacity-50"
              >
                {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                Approve Action
              </button>
              <button
                disabled={loading}
                onClick={() => handleAction("reject")}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-slate-900 hover:bg-red-950/60 hover:text-red-400 text-slate-400 border border-slate-800 transition active:scale-95 disabled:opacity-50"
              >
                <XCircle className="w-3.5 h-3.5" /> Reject
              </button>
            </div>
          )}
        </div>
      </div>

      {action.rollback_info?.description && (
        <p className="mt-3.5 text-xs text-slate-300 leading-relaxed border-t border-white/5 pt-3">
          {action.rollback_info.description}
        </p>
      )}

      {action.rollback_info?.rollback && (
        <div className="mt-3 flex items-start gap-2.5 bg-black/60 p-3 rounded-xl border border-slate-800/80 text-[11px] font-mono text-slate-400 shadow-inner">
          <Terminal className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
          <div className="overflow-x-auto w-full">
            <span className="text-slate-500 font-sans block text-[10px] uppercase font-bold tracking-wider mb-0.5">
              Automated Rollback Command:
            </span>
            <code className="text-cyan-300 block">{action.rollback_info.rollback}</code>
          </div>
        </div>
      )}
    </div>
  );
};
