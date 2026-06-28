"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle({ className = "h-9 w-9 rounded-md" }: { className?: string }) {
  const { setTheme } = useTheme();

  const toggle = () => {
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <button
      type="button"
      aria-label="Toggle theme"
      onClick={toggle}
      className={`inline-flex items-center justify-center border border-hairline-strong bg-surface-elevated text-ink transition-colors hover:border-overlay-strong hover:bg-overlay ${className}`}
    >
      <Moon className="h-[18px] w-[18px] dark:hidden" strokeWidth={1.5} />
      <Sun className="hidden h-[18px] w-[18px] dark:block" strokeWidth={1.5} />
    </button>
  );
}
