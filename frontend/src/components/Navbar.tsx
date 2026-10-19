import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { 
  Shield, Cpu, Play, Terminal, User, Menu, X, 
  Activity, BellRing, ShieldAlert, FileText, BarChart3, PlayCircle 
} from "lucide-react";

interface Props {
  onToggleMobileMenu?: () => void;
  mobileMenuOpen?: boolean;
}

export const Navbar: React.FC<Props> = ({ onToggleMobileMenu, mobileMenuOpen }) => {
  const router = useRouter();

  return (
    <header className="h-16 border-b border-white/10 glass-panel sticky top-0 z-50 px-4 sm:px-6 flex items-center justify-between">
      {/* Left: Brand + Hamburger */}
      <div className="flex items-center gap-3">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 md:hidden hover:text-white"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        )}

        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-cyan-950/60 border border-cyan-400/40 group-hover:scale-105 transition-transform">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight text-white">
                Sentinel<span className="text-cyan-400 drop-shadow-[0_0_12px_rgba(6,182,212,0.6)]">Mesh</span>
              </span>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-red-600 text-white tracking-widest uppercase shadow-md shadow-red-900/40">
                ACT III
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono hidden sm:block">
              Autonomous AI SOC • AMD GPU Accelerator
            </p>
          </div>
        </Link>
      </div>

      {/* Center: Live Threat Status HUD (Desktop) */}
      <div className="hidden lg:flex items-center gap-3 px-4 py-1.5 rounded-full bg-slate-950/80 border border-slate-800/80 shadow-inner text-xs font-mono">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-slate-400">DEFENSE GRID:</span>
        <span className="text-emerald-400 font-bold">ONLINE</span>
        <span className="text-slate-700">|</span>
        <span className="text-slate-400">ZERO DATA EGRESS:</span>
        <span className="text-cyan-400 font-bold">ACTIVE</span>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* AMD ROCm Hardware Badge */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-950/70 to-slate-900 border border-red-500/30 text-xs font-mono shadow-md">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          <span className="text-slate-300 font-semibold">MI250X</span>
          <span className="text-slate-600">/</span>
          <span className="text-cyan-300 font-bold">ROCm 6.2</span>
        </div>

        {/* Quick Launch Simulator Button */}
        <Link
          href="/simulator"
          className="flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold shadow-lg shadow-red-950/60 transition-all hover:scale-105 active:scale-95"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span className="hidden xs:inline">Simulator</span>
        </Link>

        {/* Officer Avatar */}
        <div className="flex items-center gap-3 pl-2 sm:pl-3 border-l border-white/10">
          <div className="relative w-9 h-9 rounded-xl overflow-hidden ring-2 ring-cyan-500/50 shadow-lg shadow-cyan-950/60 shrink-0">
            <img
              src="/profile.jpg"
              alt="Muhammad Ali Saim"
              className="w-full h-full object-cover"
            />
            <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-slate-950" />
          </div>
          <div className="hidden lg:block text-left text-xs">
            <div className="font-extrabold text-slate-100">Muhammad Ali Saim</div>
            <div className="text-[10px] text-cyan-400 font-mono font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Lead SOC Officer
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
