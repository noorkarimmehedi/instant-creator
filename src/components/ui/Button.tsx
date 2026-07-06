import Link from "next/link";

type ButtonVariant = "primary" | "ghost" | "outline" | "navbarPrimary" | "navbarToggle" | "productAction" | "productActionLarge";

interface ButtonProps {
  children: React.ReactNode;
  variant?: ButtonVariant;
  href?: string;
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
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
  productAction:
    "relative inline-flex shrink-0 items-center justify-center cursor-pointer rounded-[8px] px-3 py-1.5 text-xs font-medium text-zinc-900 bg-[#E3E3E3]/80 shadow-[0_2px_4px_0_rgba(0,0,0,0.10),0_0_0_1px_rgba(0,0,0,0.16),inset_0_1px_0_0_#FDFDFD] disabled:cursor-wait disabled:opacity-50 transition-all hover:bg-[#E3E3E3] active:scale-[0.98] outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1a1614] gap-1",
  productActionLarge:
    "relative inline-flex shrink-0 items-center justify-center cursor-pointer rounded-[10px] px-6 py-2.5 text-sm font-medium text-zinc-900 bg-[#E3E3E3]/80 shadow-[0_2px_4px_0_rgba(0,0,0,0.10),0_0_0_1px_rgba(0,0,0,0.16),inset_0_1px_0_0_#FDFDFD] disabled:cursor-wait disabled:opacity-50 transition-all hover:bg-[#E3E3E3] active:scale-[0.98] outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1a1614] gap-2 h-10",
};

export function Button({
  children,
  variant = "primary",
  href,
  className = "",
  onClick,
  type = "button",
  disabled,
}: ButtonProps) {
  const base = variant === "productAction" || variant === "productActionLarge"
    ? "" 
    : "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2 text-sm font-medium transition-all duration-200 hover:-translate-y-px cursor-pointer";
  const classes = variant === "productAction" || variant === "productActionLarge"
    ? `${variants[variant]} ${className}`
    : `${base} ${variants[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={classes}>
      {children}
    </button>
  );
}
