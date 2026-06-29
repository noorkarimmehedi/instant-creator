# Brand Dashboard Font Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every brand dashboard page use the same clean sans-serif typography feel as the creator dashboard.

**Architecture:** Use the existing global body font stack instead of introducing a new font. Apply `font-body` at the brand dashboard layout boundary and remove brand-dashboard-only `font-display` overrides from stats and onboarding headings.

**Tech Stack:** Next.js App Router, React 19, Tailwind CSS 4, `next/font/google`.

---

## File Structure

- Modify `src/app/(dashboard)/layout.tsx`: brand dashboard route wrapper; enforce body font inheritance for `/dashboard/**`.
- Modify `src/components/dashboard/StatsRow.tsx`: brand dashboard stat cards; remove display serif from stat values.
- Modify `src/components/dashboard/SetupChecklist.tsx`: brand dashboard onboarding welcome; remove display serif from heading.
- Verify with `npm run lint`.

### Task 1: Apply Creator-Style Font To Brand Dashboard

**Files:**
- Modify: `src/app/(dashboard)/layout.tsx`
- Modify: `src/components/dashboard/StatsRow.tsx`
- Modify: `src/components/dashboard/SetupChecklist.tsx`

- [ ] **Step 1: Inspect current explicit dashboard font usage**

Run: `rg "font-display|font-body|font-sans" src/app/\(dashboard\) src/components/dashboard`

Expected: shows `font-display` in `StatsRow.tsx` and `SetupChecklist.tsx`, plus existing unrelated dashboard font classes.

- [ ] **Step 2: Update brand dashboard route wrapper**

Change `src/app/(dashboard)/layout.tsx` so the outer dashboard wrapper includes `font-body`:

```tsx
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-[#ffffff] font-body">
      <Suspense fallback={<SidebarSkeleton />}>
        <DashboardSidebar />
      </Suspense>
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
```

- [ ] **Step 3: Update brand dashboard stat values**

Change the stat value class in `src/components/dashboard/StatsRow.tsx` from:

```tsx
<p className="mt-2 font-display text-3xl text-ink">{stat.value}</p>
```

to:

```tsx
<p className="mt-2 text-3xl font-medium text-ink">{stat.value}</p>
```

- [ ] **Step 4: Update brand dashboard welcome heading**

Change the welcome heading class in `src/components/dashboard/SetupChecklist.tsx` from:

```tsx
<h2 className="font-display text-3xl text-ink">
```

to:

```tsx
<h2 className="text-3xl font-semibold text-ink">
```

- [ ] **Step 5: Verify only intended dashboard display-font usage changed**

Run: `rg "font-display" src/components/dashboard src/app/\(dashboard\)`

Expected: no matches.

- [ ] **Step 6: Run lint**

Run: `npm run lint`

Expected: lint exits successfully.

## Self-Review

- Spec coverage: the plan applies the creator-style body font to `/dashboard/**`, removes the known brand dashboard display-font overrides, and leaves marketing/auth/creator typography untouched.
- Placeholder scan: no placeholders remain.
- Type consistency: no new types or APIs are introduced.
