import type { ReactNode, ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'ghost' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-gradient-to-br from-accent-primary to-accent-secondary text-white shadow-[0_0_15px_rgba(139,92,246,0.25)] hover:shadow-[0_0_25px_rgba(139,92,246,0.45)] hover:-translate-y-0.5',
  secondary:
    'bg-[#1f2937]/ text-text-primary border border-border-color hover:bg-white/10 hover:border-white/20',
  danger:
    'bg-error text-white hover:bg-red-600 hover:-translate-y-0.5',
  success:
    'bg-success text-white hover:bg-emerald-500 hover:-translate-y-0.5 shadow-[0_0_15px_rgba(16,185,129,0.25)]',
  ghost:
    'bg-transparent text-text-secondary hover:bg-white/5 hover:text-text-primary',
  outline:
    'bg-transparent border border-border-color text-text-primary hover:bg-white/5 hover:border-white/20',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-5 py-2.5 text-sm gap-2',
  lg: 'px-7 py-3.5 text-base gap-2.5',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  disabled,
  children,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      className={`
        inline-flex items-center justify-center rounded-xl font-semibold
        transition-all duration-200 whitespace-nowrap
        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-none
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 size={size === 'sm' ? 14 : 16} className="animate-spin" />
      ) : (
        leftIcon
      )}
      {children}
      {!loading && rightIcon}
    </button>
  );
}
