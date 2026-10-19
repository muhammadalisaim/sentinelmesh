import React from "react";

interface Props {
  severity: string;
  size?: "sm" | "md" | "lg";
}

export const SeverityBadge: React.FC<Props> = ({ severity, size = "md" }) => {
  const sev = (severity || "low").toLowerCase();
  
  const styles: Record<string, { bg: string; text: string; border: string; glow: string; dot: string }> = {
    critical: {
      bg: "bg-red-950/80",
      text: "text-red-400",
      border: "border-red-600/60",
      glow: "shadow-[0_0_12px_rgba(239,68,68,0.4)]",
      dot: "bg-red-500 animate-ping"
    },
    high: {
      bg: "bg-orange-950/80",
      text: "text-orange-400",
      border: "border-orange-600/60",
      glow: "shadow-[0_0_12px_rgba(249,115,22,0.4)]",
      dot: "bg-orange-500"
    },
    medium: {
      bg: "bg-amber-950/80",
      text: "text-amber-400",
      border: "border-amber-600/60",
      glow: "shadow-[0_0_12px_rgba(245,158,11,0.4)]",
      dot: "bg-amber-500"
    },
    low: {
      bg: "bg-emerald-950/80",
      text: "text-emerald-400",
      border: "border-emerald-600/60",
      glow: "shadow-[0_0_12px_rgba(16,185,129,0.3)]",
      dot: "bg-emerald-500"
    },
  };

  const style = styles[sev] || styles.low;

  const sizeClasses: Record<string, string> = {
    sm: "text-[10px] px-2.5 py-0.5 tracking-wider",
    md: "text-xs px-3 py-1 tracking-wider",
    lg: "text-xs px-4 py-1.5 font-black tracking-widest",
  };

  return (
    <span
      className={`inline-flex items-center font-mono font-bold uppercase rounded-lg border shadow-sm ${
        style.bg
      } ${style.text} ${style.border} ${style.glow} ${sizeClasses[size]}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full mr-2 shrink-0 ${style.dot}`} />
      {sev}
    </span>
  );
};
