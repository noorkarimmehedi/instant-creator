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
        <p className="text-xs font-medium tracking-[1.5px] uppercase text-mute mb-4">
          {label}
        </p>
      )}
      <h2
        className="font-display text-5xl font-normal leading-[1.05] tracking-tight"
        dangerouslySetInnerHTML={{ __html: title }}
      />
      {subtitle && (
        <p className="text-[17px] text-charcoal mt-3.5 leading-normal">
          {subtitle}
        </p>
      )}
    </div>
  );
}
