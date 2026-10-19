import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { 
  LayoutDashboard, BellRing, ShieldAlert, FileText, 
  BarChart3, PlayCircle, ShieldCheck, Cpu, ChevronRight, X
} from "lucide-react";

interface Props {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<Props> = ({ mobileOpen, onCloseMobile }) => {
  const router = useRouter();

  const links = [
    { label: "SOC Dashboard", href: "/", icon: LayoutDashboard, badge: "Live" },
    { label: "Alerts Triage", href: "/alerts", icon: BellRing },
    { label: "Incidents Registry", href: "/incidents", icon: ShieldAlert, badge: "Audit" },
    { label: "Bilingual Reports", href: "/reports", icon: FileText, badge: "Urdu/EN" },
    { label: "AMD Benchmarks", href: "/benchmark", icon: BarChart3 },
    { label: "Attack Simulator", href: "/simulator", icon: PlayCircle, highlight: true },
  ];

  const content = (
    <div className="h-full flex flex-col justify-between p-4">
      <div className="space-y-1.5">
        <div className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono flex items-center justify-between">
          <span>Command Navigation</span>
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
        </div>

        {links.map((link) => {
          const Icon = link.icon;
          const isActive = router.pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onCloseMobile}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 group ${
                isActive
                  ? "bg-gradient-to-r from-cyan-600/25 to-blue-600/15 text-cyan-300 border border-cyan-500/50 shadow-lg shadow-cyan-950/40 translate-x-1"
                  : link.highlight
                  ? "text-red-400 bg-red-950/20 hover:bg-red-950/40 border border-red-900/30 hover:translate-x-1"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/70 hover:translate-x-1"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                  isActive ? "text-cyan-400" : link.highlight ? "text-red-400" : "text-slate-400"
                }`} />
                <span>{link.label}</span>
              </div>

              {link.badge && (
                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                  isActive
                    ? "bg-cyan-500/30 text-cyan-200"
                    : "bg-slate-800 text-slate-400"
                }`}>
                  {link.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Bottom Hardware Card */}
      <div className="space-y-3 pt-4 border-t border-white/5">
        <div className="p-3.5 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-slate-800/80 shadow-xl space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-mono text-[10px] uppercase font-bold flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-red-500" /> AMD ROCm Telemetry
            </span>
            <span className="text-emerald-400 text-[10px] font-mono font-bold">138.5 tok/s</span>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>HBM2e VRAM</span>
              <span className="font-mono text-cyan-300">18.4 / 128 GB</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full w-[14%]" />
            </div>
          </div>

          <div className="pt-1 flex items-center justify-between text-[10px] font-mono text-slate-500">
            <span>Temp: 48°C</span>
            <span>Clock: 1.7 GHz</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-900 text-center">
          <p className="text-[10px] text-slate-500 font-mono">
            SentinelMesh v1.0 • Lablab Hackathon
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="w-64 border-r border-white/10 glass-panel min-h-[calc(100vh-4rem)] hidden md:block shrink-0 sticky top-16">
        {content}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onCloseMobile}
          />
          <div className="relative w-72 max-w-[85vw] h-full glass-panel-elevated shadow-2xl z-10 flex flex-col">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <span className="font-bold text-sm text-white">Menu Navigation</span>
              <button
                onClick={onCloseMobile}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {content}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
