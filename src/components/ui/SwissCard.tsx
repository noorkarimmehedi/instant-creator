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
  const highlightClass = highlighted
    ? "ring-2 ring-accent-blue"
    : "";

  return (
    <div
      onClick={onClick}
      className={`
        group relative overflow-hidden rounded-[6px] p-5
        bg-[#E3E3E3]/80 shadow-[0_2px_4px_0_rgba(0,0,0,0.10),0_0_0_1px_rgba(0,0,0,0.16),inset_0_1px_0_0_#FDFDFD]
        transition-all duration-300
        hover:-translate-y-px hover:shadow-[0_4px_8px_0_rgba(0,0,0,0.12),0_0_0_1px_rgba(0,0,0,0.16),inset_0_1px_0_0_#FDFDFD]
        ${highlightClass}
        ${onClick ? "cursor-pointer" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
