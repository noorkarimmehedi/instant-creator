"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

type NavIcon = React.ComponentType<{ className?: string; strokeWidth?: number }>;

function HomeIcon({ className }: { className?: string; strokeWidth?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      fillRule="evenodd"
      clipRule="evenodd"
      className={className}
      aria-hidden="true"
    >
      <path d="M2.52 7.823C2 8.77 2 9.915 2 12.203v1.522c0 3.9 0 5.851 1.172 7.063S6.229 22 10 22h4c3.771 0 5.657 0 6.828-1.212S22 17.626 22 13.725v-1.521c0-2.289 0-3.433-.52-4.381c-.518-.949-1.467-1.537-3.364-2.715l-2-1.241C14.111 2.622 13.108 2 12 2s-2.11.622-4.116 1.867l-2 1.241C3.987 6.286 3.038 6.874 2.519 7.823m6.927 7.575a.75.75 0 1 0-.894 1.204A5.77 5.77 0 0 0 12 17.75a5.77 5.77 0 0 0 3.447-1.148a.75.75 0 1 0-.894-1.204A4.27 4.27 0 0 1 12 16.25a4.27 4.27 0 0 1-2.553-.852" />
    </svg>
  );
}

function ProductIcon({ className }: { className?: string; strokeWidth?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 2 3.75 6.5 12 11l8.25-4.5L12 2Z" />
      <path d="M4 8.15v8.35L11 22v-8.35L4 8.15Z" />
      <path d="M13 13.65V22l7-5.5V8.15l-7 5.5Z" />
    </svg>
  );
}

function InfluencersIcon({ className }: { className?: string; strokeWidth?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={4}
      className={className}
      aria-hidden="true"
    >
      <path fill="currentColor" d="M19 20a7 7 0 1 0 0-14a7 7 0 0 0 0 14" />
      <path d="M32.608 7A7 7 0 0 1 36 13a7 7 0 0 1-3.392 6" />
      <path fill="currentColor" d="M4 40.8V42h30v-1.2c0-4.48 0-6.72-.872-8.432a8 8 0 0 0-3.496-3.496C27.92 28 25.68 28 21.2 28h-4.4c-4.48 0-6.72 0-8.432.872a8 8 0 0 0-3.496 3.496C4 34.08 4 36.32 4 40.8" />
      <path d="M44 42v-1.2c0-4.48 0-6.72-.872-8.432a8 8 0 0 0-3.496-3.496" />
    </svg>
  );
}

function OrdersIcon({ className }: { className?: string; strokeWidth?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 36 36"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M13 9.22a5 5 0 1 1 10 0V12h2V9.22a7 7 0 1 0-14 0V12h2Z" />
      <path d="M25 12v3.1a1 1 0 1 1-2 0V12H13v3.1a1 1 0 0 1-2 0V12H4v20a2 2 0 0 0 2 2h24a2 2 0 0 0 2-2V12Z" />
    </svg>
  );
}

function PayoutsIcon({ className }: { className?: string; strokeWidth?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H18a2 2 0 0 1 2 2v1H6.5A2.5 2.5 0 0 0 4 8.5v-3Z" />
      <path d="M4 8.5A2.5 2.5 0 0 1 6.5 6H20a2 2 0 0 1 2 2v10.5a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 4 18.5v-10Zm14.5 6a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
    </svg>
  );
}

function SettingsIcon({ className }: { className?: string; strokeWidth?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth={2}
      className={className}
      aria-hidden="true"
    >
      <path d="M12 3v2m0 0a7 7 0 0 0-7 7m7-7a7 7 0 0 1 7 7m0 0h2m-2 0a7 7 0 0 1-7 7m0 0v2m0-2a7 7 0 0 1-7-7m0 0H3m4.5-7.794l1 1.732M18.062 8.5l1.732-1M15.5 18.062l1 1.732M5.938 15.5l-1.732 1m0-9l1.732 1M15.5 5.938l1-1.732M18.062 15.5l1.732 1M8.5 18.062l-1 1.732M12 12L7 7.101M12 12l-1.812 6.762M12 12l6.762-1.812" />
    </svg>
  );
}

const mainNav: { href: string; label: string; icon: NavIcon }[] = [
  { href: "/dashboard", label: "Dashboard", icon: HomeIcon },
  { href: "/dashboard/products", label: "Products", icon: ProductIcon },
  { href: "/dashboard/influencers", label: "Influencers", icon: InfluencersIcon },
  { href: "/dashboard/orders", label: "Orders", icon: OrdersIcon },
  { href: "/dashboard/payouts", label: "Payouts", icon: PayoutsIcon },
];

const settingsNav: { href: string; label: string; icon: NavIcon }[] = [
  { href: "/dashboard/settings", label: "Settings", icon: SettingsIcon },
];

export function Sidebar({ brandName, plan }: { brandName: string; plan: string }) {
  const pathname = usePathname();
  const navLinkClass = (active: boolean) => `
    flex h-8 items-center justify-between rounded-lg px-2 text-sm leading-none transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-black/50
    ${
      active
        ? "bg-blue-100/50 text-accent-blue font-medium hover:bg-blue-100/80"
        : "text-ink/75 hover:bg-black/5 hover:text-ink"
    }
  `;

  return (
    <aside className="grid h-screen w-[272px] grid-cols-[56px_1fr] bg-[#e5e5e5]">
      <div className="flex flex-col items-center justify-between px-2 py-3.5">
        <div className="flex flex-col items-center">
          <Link
            href="/dashboard"
            className="flex h-11 w-10 items-center justify-center rounded-lg text-sm font-bold tracking-[-0.05em] text-ink outline-none transition-colors hover:bg-black/5 focus-visible:ring-2 focus-visible:ring-black/50"
            aria-label="Instant Creator dashboard"
          >
            I<span className="text-accent-red">/</span>C
          </Link>
        </div>
        <div className="flex flex-col items-center gap-3 py-3">
          <ThemeToggle />
          <UserButton />
        </div>
      </div>

      <div className="overflow-hidden py-[18px] pr-4">
        <div className="flex h-full flex-col overflow-hidden rounded-xl bg-[#F5F5F5]">
          <nav className="flex-1 overflow-hidden p-3 text-ink/75">
            <div className="mb-5 px-2 py-2 text-lg font-semibold text-ink">Dashboard</div>

            <div className="space-y-0.5">
              {mainNav.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link key={item.href} href={item.href} className={navLinkClass(active)}>
                    <span className="flex items-center gap-2.5">
                      <item.icon className="h-4 w-4 shrink-0" strokeWidth={1.5} />
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </div>

            <div className="mt-8 space-y-0.5">
              <p className="mb-2 px-2 text-sm text-mute">Configuration</p>
              {settingsNav.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link key={item.href} href={item.href} className={navLinkClass(active)}>
                    <span className="flex items-center gap-2.5">
                      <item.icon className="h-4 w-4 shrink-0" strokeWidth={1.5} />
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </nav>

          <div className="border-t border-neutral-300/80 p-3">
            <p className="text-sm text-mute">Workspace</p>
            <div className="mt-3 flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink">{brandName}</p>
                <p className="text-xs text-mute capitalize">{plan}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
