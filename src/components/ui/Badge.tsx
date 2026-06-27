interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}

export function Badge({ children, className = "", dot = false }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full bg-surface-elevated border border-hairline-strong px-3 py-1 text-xs text-body ${className}`}
    >
      {dot && (
        <span className="h-1.5 w-1.5 rounded-full bg-accent-green" />
      )}
      {children}
    </span>
  );
}
