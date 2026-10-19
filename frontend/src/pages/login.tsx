import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { api } from "@/api";
import { 
  Shield, Lock, Mail, ArrowRight, RefreshCw, AlertCircle, 
  Eye, EyeOff, ShieldCheck, Cpu, Terminal, KeyRound, Sparkles
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("analyst@sentinelmesh.ai");
  const [password, setPassword] = useState("sentinel123");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.login(email, password);
      if (res.access_token) {
        localStorage.setItem("sentinel_token", res.access_token);
        localStorage.setItem("sentinel_role", res.role || "analyst");
        setSuccess(true);
        setTimeout(() => {
          router.push("/");
        }, 600);
      }
    } catch (err: any) {
      setError(err.message || "Failed to authenticate SOC session. Please verify credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (role: "analyst" | "admin" | "saim") => {
    setError(null);
    if (role === "admin") {
      setEmail("admin@sentinelmesh.ai");
      setPassword("admin123");
    } else if (role === "saim") {
      setEmail("saim@sentinelmesh.ai");
      setPassword("sentinel123");
    } else {
      setEmail("analyst@sentinelmesh.ai");
      setPassword("sentinel123");
    }
  };

  return (
    <>
      <Head>
        <title>Authenticate SOC Session | SentinelMesh</title>
      </Head>

      <div className="min-h-screen bg-[#050811] flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden select-none">
        {/* Animated Cyber Grid & Glow Layers */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(6,182,212,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(6,182,212,0.03)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />
        <div className="absolute top-1/3 left-1/4 w-[350px] h-[350px] bg-red-600/10 rounded-full blur-[100px] pointer-events-none" />

        {/* Ambient Scanline */}
        <div className="cyber-scanline" />

        {/* Main Authentication Card */}
        <div className="w-full max-w-[440px] relative z-10 animate-fade-in-up">
          {/* Outer Glass Card */}
          <div className="relative bg-[#0b1120]/85 backdrop-blur-2xl border border-cyan-500/30 rounded-2xl p-7 sm:p-8 shadow-2xl shadow-black/90 space-y-6">
            
            {/* Cyber Corner HUD Accents */}
            <div className="absolute -top-[1px] -left-[1px] w-4 h-4 border-t-2 border-l-2 border-cyan-400 rounded-tl-lg pointer-events-none" />
            <div className="absolute -top-[1px] -right-[1px] w-4 h-4 border-t-2 border-r-2 border-cyan-400 rounded-tr-lg pointer-events-none" />
            <div className="absolute -bottom-[1px] -left-[1px] w-4 h-4 border-b-2 border-l-2 border-cyan-400 rounded-bl-lg pointer-events-none" />
            <div className="absolute -bottom-[1px] -right-[1px] w-4 h-4 border-b-2 border-r-2 border-cyan-400 rounded-br-lg pointer-events-none" />

            {/* Header: Shield Icon & Title */}
            <div className="text-center space-y-2">
              <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-700 mx-auto flex items-center justify-center shadow-xl shadow-cyan-950/80 border border-cyan-300/50 group animate-float">
                <div className="absolute inset-0 rounded-2xl bg-cyan-400/20 blur-md animate-ping" style={{ animationDuration: "3s" }} />
                <Shield className="w-7 h-7 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] relative z-10" />
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Sentinel<span className="text-cyan-400 drop-shadow-[0_0_12px_rgba(6,182,212,0.8)]">Mesh</span>
                </h1>
                <p className="text-[11px] uppercase tracking-widest text-slate-400 font-mono mt-1 font-semibold flex items-center justify-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  Autonomous AI SOC on AMD GPU
                </p>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-xl bg-red-950/60 border border-red-800/80 text-xs text-red-200 flex items-center gap-2.5 animate-fade-in shadow-lg shadow-red-950/40">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/80 text-xs text-emerald-200 flex items-center gap-2.5 animate-fade-in shadow-lg shadow-emerald-950/40">
                <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
                <span className="font-semibold">Authentication successful. Entering SOC grid...</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center justify-between">
                  <span>Officer Email</span>
                  <span className="text-[10px] text-slate-500 font-mono">RBAC ACCESS</span>
                </label>
                <div className="relative group">
                  <Mail className="w-4 h-4 text-slate-500 group-focus-within:text-cyan-400 absolute left-3.5 top-3 transition-colors" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="analyst@sentinelmesh.ai"
                    className="w-full bg-[#080d1a] border border-slate-800 rounded-xl pl-10 pr-3 py-2.5 text-xs font-mono text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition shadow-inner"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center justify-between">
                  <span>Secret Password</span>
                  <span className="text-[10px] text-slate-500 font-mono">ENCRYPTED</span>
                </label>
                <div className="relative group">
                  <Lock className="w-4 h-4 text-slate-500 group-focus-within:text-cyan-400 absolute left-3.5 top-3 transition-colors" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-[#080d1a] border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-xs font-mono text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300 transition"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || success}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-xs shadow-lg shadow-cyan-900/50 hover:shadow-cyan-500/40 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 flex items-center justify-center gap-2 group shimmer-badge"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : success ? (
                  <>
                    <ShieldCheck className="w-4 h-4 text-white" />
                    <span>Access Granted</span>
                  </>
                ) : (
                  <>
                    <span>Authenticate SOC Session</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Pre-fills */}
            <div className="pt-4 border-t border-slate-800/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1.5">
                  <KeyRound className="w-3 h-3 text-cyan-400" />
                  Demo Instant Access
                </span>
                <span className="text-[9px] text-slate-500 font-mono">1-CLICK AUTOFILL</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleQuickLogin("analyst")}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold transition text-center flex items-center justify-center gap-1.5 ${
                    email === "analyst@sentinelmesh.ai"
                      ? "bg-cyan-950/60 border-cyan-500/50 text-cyan-300 shadow-sm shadow-cyan-900/40"
                      : "bg-[#080d1a] hover:bg-slate-800/70 border-slate-800 text-slate-300"
                  }`}
                >
                  <Terminal className="w-3 h-3 text-cyan-400" />
                  SOC Analyst
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin("admin")}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold transition text-center flex items-center justify-center gap-1.5 ${
                    email === "admin@sentinelmesh.ai"
                      ? "bg-purple-950/60 border-purple-500/50 text-purple-300 shadow-sm shadow-purple-900/40"
                      : "bg-[#080d1a] hover:bg-slate-800/70 border-slate-800 text-slate-300"
                  }`}
                >
                  <Shield className="w-3 h-3 text-purple-400" />
                  SOC Admin
                </button>
              </div>

              {/* Lead Officer MAS profile quick access */}
              <button
                type="button"
                onClick={() => handleQuickLogin("saim")}
                className={`w-full py-1.5 px-3 rounded-xl border text-[11px] font-semibold transition text-center flex items-center justify-center gap-2 ${
                  email === "saim@sentinelmesh.ai"
                    ? "bg-red-950/60 border-red-500/50 text-red-300 shadow-sm shadow-red-900/40"
                    : "bg-[#080d1a] hover:bg-slate-800/70 border-slate-800/80 text-slate-400"
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
                <span>Muhammad Ali Saim (Lead Officer)</span>
              </button>
            </div>

            {/* Bottom Telemetry Footer */}
            <div className="pt-2 flex items-center justify-between text-[10px] text-slate-500 font-mono">
              <span className="flex items-center gap-1">
                <Cpu className="w-3 h-3 text-red-400" />
                AMD ROCm 6.2
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-cyan-400 font-semibold">Zero-Trust Active</span>
              <span className="text-slate-600">•</span>
              <span>vLLM PagedAttn</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
