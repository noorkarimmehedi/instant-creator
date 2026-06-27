"use client";

interface SwissCardProps {
  children: React.ReactNode;
  className?: string;
  highlighted?: boolean;
  elevated?: boolean;
  onClick?: () => void;
}

export function SwissCard({
  children,
  className = "",
  highlighted = false,
  elevated = false,
  onClick,
}: SwissCardProps) {
  const bg = elevated ? "bg-surface-elevated" : "bg-surface-card";
  const highlightBorder = highlighted
    ? "border-accent-blue"
    : "border-hairline-strong";

  return (
    <div
      onClick={onClick}
      className={`
        group relative overflow-hidden rounded-[12px] border p-8
        ${bg} ${highlightBorder}
        transition-all duration-300
        hover:border-white/25 hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)]
        ${onClick ? "cursor-pointer" : ""}
        ${className}
      `}
    >
      <span className="absolute top-2.5 left-3 text-sm font-light text-white/[0.12] transition-all duration-300 group-hover:text-white/[0.35] group-hover:rotate-90 leading-none select-none">+</span>
      <span className="absolute top-2.5 right-3 text-sm font-light text-white/[0.12] transition-all duration-300 group-hover:text-white/[0.35] leading-none select-none">+</span>
      <span className="absolute bottom-2.5 left-3 text-sm font-light text-white/[0.12] transition-all duration-300 group-hover:text-white/[0.35] group-hover:rotate-90 leading-none select-none">+</span>
      <span className="absolute bottom-2.5 right-3 text-sm font-light text-white/[0.12] transition-all duration-300 group-hover:text-white/[0.35] leading-none select-none">+</span>
      {children}
    </div>
  );
}
