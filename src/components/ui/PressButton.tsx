import Link from "next/link";

type PressButtonTone = "brand" | "creator" | "ink";
type PressButtonSize = "default" | "compact";

interface PressButtonProps {
  children: React.ReactNode;
  tone?: PressButtonTone;
  size?: PressButtonSize;
  href?: string;
  type?: "button" | "submit";
  className?: string;
}

const tones: Record<PressButtonTone, { front: string; edge: string; focus: string }> = {
  brand: {
    front: "bg-[#2f6df6]",
    edge: "bg-[linear-gradient(to_left,#102864_0%,#1d4fc7_8%,#1d4fc7_92%,#102864_100%)]",
    focus: "focus-visible:outline-[#173d94]",
  },
  creator: {
    front: "bg-[#f00045]",
    edge: "bg-[linear-gradient(to_left,#520019_0%,#a30037_8%,#a30037_92%,#520019_100%)]",
    focus: "focus-visible:outline-[#a30037]",
  },
  ink: {
    front: "bg-[#181818]",
    edge: "bg-[linear-gradient(to_left,#050505_0%,#2f2f2f_8%,#2f2f2f_92%,#050505_100%)]",
    focus: "focus-visible:outline-[#1a1614]",
  },
};

const sizes: Record<PressButtonSize, { root: string; front: string; radius: string }> = {
  default: {
    root: "h-[42px] text-sm",
    front: "h-10 px-5",
    radius: "rounded-[12px]",
  },
  compact: {
    root: "h-9 text-[13px]",
    front: "h-[34px] px-4",
    radius: "rounded-[10px]",
  },
};

export function PressButton({
  children,
  tone = "brand",
  size = "default",
  href,
  type = "button",
  className = "",
}: PressButtonProps) {
  const toneClasses = tones[tone];
  const sizeClasses = sizes[size];
  const classes = `group relative inline-block ${sizeClasses.root} shrink-0 cursor-pointer border-0 bg-transparent p-0 font-sans font-semibold tracking-[-0.005em] text-white outline-offset-4 [-webkit-tap-highlight-color:transparent] focus-visible:${sizeClasses.radius} focus-visible:outline-2 focus-visible:outline-offset-[6px] ${toneClasses.focus} ${className}`;
  const content = (
    <>
      <span className={`absolute inset-0 ${sizeClasses.radius} bg-black/25 translate-y-px transition-transform duration-[600ms] ease-[cubic-bezier(0.3,0.7,0.4,1)] will-change-transform group-hover:translate-y-0.5 group-hover:duration-[250ms] group-hover:ease-[cubic-bezier(0.3,0.7,0.4,1.5)] group-active:translate-y-0 group-active:duration-[34ms]`} />
      <span className={`absolute inset-0 ${sizeClasses.radius} ${toneClasses.edge}`} />
      <span className={`relative flex ${sizeClasses.front} items-center justify-center ${sizeClasses.radius} text-white translate-y-[-2px] transition-transform duration-[600ms] ease-[cubic-bezier(0.3,0.7,0.4,1)] will-change-transform group-hover:translate-y-[-3px] group-hover:duration-[250ms] group-hover:ease-[cubic-bezier(0.3,0.7,0.4,1.5)] group-active:translate-y-[-1px] group-active:duration-[34ms] ${toneClasses.front}`}>
        {children}
      </span>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }

  return (
    <button type={type} className={classes}>
      {content}
    </button>
  );
}
