"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { BrandIcon } from "@/components/brand/BrandIcon";
import { ThemeToggle } from "./ThemeToggle";

type NavLink = {
  href: string;
  label: string;
};

function AnimatedNavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} className="group relative block h-4 overflow-hidden whitespace-nowrap text-[13px] leading-4">
      <span className="flex flex-col whitespace-nowrap transition-transform duration-300 ease-out group-hover:-translate-y-4">
        <span className="block h-4 whitespace-nowrap leading-4 text-gray-300">{children}</span>
        <span className="block h-4 whitespace-nowrap leading-4 text-white">{children}</span>
      </span>
    </a>
  );
}

export function MiniNavbar({ links }: { links: NavLink[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const headerShapeClass = isOpen ? "rounded-2xl" : "rounded-full";

  return (
    <header
      className={`fixed left-1/2 top-5 z-50 flex w-[calc(100%-2rem)] -translate-x-1/2 flex-col items-center border border-red-200/20 bg-[#5a1f27]/55 px-4 py-2.5 shadow-[0_18px_50px_rgba(90,31,39,0.22)] backdrop-blur-xl transition-[border-radius] duration-0 ease-in-out sm:w-auto sm:px-6 ${headerShapeClass}`}
    >
      <div className="flex w-full items-center justify-between gap-x-5 sm:gap-x-8">
        <Link href="/" className="flex items-center gap-2.5 text-white">
          <BrandIcon className="h-5 w-5 shrink-0" />
          <span className="whitespace-nowrap text-sm font-semibold tracking-tight">
            Zair&apos;s<span className="text-[#f00045]">/</span>Creator
          </span>
        </Link>

        <nav className="hidden items-center space-x-5 sm:flex">
          {links.map((link) => (
            <AnimatedNavLink key={link.href} href={link.href}>
              {link.label}
            </AnimatedNavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-2 sm:flex">
          <ThemeToggle className="h-8 w-12 rounded-full border-white/20 bg-gradient-to-br from-gray-100 to-gray-300 text-black shadow-sm hover:border-white/30 hover:from-gray-200 hover:to-gray-400 hover:text-black" />
          <div className="group relative">
            <div className="pointer-events-none absolute inset-0 -m-2 rounded-full bg-gray-100 opacity-35 blur-lg transition-all duration-300 ease-out group-hover:-m-3 group-hover:opacity-55 group-hover:blur-xl" />
            <Link
              href="/get-started"
              className="relative z-10 inline-flex h-8 items-center justify-center whitespace-nowrap rounded-full bg-gradient-to-br from-gray-100 to-gray-300 px-4 text-sm font-semibold text-black shadow-sm transition-all duration-200 hover:from-gray-200 hover:to-gray-400"
            >
              Get Started
            </Link>
          </div>
        </div>

        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center text-gray-300 transition-colors hover:text-white sm:hidden"
          onClick={() => setIsOpen((open) => !open)}
          aria-label={isOpen ? "Close menu" : "Open menu"}
          aria-expanded={isOpen}
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <div
        className={`flex w-full flex-col items-center overflow-hidden transition-all duration-300 ease-in-out sm:hidden ${
          isOpen ? "max-h-[420px] pt-4 opacity-100" : "max-h-0 pt-0 opacity-0 pointer-events-none"
        }`}
      >
        <nav className="flex w-full flex-col items-center space-y-4 text-base">
          {links.map((link) => (
            <a key={link.href} href={link.href} className="w-full text-center text-gray-300 transition-colors hover:text-white">
              {link.label}
            </a>
          ))}
        </nav>
        <div className="mt-4 flex w-full flex-col items-center gap-3">
          <ThemeToggle className="h-10 w-full rounded-full border-[#333] bg-[rgba(31,31,31,0.62)] text-gray-300 hover:border-white/50 hover:bg-white/10 hover:text-white" />
          <Link
            href="/get-started"
            className="inline-flex h-10 w-full items-center justify-center rounded-full bg-gradient-to-br from-gray-100 to-gray-300 px-4 text-sm font-semibold text-black transition-all duration-200 hover:from-gray-200 hover:to-gray-400"
          >
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}

export { MiniNavbar as Navbar };
