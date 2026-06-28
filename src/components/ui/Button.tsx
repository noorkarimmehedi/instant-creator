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
    "bg-gradient-to-br from-ink to-ink/85 text-canvas shadow-sm hover:opacity-90 hover:shadow-md",
  ghost:
    "bg-surface-elevated text-ink border border-hairline-strong hover:border-overlay-strong hover:bg-overlay",
  outline:
    "bg-transparent text-ink border border-hairline-strong hover:border-overlay-strong hover:bg-overlay",
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
    "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2 text-sm font-medium transition-all duration-200 hover:-translate-y-px cursor-pointer";
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
