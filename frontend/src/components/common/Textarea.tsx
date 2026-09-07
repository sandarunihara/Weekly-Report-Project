import type { TextareaHTMLAttributes } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export default function Textarea({
  label,
  error,
  className = '',
  id,
  ...props
}: TextareaProps) {
  const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={textareaId} className="text-sm font-medium text-text-secondary">
          {label}
          {props.required && <span className="text-error ml-0.5">*</span>}
        </label>
      )}
      <textarea
        id={textareaId}
        className={`
          w-full bg-[#1f2937] border rounded-xl text-sm text-text-primary
          py-2.5 px-3.5
          placeholder:text-text-muted
          focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-[#8b5cf6]
          transition-all duration-200 resize-y min-h-[120px]
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? 'border-[#ef4444] focus:border-error focus:ring-[#ef4444]' : 'border-border-color'}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="text-xs text-error flex items-center gap-1 mt-0.5">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          {error}
        </p>
      )}
    </div>
  );
}
