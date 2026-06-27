import Link from "next/link";

type ButtonVariant = "primary" | "ghost" | "outline";

interface ButtonProps {
  children: React.ReactNode;
  variant?: ButtonVariant;
  href?: string;
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit";
}

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-ink text-canvas hover:bg-[#e8e9eb]",
  ghost:
    "bg-surface-elevated text-ink border border-hairline-strong hover:border-white/25",
  outline:
    "bg-transparent text-ink border border-hairline-strong hover:border-white/30 hover:bg-white/[0.04]",
};

export function Button({
  children,
  variant = "primary",
  href,
  className = "",
  onClick,
  type = "button",
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-[8px] px-5 py-2 text-sm font-medium transition-all duration-200 hover:-translate-y-px cursor-pointer";
  const classes = `${base} ${variants[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} className={classes}>
      {children}
    </button>
  );
}
