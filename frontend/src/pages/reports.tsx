import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { api } from "@/api";
import { SeverityBadge } from "@/components/SeverityBadge";
import { 
  FileText, Download, Globe, Shield, RefreshCw, 
  ExternalLink, Printer, Check, ShieldCheck, Sparkles, AlertTriangle 
} from "lucide-react";

export default function ReportsPage() {
  const router = useRouter();
  const [incidents, setIncidents] = useState<any[]>([]);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>("");
  const [reports, setReports] = useState<any[]>([]);
  const [lang, setLang] = useState<"en" | "ur">("ur"); // Default to Urdu for high impact!
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getIncidents().then((data) => {
      setIncidents(data);
      const incId = (router.query.incident_id as string) || (data[0]?.id || "");
      setSelectedIncidentId(incId);
    }).catch(console.error).finally(() => setLoading(false));
  }, [router.query.incident_id]);

  useEffect(() => {
    if (selectedIncidentId) {
      api.getReports(selectedIncidentId)
        .then(setReports)
        .catch(console.error);
    }
  }, [selectedIncidentId]);

  const activeReport = reports.find((r) => r.lang === lang) || reports[0];
  const activeIncident = incidents.find((i) => i.id === selectedIncidentId);
  const downloadUrl = selectedIncidentId ? api.getDownloadPdfUrl(selectedIncidentId, lang) : "#";

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in-up">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-rose-600 text-white tracking-widest shimmer-badge">
              Automated Forensic Reports
            </span>
            <span className="text-xs text-slate-400 font-mono">Bilingual Synthesis</span>
          </div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-rose-400 animate-pulse" />
            Executive & Technical Briefings
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Compiled autonomously by SentinelMesh Reporter Agent in both technical English and native Urdu (Nastaliq RTL) for corporate stakeholders.
          </p>
        </div>

        {/* Action Bar */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Incident Selector */}
          <select
            value={selectedIncidentId}
            onChange={(e) => setSelectedIncidentId(e.target.value)}
            className="bg-slate-950/90 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500 shadow-md"
          >
            {incidents.map((inc) => (
              <option key={inc.id} value={inc.id}>
                {inc.title} ({inc.id.slice(0, 8)})
              </option>
            ))}
          </select>

          {/* Language Toggle Pill */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1 text-xs font-bold shadow-inner">
            <button
              onClick={() => setLang("en")}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                lang === "en"
                  ? "bg-cyan-600 text-white shadow-md font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Globe className="w-3.5 h-3.5" /> English
            </button>
            <button
              onClick={() => setLang("ur")}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 font-urdu text-sm ${
                lang === "ur"
                  ? "bg-rose-600 text-white shadow-md font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              اردو (Urdu)
            </button>
          </div>

          {/* Download PDF Button */}
          <a
            href={downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-xs font-black uppercase tracking-wider shadow-xl shadow-rose-950/50 transition hover:-translate-y-0.5 active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            Download PDF
          </a>
        </div>
      </div>

      {/* Report Canvas Container */}
      <div className="glass-panel-elevated rounded-2xl overflow-hidden shadow-2xl border border-white/10 animate-fade-in-up-1">
        {/* Banner Bar */}
        <div className="px-6 py-4 bg-slate-950/90 border-b border-white/10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-rose-600 to-indigo-700 text-white shadow-md">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-sm text-white">SentinelMesh Incident Dossier</span>
                {activeIncident && <SeverityBadge severity={activeIncident.severity} size="sm" />}
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                Format: {lang === "ur" ? "Urdu Nastaliq (اردو)" : "English Technical Specification"} • AMD ROCm Local Engine
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="text-right hidden sm:block">
              <span className="text-[10px] text-slate-500 block uppercase font-bold">Data Privacy Guarantee</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Zero Cloud Transmission
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Report Content Body */}
        <div
          dir={lang === "ur" ? "rtl" : "ltr"}
          className={`p-6 sm:p-10 text-slate-200 leading-relaxed ${
            lang === "ur" ? "text-right font-urdu text-base sm:text-lg" : "text-left font-sans text-sm"
          }`}
        >
          {loading ? (
            <p className="text-slate-500 py-16 text-center font-sans text-xs">Loading incident report...</p>
          ) : !activeReport ? (
            <div className="py-20 text-center text-slate-500 font-sans space-y-3">
              <FileText className="w-10 h-10 mx-auto opacity-30 text-rose-400" />
              <p className="text-sm font-semibold">No report generated yet for this incident.</p>
              <p className="text-xs text-slate-600 max-w-sm mx-auto">
                Trigger an investigation from the dashboard or simulator to compile a dual-language executive briefing.
              </p>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Header Box inside Report */}
              <div className={`p-4 rounded-xl border border-white/10 ${lang === "ur" ? "bg-rose-950/20" : "bg-cyan-950/20"} space-y-1`}>
                <div className="text-xs font-mono text-slate-400">
                  {lang === "ur" ? "شناختی نمبر:" : "Case Reference:"} {activeIncident?.id}
                </div>
                <div className="text-xs font-mono text-slate-400">
                  {lang === "ur" ? "اخراج کی روک تھام:" : "Hardware Acceleration:"} AMD Instinct MI250X (ROCm 6.2)
                </div>
              </div>

              {/* Main Text */}
              <div className="bg-slate-950/60 p-6 sm:p-8 rounded-2xl border border-slate-800 shadow-inner whitespace-pre-wrap leading-relaxed">
                {activeReport.content_md}
              </div>

              {/* Official Seal / Footer Note */}
              <div className="pt-6 border-t border-white/10 text-center text-xs font-mono text-slate-500">
                {lang === "ur" 
                  ? "سینٹینل میش خودکار اے آئی ایس او سی • تمام حقوق محفوظ ہیں • اے ایم ڈی روکم پلیٹ فارم"
                  : "SentinelMesh Autonomous AI SOC • All Rights Reserved • AMD ROCm Platform Verified"
                }
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
