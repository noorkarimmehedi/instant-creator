# Mobile Dashboard Optimization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the brand and creator dashboards usable on mobile with a responsive top bar, slide-out drawer, mobile-safe spacing, and card fallbacks for dense tables.

**Architecture:** Add shared dashboard shell primitives under `src/components/dashboard/` and use them from both dashboard layouts. Desktop keeps the current sidebar. Mobile hides the sidebar, shows a menu top bar, and opens a drawer with the same nav items and account identity.

**Tech Stack:** Next.js App Router, React client components, Tailwind CSS utility classes, Clerk `UserButton`, Node built-in test runner for source-level regression tests.

---

## File Structure

- Create: `src/components/dashboard/dashboardNav.ts` exports shared nav item types and brand/creator nav definitions.
- Create: `src/components/dashboard/DashboardShellClient.tsx` owns desktop sidebar, mobile top bar, mobile drawer, and active nav state.
- Modify: `src/components/dashboard/DashboardSidebar.tsx` becomes a server wrapper that passes brand identity into `DashboardShellClient` through the dashboard layout.
- Modify: `src/components/creator/CreatorSidebar.tsx` becomes a server wrapper that passes creator identity into `DashboardShellClient` through the creator layout.
- Modify: `src/app/(dashboard)/layout.tsx` renders `DashboardShellClient` around children.
- Modify: `src/app/(creator)/creator/layout.tsx` renders `DashboardShellClient` around children.
- Modify: `src/components/dashboard/Topbar.tsx` uses mobile-safe padding and title wrapping.
- Modify: dashboard and creator page files that use `p-8` so page spacing becomes responsive.
- Modify: table-heavy pages to render mobile card lists below `md` and existing tables at `md` and wider.
- Create: `tests/mobile-dashboard-source.test.mjs` source-level regression tests for the responsive shell and mobile fallbacks.

## Task 1: Add Source-Level Responsive Regression Tests

**Files:**
- Create: `tests/mobile-dashboard-source.test.mjs`

- [ ] **Step 1: Write the failing test**

```js
import { readFile } from "node:fs/promises";
import test from "node:test";
import assert from "node:assert/strict";

async function read(path) {
  return readFile(path, "utf8");
}

test("dashboard shell has mobile top bar, drawer, and desktop sidebar breakpoints", async () => {
  const source = await read("src/components/dashboard/DashboardShellClient.tsx");

  assert.match(source, /md:hidden/);
  assert.match(source, /hidden md:block/);
  assert.match(source, /aria-label="Open navigation"/);
  assert.match(source, /aria-label="Close navigation"/);
  assert.match(source, /translate-x-0/);
  assert.match(source, /-translate-x-full/);
});

test("dashboard layouts use responsive shell instead of fixed mobile sidebar", async () => {
  const brandLayout = await read("src/app/(dashboard)/layout.tsx");
  const creatorLayout = await read("src/app/(creator)/creator/layout.tsx");

  assert.match(brandLayout, /DashboardShell/);
  assert.match(creatorLayout, /DashboardShell/);
  assert.doesNotMatch(brandLayout, /<div className="flex h-screen/);
  assert.doesNotMatch(creatorLayout, /<div className="flex h-screen/);
});

test("topbar and high-traffic pages use mobile-safe spacing", async () => {
  const topbar = await read("src/components/dashboard/Topbar.tsx");
  const brandHome = await read("src/app/(dashboard)/dashboard/page.tsx");
  const creatorHome = await read("src/app/(creator)/creator/page.tsx");

  assert.match(topbar, /px-4/);
  assert.match(topbar, /sm:px-6/);
  assert.match(topbar, /lg:px-8/);
  assert.match(brandHome, /p-4 sm:p-6 lg:p-8/);
  assert.match(creatorHome, /p-4 sm:p-6 lg:p-8/);
});

test("table-heavy pages render mobile card lists and desktop tables", async () => {
  const files = [
    "src/app/(dashboard)/dashboard/orders/page.tsx",
    "src/app/(dashboard)/dashboard/influencers/page.tsx",
    "src/app/(dashboard)/dashboard/payouts/page.tsx",
    "src/app/(creator)/creator/orders/page.tsx",
    "src/app/(creator)/creator/earnings/page.tsx",
  ];

  for (const file of files) {
    const source = await read(file);
    assert.match(source, /md:hidden/, `${file} needs a mobile card list`);
    assert.match(source, /hidden md:block|hidden md:overflow-x-auto/, `${file} needs desktop-only table wrapper`);
  }
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test "tests/mobile-dashboard-source.test.mjs"`

Expected: FAIL because `src/components/dashboard/DashboardShellClient.tsx` does not exist and layouts still use fixed sidebar shell code.

- [ ] **Step 3: Commit the failing test**

```bash
git add tests/mobile-dashboard-source.test.mjs
git commit -m "test: cover mobile dashboard responsiveness"
```

## Task 2: Create Shared Dashboard Navigation And Shell

**Files:**
- Create: `src/components/dashboard/dashboardNav.ts`
- Create: `src/components/dashboard/DashboardShellClient.tsx`

- [ ] **Step 1: Create shared nav definitions**

Add this file:

```ts
// src/components/dashboard/dashboardNav.ts
export type DashboardNavItem = {
  href: string;
  label: string;
  section: "main" | "settings";
};

export const brandNavItems: DashboardNavItem[] = [
  { href: "/dashboard", label: "Home", section: "main" },
  { href: "/dashboard/products", label: "Products", section: "main" },
  { href: "/dashboard/influencers", label: "Influencers", section: "main" },
  { href: "/dashboard/orders", label: "Orders", section: "main" },
  { href: "/dashboard/payouts", label: "Payouts", section: "main" },
  { href: "/dashboard/settings", label: "Settings", section: "settings" },
];

export const creatorNavItems: DashboardNavItem[] = [
  { href: "/creator", label: "Home", section: "main" },
  { href: "/creator/products", label: "Products", section: "main" },
  { href: "/creator/orders", label: "Orders", section: "main" },
  { href: "/creator/earnings", label: "Earnings", section: "main" },
  { href: "/creator/settings", label: "Settings", section: "settings" },
];
```

- [ ] **Step 2: Create the responsive shell client**

Add this file:

```tsx
// src/components/dashboard/DashboardShellClient.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { useState } from "react";
import type { DashboardNavItem } from "./dashboardNav";

type DashboardShellClientProps = {
  homeHref: string;
  navItems: DashboardNavItem[];
  accountName: string;
  accountMeta: string;
  children: React.ReactNode;
};

export function DashboardShellClient({
  homeHref,
  navItems,
  accountName,
  accountMeta,
  children,
}: DashboardShellClientProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const mainNav = navItems.filter((item) => item.section === "main");
  const settingsNav = navItems.filter((item) => item.section === "settings");

  const close = () => setOpen(false);

  return (
    <div className="min-h-screen bg-[#ffffff] font-body md:flex">
      <div className="hidden md:block">
        <DashboardNav
          homeHref={homeHref}
          mainNav={mainNav}
          settingsNav={settingsNav}
          accountName={accountName}
          accountMeta={accountMeta}
          pathname={pathname}
          onNavigate={close}
        />
      </div>

      <div className="flex min-h-screen flex-1 flex-col md:min-w-0">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-hairline bg-white/95 px-4 backdrop-blur md:hidden">
          <button
            type="button"
            aria-label="Open navigation"
            onClick={() => setOpen(true)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-hairline-strong text-lg text-ink"
          >
            ☰
          </button>
          <Link href={homeHref} className="text-base font-semibold tracking-[-0.03em] text-ink" onClick={close}>
            Zair&apos;s<span className="text-accent-red">/</span>Creator
          </Link>
          <UserButton />
        </header>

        <main className="min-w-0 flex-1 overflow-y-auto">{children}</main>
      </div>

      <div className={`fixed inset-0 z-40 md:hidden ${open ? "pointer-events-auto" : "pointer-events-none"}`}>
        <button
          type="button"
          aria-label="Close navigation"
          onClick={close}
          className={`absolute inset-0 bg-black/30 transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
        />
        <div
          className={`relative h-full w-[280px] max-w-[85vw] transition-transform duration-200 ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <DashboardNav
            homeHref={homeHref}
            mainNav={mainNav}
            settingsNav={settingsNav}
            accountName={accountName}
            accountMeta={accountMeta}
            pathname={pathname}
            onNavigate={close}
          />
        </div>
      </div>
    </div>
  );
}

function DashboardNav({
  homeHref,
  mainNav,
  settingsNav,
  accountName,
  accountMeta,
  pathname,
  onNavigate,
}: {
  homeHref: string;
  mainNav: DashboardNavItem[];
  settingsNav: DashboardNavItem[];
  accountName: string;
  accountMeta: string;
  pathname: string;
  onNavigate: () => void;
}) {
  return (
    <aside className="h-full min-h-screen w-[240px] bg-[#e5e5e5] p-0.5">
      <div className="flex h-full min-h-screen flex-col overflow-hidden rounded bg-[#F5F5F5]">
        <nav className="flex-1 overflow-y-auto p-3 text-ink/75">
          <Link
            href={homeHref}
            onClick={onNavigate}
            className="mb-5 flex h-11 items-center rounded-lg px-2 text-lg font-semibold tracking-[-0.03em] text-ink outline-none transition-colors hover:bg-black/5 focus-visible:ring-2 focus-visible:ring-black/50"
          >
            Zair&apos;s<span className="text-accent-red">/</span>Creator
          </Link>

          <NavSection title="Main Menu" items={mainNav} pathname={pathname} onNavigate={onNavigate} />
          <NavSection title="Configuration" items={settingsNav} pathname={pathname} onNavigate={onNavigate} className="mt-8" />
        </nav>

        <div className="border-t border-neutral-300/80 p-3">
          <div className="flex items-center gap-3">
            <UserButton />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-ink">{accountName}</p>
              <p className="truncate text-xs text-mute capitalize">{accountMeta}</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

function NavSection({
  title,
  items,
  pathname,
  onNavigate,
  className = "",
}: {
  title: string;
  items: DashboardNavItem[];
  pathname: string;
  onNavigate: () => void;
  className?: string;
}) {
  return (
    <div className={`space-y-0.5 ${className}`}>
      <p className="mb-2 px-2 text-sm text-mute">{title}</p>
      {items.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`flex h-9 items-center rounded-lg px-2 text-sm leading-none transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-black/50 ${
              active
                ? "bg-blue-100/50 font-medium text-accent-blue hover:bg-blue-100/80"
                : "text-ink/75 hover:bg-black/5 hover:text-ink"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 3: Run the responsive source test**

Run: `node --test "tests/mobile-dashboard-source.test.mjs"`

Expected: still FAIL because layouts are not yet using `DashboardShellClient`.

## Task 3: Wire The Shared Shell Into Brand And Creator Layouts

**Files:**
- Modify: `src/app/(dashboard)/layout.tsx`
- Modify: `src/app/(creator)/creator/layout.tsx`
- Modify: `src/components/dashboard/DashboardSidebar.tsx`
- Modify: `src/components/creator/CreatorSidebar.tsx`
- Remove from active use: `src/components/dashboard/Sidebar.tsx`
- Remove from active use: `src/components/creator/CreatorSidebarClient.tsx`

- [ ] **Step 1: Replace brand layout with shell wrapper**

Use this structure in `src/app/(dashboard)/layout.tsx`:

```tsx
import { Suspense } from "react";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { SwissToastViewport } from "@/components/ui/SwissToast";

function ShellSkeleton({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-white">{children}</div>;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<ShellSkeleton>{children}</ShellSkeleton>}>
      <DashboardSidebar>{children}</DashboardSidebar>
      <Suspense fallback={null}>
        <SwissToastViewport />
      </Suspense>
    </Suspense>
  );
}
```

- [ ] **Step 2: Update brand server wrapper**

Use this structure in `src/components/dashboard/DashboardSidebar.tsx`:

```tsx
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getCachedBrand } from "@/lib/queries/brand";
import { DashboardShellClient } from "@/components/dashboard/DashboardShellClient";
import { brandNavItems } from "@/components/dashboard/dashboardNav";

export async function DashboardSidebar({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const brand = await getCachedBrand(userId);

  return (
    <DashboardShellClient
      homeHref="/dashboard"
      navItems={brandNavItems}
      accountName={brand.name ?? "My Brand"}
      accountMeta={brand.plan ?? "starter"}
    >
      {children}
    </DashboardShellClient>
  );
}
```

- [ ] **Step 3: Replace creator layout with shell wrapper**

Use this structure in `src/app/(creator)/creator/layout.tsx`:

```tsx
import { Suspense } from "react";
import { CreatorSidebar } from "@/components/creator/CreatorSidebar";
import { SwissToastViewport } from "@/components/ui/SwissToast";

function ShellSkeleton({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-white">{children}</div>;
}

export default function CreatorLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<ShellSkeleton>{children}</ShellSkeleton>}>
      <CreatorSidebar>{children}</CreatorSidebar>
      <Suspense fallback={null}>
        <SwissToastViewport />
      </Suspense>
    </Suspense>
  );
}
```

- [ ] **Step 4: Update creator server wrapper**

Use this structure in `src/components/creator/CreatorSidebar.tsx`:

```tsx
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getCachedInfluencer } from "@/lib/queries/influencer";
import { DashboardShellClient } from "@/components/dashboard/DashboardShellClient";
import { creatorNavItems } from "@/components/dashboard/dashboardNav";

export async function CreatorSidebar({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const influencer = await getCachedInfluencer(userId);

  return (
    <DashboardShellClient
      homeHref="/creator"
      navItems={creatorNavItems}
      accountName={influencer.display_name ?? "Creator"}
      accountMeta={influencer.verified ? "Verified Creator" : "Creator"}
    >
      {children}
    </DashboardShellClient>
  );
}
```

- [ ] **Step 5: Run the responsive source test**

Run: `node --test "tests/mobile-dashboard-source.test.mjs"`

Expected: shell tests pass; page spacing and mobile table tests still fail.

- [ ] **Step 6: Commit shell wiring**

```bash
git add src/components/dashboard/dashboardNav.ts src/components/dashboard/DashboardShellClient.tsx src/app/'(dashboard)'/layout.tsx src/app/'(creator)'/creator/layout.tsx src/components/dashboard/DashboardSidebar.tsx src/components/creator/CreatorSidebar.tsx tests/mobile-dashboard-source.test.mjs
git commit -m "feat: add responsive dashboard shell"
```

## Task 4: Make Shared Topbar And Page Wrappers Mobile-Safe

**Files:**
- Modify: `src/components/dashboard/Topbar.tsx`
- Modify page wrappers under `src/app/(dashboard)/dashboard/` and `src/app/(creator)/creator/` that currently use `p-8`.

- [ ] **Step 1: Update `Topbar` spacing**

Use this implementation:

```tsx
interface TopbarProps {
  title: string;
  children?: React.ReactNode;
}

export function Topbar({ title, children }: TopbarProps) {
  return (
    <header className="flex min-h-14 items-center justify-between gap-3 border-b border-hairline px-4 py-3 sm:px-6 lg:px-8">
      <h1 className="min-w-0 truncate text-lg font-medium text-ink sm:text-xl">{title}</h1>
      {children && <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 sm:gap-3">{children}</div>}
    </header>
  );
}
```

- [ ] **Step 2: Replace desktop-only page padding**

Apply these exact replacements:

```txt
src/app/(dashboard)/dashboard/page.tsx: p-8 space-y-8 -> p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8
src/app/(dashboard)/dashboard/products/page.tsx: p-8 space-y-8 -> p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8
src/app/(dashboard)/dashboard/orders/page.tsx: p-8 space-y-8 -> p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8
src/app/(dashboard)/dashboard/influencers/page.tsx: p-8 space-y-8 -> p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8
src/app/(dashboard)/dashboard/payouts/page.tsx: p-8 space-y-8 -> p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8
src/app/(dashboard)/dashboard/loading.tsx: p-8 space-y-6 -> p-4 sm:p-6 lg:p-8 space-y-6
src/app/(creator)/creator/page.tsx: p-8 space-y-8 -> p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8
src/app/(creator)/creator/products/page.tsx: p-8 space-y-8 -> p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8
src/app/(creator)/creator/orders/page.tsx: p-8 space-y-8 -> p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8
src/app/(creator)/creator/earnings/page.tsx: p-8 space-y-8 -> p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8
src/app/(creator)/creator/loading.tsx: p-8 space-y-6 -> p-4 sm:p-6 lg:p-8 space-y-6
src/app/(creator)/creator/onboarding/profile/page.tsx: p-8 max-w-2xl -> p-4 sm:p-6 lg:p-8 max-w-2xl
src/app/(creator)/creator/onboarding/socials/page.tsx: p-8 max-w-2xl -> p-4 sm:p-6 lg:p-8 max-w-2xl
src/app/(creator)/creator/onboarding/payout/page.tsx: p-8 max-w-2xl -> p-4 sm:p-6 lg:p-8 max-w-2xl
```

- [ ] **Step 3: Fix cramped flex rows on mobile**

In `src/app/(dashboard)/dashboard/orders/page.tsx`, change the courier intro wrapper:

```tsx
<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
```

In `src/app/(creator)/creator/earnings/page.tsx`, change the payout method wrapper:

```tsx
<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
```

- [ ] **Step 4: Run the source test**

Run: `node --test "tests/mobile-dashboard-source.test.mjs"`

Expected: spacing tests pass; mobile table tests still fail.

- [ ] **Step 5: Commit spacing changes**

```bash
git add src/components/dashboard/Topbar.tsx src/app/'(dashboard)'/dashboard src/app/'(creator)'/creator
git commit -m "fix: make dashboard spacing responsive"
```

## Task 5: Add Mobile Card Lists For Table-Heavy Pages

**Files:**
- Modify: `src/app/(dashboard)/dashboard/orders/page.tsx`
- Modify: `src/app/(dashboard)/dashboard/influencers/page.tsx`
- Modify: `src/app/(dashboard)/dashboard/payouts/page.tsx`
- Modify: `src/app/(creator)/creator/orders/page.tsx`
- Modify: `src/app/(creator)/creator/earnings/page.tsx`

- [ ] **Step 1: Add brand orders mobile cards**

In `src/app/(dashboard)/dashboard/orders/page.tsx`, inside the non-empty `SwissCard`, add this before the desktop table wrapper:

```tsx
<div className="space-y-3 md:hidden">
  {orders.map((order) => (
    <div key={order.id} className="rounded-lg border border-hairline bg-surface-elevated p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-medium text-ink">#{order.shopify_order_number ?? "—"}</p>
          <p className="mt-1 truncate text-sm text-charcoal">{productNames.get(order.product_id ?? "") ?? "—"}</p>
          <p className="mt-1 text-xs text-mute">{influencerNames.get(order.influencer_clerk_user_id) ?? "Creator"}</p>
        </div>
        <span className="rounded-full bg-surface-card px-2 py-0.5 text-xs font-medium text-mute">{order.status}</span>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-xs uppercase tracking-wide text-mute">Total</p>
          <p className="font-medium text-ink">{Number(order.order_total).toLocaleString("en-US", { style: "currency", currency: order.currency || "BDT" })}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-mute">Commission</p>
          <p className="font-medium text-accent-orange">{Number(order.commission_amount).toLocaleString("en-US", { style: "currency", currency: order.currency || "BDT" })}</p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-mute">
        <code className="rounded bg-surface-card px-1.5 py-0.5 text-ink">{order.discount_code}</code>
        <span>{order.shopify_created_at ? new Date(order.shopify_created_at).toLocaleDateString() : "—"}</span>
      </div>
    </div>
  ))}
</div>
```

Change the existing table wrapper from `className="overflow-x-auto"` to:

```tsx
<div className="hidden md:block md:overflow-x-auto">
```

- [ ] **Step 2: Add brand influencers mobile cards**

In `src/app/(dashboard)/dashboard/influencers/page.tsx`, add this before the desktop table wrapper:

```tsx
<div className="space-y-3 md:hidden">
  {stats.map((influencer) => (
    <div key={influencer.id} className="rounded-lg border border-hairline bg-surface-elevated p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-hairline-strong bg-surface-card text-xs font-medium text-ink">
          {influencer.name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="truncate font-medium text-ink">{influencer.name}</p>
          <p className="text-xs text-mute">Creator ID: {influencer.id.slice(-8)}</p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <Metric label="Placed" value={String(influencer.placed)} />
        <Metric label="Delivered" value={String(influencer.delivered)} tone="green" />
        <Metric label="Returned" value={String(influencer.returned)} tone="red" />
        <Metric label="Delivered amount" value={formatCurrency(influencer.deliveredAmount)} />
      </div>
    </div>
  ))}
</div>
```

Add this helper at the bottom of the file:

```tsx
function Metric({ label, value, tone = "ink" }: { label: string; value: string; tone?: "ink" | "green" | "red" }) {
  const toneClass = tone === "green" ? "text-accent-green" : tone === "red" ? "text-accent-red" : "text-ink";
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-mute">{label}</p>
      <p className={`font-medium ${toneClass}`}>{value}</p>
    </div>
  );
}
```

Change the table wrapper to `className="hidden md:block md:overflow-x-auto"`.

- [ ] **Step 3: Add brand payouts mobile cards**

In `src/app/(dashboard)/dashboard/payouts/page.tsx`, add mobile cards before each payout table.

For current payouts:

```tsx
<div className="space-y-3 md:hidden">
  {payouts.map((p) => (
    <div key={p.id} className="rounded-lg border border-hairline bg-surface-elevated p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-medium text-ink">{p.name}</p>
          <p className="text-xs text-mute">Creator ID: {p.id.slice(-8)}</p>
        </div>
        <p className="font-medium text-accent-orange">{formatCurrency(p.pending)}</p>
      </div>
      <div className="mt-3 text-sm text-charcoal">
        {p.bank?.account_number ? `${p.bank.account_holder ?? "—"} · ${p.bank.bank_name ?? "—"} · A/C ${p.bank.account_number}` : "No bank details"}
      </div>
      <div className="mt-4 flex items-center justify-between gap-3 text-sm">
        <span className="text-mute">{p.orders} orders · Paid {formatCurrency(p.paid)}</span>
        <ApprovePayoutDialog influencerId={p.id} name={p.name} pending={p.pending} bank={p.bank} />
      </div>
    </div>
  ))}
</div>
```

For payout history:

```tsx
<div className="space-y-3 md:hidden">
  {payoutHistory.map((row, i) => (
    <div key={i} className="rounded-lg border border-hairline bg-surface-elevated p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-medium text-ink">{influencerMap.get(row.influencer_clerk_user_id)?.display_name ?? "Creator"}</p>
          <p className="text-xs text-mute">{new Date(row.created_at).toLocaleDateString()}</p>
        </div>
        <p className="font-medium text-accent-green">{formatCurrency(Number(row.amount ?? 0))}</p>
      </div>
      <p className="mt-3 text-sm text-charcoal">{row.note ?? "—"}</p>
    </div>
  ))}
</div>
```

Change both payout table wrappers to `className="hidden md:block md:overflow-x-auto"`.

- [ ] **Step 4: Add creator orders mobile cards**

In `src/app/(creator)/creator/orders/page.tsx`, add this before the desktop table wrapper:

```tsx
<div className="space-y-3 md:hidden">
  {orders.map((order) => (
    <div key={order.id} className="rounded-lg border border-hairline bg-surface-elevated p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-medium text-ink">#{order.shopify_order_number ?? "—"}</p>
          <p className="mt-1 truncate text-sm text-charcoal">{order.products?.name ?? "—"}</p>
        </div>
        <span className="rounded-full bg-surface-card px-2 py-0.5 text-xs font-medium text-mute">{order.status}</span>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-xs uppercase tracking-wide text-mute">Order total</p>
          <p className="font-medium text-ink">{Number(order.order_total).toLocaleString("en-US", { style: "currency", currency: order.currency || "BDT" })}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-mute">Commission</p>
          <p className="font-medium text-accent-green">{Number(order.commission_amount).toLocaleString("en-US", { style: "currency", currency: order.currency || "BDT" })}</p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-mute">
        <code className="rounded bg-surface-card px-1.5 py-0.5 text-ink">{order.discount_code}</code>
        <CourierStatusBadge status={order.courier_status} returnStatus={order.return_status} />
      </div>
    </div>
  ))}
</div>
```

Change the table wrapper to `className="hidden md:block md:overflow-x-auto"`.

- [ ] **Step 5: Add creator earnings mobile cards**

In `src/app/(creator)/creator/earnings/page.tsx`, add this before the desktop table wrapper:

```tsx
<div className="space-y-3 md:hidden">
  {orders.map((order) => (
    <div key={order.id} className="rounded-lg border border-hairline bg-surface-elevated p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-medium text-ink">#{order.shopify_order_number ?? "—"}</p>
          <p className="text-xs text-mute">{order.shopify_created_at ? new Date(order.shopify_created_at).toLocaleDateString() : "—"}</p>
        </div>
        <span className="rounded-full bg-surface-card px-2 py-0.5 text-xs font-medium text-mute">{order.status}</span>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-xs uppercase tracking-wide text-mute">Order total</p>
          <p className="font-medium text-ink">{Number(order.order_total).toLocaleString("en-US", { style: "currency", currency: order.currency || "BDT" })}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-mute">Commission</p>
          <p className="font-medium text-accent-green">{Number(order.commission_amount).toLocaleString("en-US", { style: "currency", currency: order.currency || "BDT" })}</p>
        </div>
      </div>
      <code className="mt-3 inline-block rounded bg-surface-card px-1.5 py-0.5 text-xs text-ink">{order.discount_code}</code>
    </div>
  ))}
</div>
```

Change the table wrapper to `className="hidden md:block md:overflow-x-auto"`.

- [ ] **Step 6: Run the source test**

Run: `node --test "tests/mobile-dashboard-source.test.mjs"`

Expected: PASS.

- [ ] **Step 7: Commit mobile table fallbacks**

```bash
git add src/app/'(dashboard)'/dashboard/orders/page.tsx src/app/'(dashboard)'/dashboard/influencers/page.tsx src/app/'(dashboard)'/dashboard/payouts/page.tsx src/app/'(creator)'/creator/orders/page.tsx src/app/'(creator)'/creator/earnings/page.tsx tests/mobile-dashboard-source.test.mjs
git commit -m "fix: add mobile dashboard table cards"
```

## Task 6: Product Grid And Form Polish

**Files:**
- Modify: `src/app/(dashboard)/dashboard/products/page.tsx`
- Modify: `src/app/(dashboard)/dashboard/products/ProductCard.tsx`
- Modify: `src/app/(creator)/creator/products/page.tsx`

- [ ] **Step 1: Make brand product grid less cramped on phones**

In `src/app/(dashboard)/dashboard/products/page.tsx`, change the product grid from:

```tsx
<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
```

to:

```tsx
<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
```

- [ ] **Step 2: Make product card actions stack on phones**

In `src/app/(dashboard)/dashboard/products/ProductCard.tsx`, change the save action row from:

```tsx
<div className="flex items-center justify-between gap-2">
```

to:

```tsx
<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
```

Change the delete form class from:

```tsx
className="flex items-center justify-between gap-2"
```

to:

```tsx
className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
```

- [ ] **Step 3: Make creator marketplace filters and grid phone-safe**

In `src/app/(creator)/creator/products/page.tsx`, change the filter action wrapper from:

```tsx
<div className="flex gap-2">
```

to:

```tsx
<div className="flex flex-col gap-2 sm:flex-row">
```

Change the Apply button class to include full-width mobile behavior:

```tsx
className="h-10 w-full rounded-md bg-ink px-4 text-sm font-medium text-white transition-colors hover:bg-charcoal sm:w-auto"
```

Change the Clear link class to include centered full-width mobile behavior:

```tsx
className="inline-flex h-10 w-full items-center justify-center rounded-md border border-hairline px-3 text-sm text-charcoal transition-colors hover:border-overlay-strong hover:text-ink sm:w-auto"
```

Change the product grid from:

```tsx
<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
```

to:

```tsx
<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
```

- [ ] **Step 4: Run source and lint checks**

Run: `node --test "tests/mobile-dashboard-source.test.mjs"`

Expected: PASS.

Run: `npm run lint`

Expected: PASS with at most the existing `AvatarUpload.tsx` image warning.

- [ ] **Step 5: Commit product mobile polish**

```bash
git add src/app/'(dashboard)'/dashboard/products/page.tsx src/app/'(dashboard)'/dashboard/products/ProductCard.tsx src/app/'(creator)'/creator/products/page.tsx
git commit -m "fix: improve mobile product dashboard layouts"
```

## Task 7: Final Verification And Browser QA

**Files:**
- No new files expected.

- [ ] **Step 1: Run automated checks**

Run: `node --test "tests/mobile-dashboard-source.test.mjs"`

Expected: PASS.

Run: `npm run lint`

Expected: PASS with at most the existing `AvatarUpload.tsx` image warning.

- [ ] **Step 2: Attempt production build**

Run: `npm run build`

Expected if dependencies are installed: PASS.

Expected in the current workspace if `node_modules/.bin/next` is missing: command fails with `next: command not found`. If that happens, record it in the final report and do not claim build verification passed.

- [ ] **Step 3: Manual mobile QA checklist**

At 390px viewport width, verify these routes:

```txt
/dashboard
/dashboard/products
/dashboard/orders
/dashboard/influencers
/dashboard/payouts
/dashboard/settings
/creator
/creator/products
/creator/orders
/creator/earnings
/creator/settings
```

Confirm each route has:

```txt
No fixed desktop sidebar visible.
Mobile top bar visible.
Drawer opens from the left.
Drawer links navigate and close the drawer.
No horizontal page scrolling.
Stats cards fit inside viewport.
Table-heavy pages show card lists on phones.
Desktop table still appears at md width and larger.
```

- [ ] **Step 4: Commit final adjustments if QA finds small responsive class fixes**

If QA only finds class-level spacing or overflow fixes, commit them with:

```bash
git add <changed-files>
git commit -m "fix: polish mobile dashboard responsiveness"
```

If QA finds a structural issue such as drawer state breaking navigation or server/client component boundaries failing, stop execution and report the exact route, console/build error, and file where the issue appears.

## Self-Review

Spec coverage:

- Responsive shell is covered by Tasks 2 and 3.
- Mobile top bar and drawer are covered by Tasks 2 and 3.
- Mobile-safe page spacing is covered by Task 4.
- Table card fallbacks are covered by Task 5.
- Product grid and form density are covered by Task 6.
- Verification across brand and creator routes is covered by Task 7.

Placeholder scan: no placeholder terms remain in the plan.

Type consistency: `DashboardNavItem`, `DashboardShellClient`, `brandNavItems`, and `creatorNavItems` are defined before they are used by later tasks.
