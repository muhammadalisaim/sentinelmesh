import React, { useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { api } from "@/api";
import { Shield, Lock, Mail, ArrowRight, RefreshCw, AlertCircle, Eye, EyeOff, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("analyst@sentinelmesh.ai");
  const [password, setPassword] = useState("sentinel123");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"analyst" | "admin" | "saim">("analyst");

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
        }, 500);
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed. Please check credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (role: "analyst" | "admin" | "saim") => {
    setSelectedRole(role);
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
        <title>Login | SentinelMesh Autonomous AI SOC</title>
      </Head>

      <div className="min-h-screen bg-[#070b14] flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans">
        {/* Soft Ambient Radial Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-cyan-600/10 rounded-full blur-[130px] pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-red-600/5 rounded-full blur-[100px] pointer-events-none" />

        {/* Clean Centered Card */}
        <div className="w-full max-w-[420px] relative z-10 animate-fade-in-up">
          <div className="bg-[#0e1626]/90 backdrop-blur-xl border border-slate-800/90 hover:border-slate-700/80 rounded-2xl p-7 sm:p-9 shadow-2xl shadow-black/80 space-y-6 transition-all">
            
            {/* Header: Shield Icon & Title */}
            <div className="text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-600 via-sky-600 to-blue-700 mx-auto flex items-center justify-center shadow-lg shadow-cyan-950/60 border border-cyan-400/30">
                <Shield className="w-7 h-7 text-white" />
              </div>
              
              <div>
                <h1 className="text-2xl sm:text-[26px] font-extrabold text-white tracking-tight">
                  Sentinel<span className="text-cyan-400">Mesh</span>
                </h1>
                <p className="text-xs text-slate-400 font-medium mt-1">
                  Autonomous AI SOC on AMD GPU
                </p>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/50 text-xs text-red-300 flex items-center gap-2.5 animate-fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/50 text-xs text-emerald-300 flex items-center gap-2.5 animate-fade-in">
                <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
                <span className="font-medium">Access Granted. Loading SOC Dashboard...</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Officer Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="analyst@sentinelmesh.ai"
                    className="w-full bg-[#090e1a] border border-slate-700/80 rounded-xl pl-10 pr-3 py-2.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 transition"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Secret Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-[#090e1a] border border-slate-700/80 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-200 transition"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || success}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-950/50 hover:shadow-cyan-900/60 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>Authenticating...</span>
                  </>
                ) : success ? (
                  <>
                    <ShieldCheck className="w-4 h-4 text-white" />
                    <span>Verified</span>
                  </>
                ) : (
                  <>
                    <span>Authenticate SOC Session</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Pre-fills */}
            <div className="pt-4 border-t border-slate-800/80 space-y-2.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 block text-center tracking-wider">
                Demo Instant Access
              </span>
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleQuickLogin("analyst")}
                  className={`py-2 px-3 rounded-xl border text-[11px] font-semibold transition text-center ${
                    selectedRole === "analyst"
                      ? "bg-cyan-950/60 border-cyan-500/60 text-cyan-300 shadow-sm"
                      : "bg-[#090e1a] hover:bg-slate-800/80 border-slate-700/80 text-slate-300"
                  }`}
                >
                  SOC Analyst
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin("admin")}
                  className={`py-2 px-3 rounded-xl border text-[11px] font-semibold transition text-center ${
                    selectedRole === "admin"
                      ? "bg-purple-950/60 border-purple-500/60 text-purple-300 shadow-sm"
                      : "bg-[#090e1a] hover:bg-slate-800/80 border-slate-700/80 text-slate-300"
                  }`}
                >
                  SOC Admin
                </button>
              </div>

              {/* Lead Officer MAS Profile button */}
              <button
                type="button"
                onClick={() => handleQuickLogin("saim")}
                className={`w-full py-1.5 px-3 rounded-xl border text-[11px] font-semibold transition text-center flex items-center justify-center gap-1.5 ${
                  selectedRole === "saim"
                    ? "bg-red-950/60 border-red-500/60 text-red-300 shadow-sm"
                    : "bg-[#090e1a] hover:bg-slate-800/80 border-slate-800 text-slate-400"
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Muhammad Ali Saim (Lead Officer)</span>
              </button>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
