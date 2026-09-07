import type { ReactNode } from 'react';

type MetricColor = 'purple' | 'cyan' | 'green' | 'amber' | 'red' | 'blue';

interface MetricCardProps {
  icon: ReactNode;
  value: string | number;
  label: string;
  color?: MetricColor;
}

const colorMap: Record<MetricColor, { bg: string; text: string; glow: string }> = {
  purple: { bg: 'bg-[#8b5cf6]/', text: 'text-accent-primary', glow: 'hover:shadow-[0_8px_30px_-10px_rgba(139,92,246,0.25)]' },
  cyan: { bg: 'bg-[#06b6d4]/', text: 'text-accent-secondary', glow: 'hover:shadow-[0_8px_30px_-10px_rgba(6,182,212,0.25)]' },
  green: { bg: 'bg-[#10b981]/', text: 'text-success', glow: 'hover:shadow-[0_8px_30px_-10px_rgba(16,185,129,0.25)]' },
  amber: { bg: 'bg-[#f59e0b]/', text: 'text-warning', glow: 'hover:shadow-[0_8px_30px_-10px_rgba(245,158,11,0.25)]' },
  red: { bg: 'bg-[#ef4444]/', text: 'text-error', glow: 'hover:shadow-[0_8px_30px_-10px_rgba(239,68,68,0.25)]' },
  blue: { bg: 'bg-[#3b82f6]/', text: 'text-info', glow: 'hover:shadow-[0_8px_30px_-10px_rgba(59,130,246,0.25)]' },
};

export default function MetricCard({ icon, value, label, color = 'purple' }: MetricCardProps) {
  const c = colorMap[color];
  return (
    <div
      className={`
        bg-[#111827]/ backdrop-blur-xl border border-white/[0.06] rounded-2xl p-5
        flex flex-col gap-3 shadow-lg
        transition-all duration-300 hover:-translate-y-1 ${c.glow}
        group
      `}
    >
      <div className={`flex items-center gap-3 ${c.text}`}>
        <div className={`p-2 ${c.bg} rounded-lg group-hover:scale-110 transition-transform duration-300`}>
          {icon}
        </div>
        <span className="text-sm font-semibold">{label}</span>
      </div>
      <div className="text-3xl font-bold text-text-primary tracking-tight">{value}</div>
    </div>
  );
}
