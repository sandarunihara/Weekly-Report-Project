import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  backButton?: ReactNode;
}

export default function PageHeader({ title, subtitle, actions, backButton }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
      <div className="flex items-center gap-3 min-w-0">
        {backButton}
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="text-text-secondary text-sm mt-1 truncate">{subtitle}</p>
          )}
        </div>
      </div>
      {actions && (
        <div className="flex items-center gap-3 flex-wrap shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}
