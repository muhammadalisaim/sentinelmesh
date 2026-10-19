import React, { useEffect, useState } from "react";
import { streamClient } from "../ws";
import { 
  Bot, CheckCircle2, Clock, Cpu, Shield, Search, 
  FileText, Activity, Terminal, ChevronDown, ChevronRight, Filter, Sparkles 
} from "lucide-react";

interface AgentStepData {
  agent: string;
  status: "thinking" | "completed";
  message?: string;
  output?: any;
  timestamp: string;
}

interface Props {
  initialSteps?: any[];
  incidentId?: string;
}

const AGENT_META: Record<string, { label: string; icon: any; color: string; border: string; bg: string }> = {
  triage: {
    label: "Triage Agent",
    icon: Shield,
    color: "text-amber-400",
    border: "border-amber-500/40",
    bg: "bg-amber-950/20"
  },
  investigator: {
    label: "Investigator Agent",
    icon: Search,
    color: "text-cyan-400",
    border: "border-cyan-500/40",
    bg: "bg-cyan-950/20"
  },
  threat_intel: {
    label: "Threat Intel Agent",
    icon: Activity,
    color: "text-violet-400",
    border: "border-violet-500/40",
    bg: "bg-violet-950/20"
  },
  responder: {
    label: "Responder Agent",
    icon: Bot,
    color: "text-emerald-400",
    border: "border-emerald-500/40",
    bg: "bg-emerald-950/20"
  },
  reporter: {
    label: "Reporter Agent",
    icon: FileText,
    color: "text-rose-400",
    border: "border-rose-500/40",
    bg: "bg-rose-950/20"
  }
};

export const AgentStream: React.FC<Props> = ({ initialSteps = [], incidentId }) => {
  const [liveEvents, setLiveEvents] = useState<AgentStepData[]>([]);
  const [filterAgent, setFilterAgent] = useState<string>("all");
  const [collapsedItems, setCollapsedItems] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const unsubscribe = streamClient.subscribe((data) => {
      if (data.type === "agent_thinking" || data.type === "agent_complete") {
        setLiveEvents((prev) => [
          ...prev,
          {
            agent: data.agent,
            status: data.status,
            message: data.message,
            output: data.output,
            timestamp: data.timestamp || new Date().toISOString()
          }
        ]);
      }
    });

    return () => unsubscribe();
  }, []);

  const allEvents = [
    ...initialSteps.map((s) => ({
      agent: s.agent_name,
      status: "completed" as const,
      message: `Processed ${s.tokens_in + s.tokens_out} tokens (${s.latency_ms}ms) on AMD ROCm`,
      output: s.output_json,
      timestamp: s.created_at
    })),
    ...liveEvents
  ];

  const filteredEvents = filterAgent === "all" 
    ? allEvents 
    : allEvents.filter((e) => e.agent === filterAgent);

  const toggleCollapse = (idx: number) => {
    setCollapsedItems((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className="glass-panel-elevated rounded-2xl overflow-hidden shadow-2xl border border-white/10 flex flex-col h-full">
      {/* Terminal Title Bar */}
      <div className="px-4 py-3 bg-slate-950/90 border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
          </div>
          <span className="text-slate-600 font-mono text-xs">|</span>
          <h3 className="font-mono font-bold text-xs text-slate-200 flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyan-400" />
            agent_orchestrator.stream
            <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-sans">
              AMD ROCm 6.2
            </span>
          </h3>
        </div>

        <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>vLLM PagedAttention Active</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="px-3 py-2 bg-slate-950/50 border-b border-white/5 flex items-center gap-1.5 overflow-x-auto text-[11px] font-mono">
        <button
          onClick={() => setFilterAgent("all")}
          className={`px-2.5 py-1 rounded-lg transition whitespace-nowrap ${
            filterAgent === "all"
              ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold"
              : "text-slate-400 hover:text-white"
          }`}
        >
          ALL ({allEvents.length})
        </button>
        {Object.entries(AGENT_META).map(([key, meta]) => {
          const count = allEvents.filter((e) => e.agent === key).length;
          return (
            <button
              key={key}
              onClick={() => setFilterAgent(key)}
              className={`px-2.5 py-1 rounded-lg transition whitespace-nowrap flex items-center gap-1.5 ${
                filterAgent === key
                  ? `${meta.bg} ${meta.color} border ${meta.border} font-bold`
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <span>{meta.label.split(" ")[0]}</span>
              {count > 0 && <span className="opacity-70">({count})</span>}
            </button>
          );
        })}
      </div>

      {/* Feed Container */}
      <div className="p-4 space-y-3 flex-1 overflow-y-auto font-mono text-xs max-h-[500px]">
        {filteredEvents.length === 0 ? (
          <div className="py-16 text-center text-slate-500 space-y-2">
            <Cpu className="w-8 h-8 mx-auto opacity-30 text-cyan-400 animate-pulse" />
            <p className="text-xs">Awaiting security telemetry ingestion...</p>
            <p className="text-[11px] text-slate-600 font-sans">
              Click &quot;Launch Attack&quot; from the simulator to watch all 5 AI agents reason live.
            </p>
          </div>
        ) : (
          filteredEvents.map((ev, idx) => {
            const meta = AGENT_META[ev.agent] || {
              label: ev.agent,
              icon: Bot,
              color: "text-slate-300",
              border: "border-slate-800",
              bg: "bg-slate-900"
            };
            const Icon = meta.icon;
            const isCollapsed = collapsedItems[idx];

            return (
              <div
                key={idx}
                className={`p-3.5 rounded-xl border transition-all ${meta.bg} ${meta.border} shadow-md animate-fade-in`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold border ${meta.border} ${meta.color} bg-black/40`}>
                      <Icon className="w-3.5 h-3.5" />
                      {meta.label}
                    </span>

                    {ev.status === "thinking" ? (
                      <span className="text-cyan-400 text-[11px] flex items-center gap-1.5 font-sans animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                        Inference Running on AMD MI250X...
                      </span>
                    ) : (
                      <span className="text-emerald-400 text-[10px] flex items-center gap-1 font-sans">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Completed
                      </span>
                    )}
                  </div>

                  <span className="text-[10px] text-slate-500">
                    {new Date(ev.timestamp).toLocaleTimeString()}
                  </span>
                </div>

                {ev.message && (
                  <p className="text-slate-300 text-[11px] font-sans mb-2 leading-relaxed">
                    {ev.message}
                  </p>
                )}

                {ev.output && (
                  <div className="mt-2">
                    <button
                      onClick={() => toggleCollapse(idx)}
                      className="text-[10px] font-mono text-cyan-400 flex items-center gap-1 hover:underline mb-1"
                    >
                      {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      {isCollapsed ? "Show Structured Agent Payload" : "Hide Payload"}
                    </button>

                    {!isCollapsed && (
                      <div className="bg-black/80 rounded-lg p-3 text-[11px] text-cyan-300 overflow-x-auto border border-cyan-950 shadow-inner">
                        <pre className="font-mono whitespace-pre-wrap leading-tight">
                          {JSON.stringify(ev.output, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
