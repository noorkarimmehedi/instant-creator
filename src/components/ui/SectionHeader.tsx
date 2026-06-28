interface SectionHeaderProps {
  label?: string;
  title: string;
  subtitle?: string;
  className?: string;
}

export function SectionHeader({
  label,
  title,
  subtitle,
  className = "",
}: SectionHeaderProps) {
  return (
    <div className={`text-center mb-14 ${className}`}>
      {label && (
        <p className="text-xs font-semibold tracking-[0.28em] uppercase text-[#d82f43]/70 mb-4">
          {label}
        </p>
      )}
      <h2
        className="font-body text-5xl font-black leading-[0.95] tracking-[-0.06em] text-ink"
        dangerouslySetInnerHTML={{ __html: title }}
      />
      {subtitle && (
        <p className="text-[17px] text-[#4f2026]/75 mt-3.5 leading-normal">
          {subtitle}
        </p>
      )}
    </div>
  );
}
