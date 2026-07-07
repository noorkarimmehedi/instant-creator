interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}

export function Badge({ children, className = "", dot = false }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center text-center text-balance gap-2 rounded-[12px] bg-surface-elevated border border-hairline-strong px-4 py-1.5 text-[13px] font-medium text-body ${className}`}
    >
      {dot && (
        <span className="h-1.5 w-1.5 rounded-full bg-accent-green" />
      )}
      {children}
    </span>
  );
}
