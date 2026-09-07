import type { ReportStatus } from '../../types';

const statusConfig: Record<string, { bg: string; dot: string; label: string }> = {
  DRAFT:             { bg: 'bg-white/[0.06] text-gray-300 border-white/[0.08]',                     dot: 'bg-gray-400',  label: 'Draft' },
  SUBMITTED:         { bg: 'bg-[#3b82f6]/ text-info border-[#3b82f6]/',                                     dot: 'bg-info',       label: 'Submitted' },
  NEEDS_CORRECTION:  { bg: 'bg-[#f59e0b]/ text-warning border-[#f59e0b]/',                            dot: 'bg-warning',    label: 'Needs Correction' },
  APPROVED:          { bg: 'bg-[#10b981]/ text-success border-[#10b981]/',                            dot: 'bg-success',    label: 'Approved' },
  NOT_STARTED:       { bg: 'bg-error/[0.08] text-error/80 border-[#ef4444]/',                           dot: 'bg-[#ef4444]/',   label: 'Not Started' },
  IN_PROGRESS:       { bg: 'bg-[#8b5cf6]/ text-accent-primary border-[#8b5cf6]/',       dot: 'bg-accent-primary', label: 'In Progress' },
  DONE:              { bg: 'bg-[#10b981]/ text-success border-[#10b981]/',                            dot: 'bg-success',    label: 'Done' },
  BLOCKED:           { bg: 'bg-[#ef4444]/ text-error border-[#ef4444]/',                                  dot: 'bg-error',      label: 'Blocked' },
};

export default function StatusBadge({ status }: { status: ReportStatus | string }) {
  const config = statusConfig[status] || { bg: 'bg-white/5 text-gray-300 border-white/10', dot: 'bg-gray-400', label: status };
  return (
    <span
      className={`
        inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
        text-[0.7rem] font-semibold border backdrop-blur-sm
        ${config.bg}
      `}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}
