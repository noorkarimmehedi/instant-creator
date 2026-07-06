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
        group relative overflow-hidden rounded-[8px] p-5
        bg-[#F7F7F7]/80 shadow-[0_2px_4px_0_rgba(0,0,0,0.05),0_0_0_1px_rgba(0,0,0,0.06)]
        ${highlightClass}
        ${onClick ? "cursor-pointer" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
