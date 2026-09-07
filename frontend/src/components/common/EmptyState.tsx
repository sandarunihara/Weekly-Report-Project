import { Inbox } from 'lucide-react';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export default function EmptyState({
  title = 'No data found',
  message = 'There is nothing to display here yet.',
  icon,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 sm:py-20 px-6 text-center bg-[#111827]/ backdrop-blur-sm rounded-2xl border border-dashed border-white/[0.08] max-w-2xl mx-auto my-6 animate-[fadeIn_0.4s_ease]">
      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/[0.03] rounded-2xl flex items-center justify-center mb-5 border border-white/[0.06]">
        {icon || <Inbox size={36} className="text-text-muted" strokeWidth={1.5} />}
      </div>
      <h3 className="text-lg sm:text-xl font-bold text-text-primary mb-2">{title}</h3>
      <p className="text-text-secondary text-sm max-w-sm leading-relaxed">{message}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
