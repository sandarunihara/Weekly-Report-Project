import type { InputHTMLAttributes, ReactNode } from 'react';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  leftIcon?: ReactNode;
  suffix?: string;
  inputSize?: 'sm' | 'md';
}

export default function Input({
  label,
  error,
  leftIcon,
  suffix,
  inputSize = 'md',
  className = '',
  id,
  ...props
}: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  const sizeClass = inputSize === 'sm' ? 'py-1.5 text-xs' : 'py-2.5 text-sm';

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-text-secondary">
          {label}
          {props.required && <span className="text-error ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
            {leftIcon}
          </div>
        )}
        <input
          id={inputId}
          className={`
            w-full bg-[#1f2937] border rounded-xl text-text-primary
            placeholder:text-text-muted
            focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-[#8b5cf6]
            transition-all duration-200
            disabled:opacity-50 disabled:cursor-not-allowed
            ${sizeClass}
            ${leftIcon ? 'pl-10' : 'pl-3.5'}
            ${suffix ? 'pr-12' : 'pr-3.5'}
            ${error ? 'border-[#ef4444] focus:border-error focus:ring-[#ef4444]' : 'border-border-color'}
            ${className}
          `}
          {...props}
        />
        {suffix && (
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-text-muted pointer-events-none">
            {suffix}
          </span>
        )}
      </div>
      {error && (
        <p className="text-xs text-error flex items-center gap-1 mt-0.5 animate-[fadeIn_0.2s_ease]">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          {error}
        </p>
      )}
    </div>
  );
}
