interface LoadingSpinnerProps {
  text?: string;
  fullPage?: boolean;
}

export default function LoadingSpinner({ text, fullPage = true }: LoadingSpinnerProps) {
  return (
    <div className={`flex flex-col items-center justify-center w-full gap-4 ${fullPage ? 'min-h-[400px]' : 'py-12'}`}>
      <div className="relative">
        <div className="w-10 h-10 border-[3px] border-white/[0.08] border-t-accent-primary rounded-full animate-spin" />
        <div className="absolute inset-0 w-10 h-10 border-[3px] border-transparent border-b-accent-secondary/40 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
      </div>
      {text && <p className="text-sm text-text-muted animate-pulse">{text}</p>}
    </div>
  );
}
