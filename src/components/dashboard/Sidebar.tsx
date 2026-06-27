"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";

const mainNav = [
  { href: "/dashboard", label: "Dashboard", icon: "◻" },
  { href: "/dashboard/products", label: "Products", icon: "◻" },
  { href: "/dashboard/influencers", label: "Influencers", icon: "◻" },
  { href: "/dashboard/orders", label: "Orders", icon: "◻" },
  { href: "/dashboard/payouts", label: "Payouts", icon: "◻" },
];

const settingsNav = [
  { href: "/dashboard/settings", label: "Settings", icon: "◻" },
];

export function Sidebar({ brandName, plan }: { brandName: string; plan: string }) {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-[240px] flex-col border-r border-hairline bg-surface-deep">
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-hairline">
        <span className="h-2 w-2 rounded-full bg-accent-green animate-[dot-pulse_2s_ease-in-out_infinite]" />
        <span className="text-[15px] font-medium tracking-tight text-ink">InstantCreator</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        <p className="px-2 mb-2 text-[10px] font-medium tracking-[1.5px] uppercase text-stone">
          Main
        </p>
        {mainNav.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 rounded-md px-2.5 py-2 text-sm transition-colors
                ${active ? "text-ink bg-surface-elevated border-l-2 border-accent-blue" : "text-charcoal hover:text-ink hover:bg-white/[0.03]"}
              `}
            >
              <span className="text-xs">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}

        <div className="my-4 h-px bg-hairline" />

        <p className="px-2 mb-2 text-[10px] font-medium tracking-[1.5px] uppercase text-stone">
          Settings
        </p>
        {settingsNav.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 rounded-md px-2.5 py-2 text-sm transition-colors
                ${active ? "text-ink bg-surface-elevated border-l-2 border-accent-blue" : "text-charcoal hover:text-ink hover:bg-white/[0.03]"}
              `}
            >
              <span className="text-xs">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-hairline px-4 py-4 flex items-center gap-3">
        <UserButton />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm text-ink">{brandName}</p>
          <p className="text-xs text-mute capitalize">{plan}</p>
        </div>
      </div>
    </aside>
  );
}
