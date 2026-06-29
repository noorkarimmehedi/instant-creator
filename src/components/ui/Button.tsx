import Link from "next/link";

type ButtonVariant = "primary" | "ghost" | "outline" | "navbarPrimary" | "navbarToggle";

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
  navbarPrimary:
    "bg-gradient-to-br from-gray-100 to-gray-300 text-black shadow-sm hover:from-gray-200 hover:to-gray-400 hover:text-black",
  navbarToggle:
    "border border-[#333] bg-[rgba(31,31,31,0.62)] text-gray-300 hover:border-[#333] hover:bg-[rgba(31,31,31,0.78)] hover:text-white",
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
