import Link from "next/link";
import { PressButton } from "../ui/PressButton";
import { ThemeToggle } from "../ui/ThemeToggle";

const navLinks = [
  { href: "#problem", label: "Problem" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "#features", label: "Features" },
  { href: "#pricing", label: "Pricing" },
];

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-hairline backdrop-blur-xl bg-canvas/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2.5 text-ink font-medium">
          <span className="h-2 w-2 rounded-full bg-accent-green animate-[dot-pulse_2s_ease-in-out_infinite]" />
          <span className="text-[15px] tracking-tight">
            Instant<span className="font-bold text-accent-red">/</span>Creator
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="group relative text-sm text-charcoal transition-colors hover:text-ink"
            >
              {link.label}
              <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-ink transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2.5">
          <ThemeToggle className="h-8 w-8 rounded-[10px]" />
          <PressButton href="/sign-up" tone="brand" size="compact">
            Get Started
          </PressButton>
        </div>
      </div>
    </nav>
  );
}
