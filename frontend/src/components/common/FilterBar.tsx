import type { ReactNode } from 'react';
import { Filter } from 'lucide-react';

interface FilterBarProps {
  children: ReactNode;
  resultCount?: number;
  resultLabel?: string;
}

export default function FilterBar({ children, resultCount, resultLabel = 'results' }: FilterBarProps) {
  return (
    <div className="bg-[#111827]/ backdrop-blur-xl border border-white/[0.06] rounded-2xl p-4 sm:p-5 shadow-lg flex flex-wrap items-center gap-3 sm:gap-4">
      <div className="flex items-center gap-2 text-text-muted px-1 shrink-0">
        <Filter size={16} />
        <span className="text-xs font-bold uppercase tracking-wider hidden sm:inline">Filters</span>
      </div>
      <div className="hidden sm:block w-px h-6 bg-border-color/50" />
      <div className="flex items-center gap-3 flex-wrap flex-1">
        {children}
      </div>
      {resultCount !== undefined && (
        <span className="text-xs font-semibold text-text-muted bg-white/5 px-3 py-1.5 rounded-lg border border-white/[0.06] shrink-0 ml-auto">
          {resultCount} {resultLabel}
        </span>
      )}
    </div>
  );
}
