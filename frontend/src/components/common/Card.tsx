import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

interface CardHeaderProps {
  title: string;
  icon?: ReactNode;
  action?: ReactNode;
  subtitle?: string;
}

const paddingClasses = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-6 md:p-8',
};

export function Card({ children, className = '', hover = false, padding = 'md' }: CardProps) {
  return (
    <div
      className={`
        bg-[#111827]/ backdrop-blur-xl border border-white/[0.06] rounded-2xl shadow-lg
        ${hover ? 'transition-all duration-300 hover:border-[#8b5cf6]/ hover:shadow-[0_8px_30px_-10px_rgba(139,92,246,0.2)] hover:-translate-y-1' : ''}
        ${paddingClasses[padding]}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, icon, action, subtitle }: CardHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6 gap-4">
      <div className="flex items-center gap-2.5 min-w-0">
        {icon && <span className="shrink-0">{icon}</span>}
        <div className="min-w-0">
          <h3 className="text-lg font-bold text-text-primary truncate">{title}</h3>
          {subtitle && <p className="text-xs text-text-muted mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
