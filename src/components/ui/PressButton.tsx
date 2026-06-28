import Link from "next/link";

type PressButtonTone = "brand" | "creator" | "ink";

interface PressButtonProps {
  children: React.ReactNode;
  tone?: PressButtonTone;
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

export function PressButton({
  children,
  tone = "brand",
  href,
  type = "button",
  className = "",
}: PressButtonProps) {
  const toneClasses = tones[tone];
  const classes = `group relative inline-block h-[42px] shrink-0 cursor-pointer border-0 bg-transparent p-0 font-sans text-sm font-semibold tracking-[-0.005em] text-white outline-offset-4 [-webkit-tap-highlight-color:transparent] focus-visible:rounded-[12px] focus-visible:outline-2 focus-visible:outline-offset-[6px] ${toneClasses.focus} ${className}`;
  const content = (
    <>
      <span className="absolute inset-0 rounded-[12px] bg-black/25 translate-y-px transition-transform duration-[600ms] ease-[cubic-bezier(0.3,0.7,0.4,1)] will-change-transform group-hover:translate-y-0.5 group-hover:duration-[250ms] group-hover:ease-[cubic-bezier(0.3,0.7,0.4,1.5)] group-active:translate-y-0 group-active:duration-[34ms]" />
      <span className={`absolute inset-0 rounded-[12px] ${toneClasses.edge}`} />
      <span className={`relative flex h-10 items-center justify-center rounded-[12px] px-5 text-white translate-y-[-2px] transition-transform duration-[600ms] ease-[cubic-bezier(0.3,0.7,0.4,1)] will-change-transform group-hover:translate-y-[-3px] group-hover:duration-[250ms] group-hover:ease-[cubic-bezier(0.3,0.7,0.4,1.5)] group-active:translate-y-[-1px] group-active:duration-[34ms] ${toneClasses.front}`}>
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
