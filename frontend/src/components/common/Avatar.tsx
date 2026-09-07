type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  name: string;
  size?: AvatarSize;
  className?: string;
}

const sizeClasses: Record<AvatarSize, { container: string; text: string }> = {
  sm: { container: 'w-8 h-8', text: 'text-xs' },
  md: { container: 'w-10 h-10', text: 'text-sm' },
  lg: { container: 'w-14 h-14', text: 'text-lg' },
  xl: { container: 'w-20 h-20', text: 'text-2xl' },
};

export default function Avatar({ name, size = 'md', className = '' }: AvatarProps) {
  const initials = name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2) || 'U';

  const s = sizeClasses[size];

  return (
    <div
      className={`
        ${s.container} rounded-full
        bg-gradient-to-br from-accent-primary to-accent-secondary
        flex items-center justify-center
        ${s.text} font-bold text-white
        shadow-[0_0_12px_rgba(139,92,246,0.25)]
        border border-white/10 shrink-0
        ${className}
      `}
    >
      {initials}
    </div>
  );
}
