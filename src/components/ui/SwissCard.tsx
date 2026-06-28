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
        hover:border-overlay-strong hover:-translate-y-0.5 hover:shadow-card
        ${onClick ? "cursor-pointer" : ""}
        ${className}
      `}
    >
      <span className="absolute top-2.5 left-3 text-sm font-light text-marks transition-all duration-300 group-hover:text-marks-strong group-hover:rotate-90 leading-none select-none">+</span>
      <span className="absolute top-2.5 right-3 text-sm font-light text-marks transition-all duration-300 group-hover:text-marks-strong leading-none select-none">+</span>
      <span className="absolute bottom-2.5 left-3 text-sm font-light text-marks transition-all duration-300 group-hover:text-marks-strong group-hover:rotate-90 leading-none select-none">+</span>
      <span className="absolute bottom-2.5 right-3 text-sm font-light text-marks transition-all duration-300 group-hover:text-marks-strong leading-none select-none">+</span>
      {children}
    </div>
  );
}
