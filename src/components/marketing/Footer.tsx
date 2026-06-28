import Link from "next/link";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="sticky bottom-0 left-0 z-0 h-80 w-full overflow-hidden border-t border-red-500/10 bg-[#fff7f3]">
      <div className="relative flex h-full w-full items-start justify-between gap-8 px-6 py-10 text-right text-[#d82f43] sm:px-10 lg:px-12">
        <div className="max-w-sm text-left">
          <p className="text-xs uppercase tracking-[0.28em] text-[#d82f43]/70">Bangladesh creator commerce</p>
          <p className="mt-3 text-sm leading-relaxed text-[#4f2026]/75">
            Track orders, filter fraud, and pay creators from one marketplace built for Shopify brands.
          </p>
          <p className="mt-6 text-xs text-[#4f2026]/55">
            &copy; {year} Instant<span className="font-bold text-[#d82f43]">/</span>Creator
          </p>
        </div>

        <div className="flex flex-row gap-10 text-sm font-medium sm:gap-14 md:gap-20 md:text-lg">
          <ul className="space-y-2">
            <li>
              <Link href="#problem" className="hover:underline">Problem</Link>
            </li>
            <li>
              <Link href="#how-it-works" className="hover:underline">How It Works</Link>
            </li>
            <li>
              <Link href="#features" className="hover:underline">Features</Link>
            </li>
          </ul>
          <ul className="space-y-2">
            <li>
              <Link href="#pricing" className="hover:underline">Pricing</Link>
            </li>
            <li>
              <Link href="/privacy" className="hover:underline">Privacy</Link>
            </li>
            <li>
              <Link href="/terms" className="hover:underline">Terms</Link>
            </li>
          </ul>
        </div>

        <h2 className="pointer-events-none absolute bottom-0 left-0 translate-y-[32%] whitespace-nowrap text-[72px] font-black leading-none tracking-[-0.08em] text-[#ff5941] opacity-95 sm:text-[128px] md:text-[176px] lg:text-[216px]">
          Instant<span className="text-[#d82f43]">/</span>Creator
        </h2>
      </div>
    </footer>
  );
}
