# InstantCreator Build 1 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the marketing landing page, Clerk authentication, Supabase database, brand dashboard with empty-state onboarding, and Shopify OAuth connection — the first shippable surface of InstantCreator.

**Architecture:** Next.js 16 App Router with route groups: `(marketing)` for public pages, `(auth)` for Clerk sign-in/up, `(dashboard)` for protected brand portal. Server components + server actions for all data access. Supabase as database (service role key, no RLS). Clerk middleware protects dashboard routes.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS 4, Clerk (`@clerk/nextjs`), Supabase (`@supabase/supabase-js`), DM Serif Display + Inter (Google Fonts), Vercel deployment.

**Spec:** `docs/superpowers/specs/2026-06-27-build-1-marketing-auth-onboarding-design.md`

---

## File Structure

```
src/
  app/
    layout.tsx                              — Root layout: fonts, globals, ClerkProvider (MODIFY)
    globals.css                             — Design tokens + Tailwind theme (MODIFY)
    (marketing)/
      layout.tsx                            — Marketing layout: Navbar + Footer wrapper
      page.tsx                              — Landing page: assembles all sections
    (auth)/
      layout.tsx                            — Centered dark auth layout
      sign-in/[[...sign-in]]/page.tsx       — Clerk SignIn component
      sign-up/[[...sign-up]]/page.tsx       — Clerk SignUp component
    (dashboard)/
      layout.tsx                            — Dashboard layout: Sidebar + Topbar
      dashboard/
        page.tsx                            — Main dashboard: empty-state guided
        settings/page.tsx                   — Settings: profile, Shopify, RTO, billing
    api/
      webhooks/clerk/route.ts               — Clerk user.created → insert brand row
      shopify/auth/route.ts                 — Initiate Shopify OAuth redirect
      shopify/callback/route.ts             — Handle Shopify OAuth callback
  middleware.ts                             — Clerk auth middleware
  lib/
    supabase/server.ts                      — Supabase server client (service role)
    shopify/oauth.ts                        — buildAuthUrl(), exchangeCode() helpers
  components/
    ui/
      Button.tsx                            — Primary, ghost, outline button variants
      SwissCard.tsx                         — Card with + corner markers + hover animations
      Badge.tsx                             — Pill badge
      SectionHeader.tsx                     — Section label + serif heading + subtitle
      ScrollReveal.tsx                      — IntersectionObserver scroll-triggered fade-up
    marketing/
      Navbar.tsx                            — Sticky nav with backdrop blur
      Hero.tsx                              — Hero section with animated headline
      ProblemSection.tsx                    — 3 stat cards
      HowItWorks.tsx                        — 3-step grid with connecting line
      FeaturesSection.tsx                   — 2x2 feature grid with glow
      PricingSection.tsx                    — 3-tier pricing
      Footer.tsx                            — Minimal footer
    dashboard/
      Sidebar.tsx                           — Dashboard sidebar navigation
      Topbar.tsx                            — Dashboard top bar
      StatsRow.tsx                          — 4 stat mini-cards (empty state)
      SetupChecklist.tsx                    — 4-step onboarding checklist
```

---

## Task 1: Install Dependencies and Configure Environment

**Files:**
- Modify: `package.json`
- Create: `.env.local.example`

- [ ] **Step 1: Install Clerk and Supabase**

```bash
cd "/Users/noorkarimmehedi/Downloads/Instant:Creator"
npm install @clerk/nextjs @supabase/supabase-js
```

Expected: packages added to `package.json` dependencies.

- [ ] **Step 2: Create `.env.local.example`**

Create a template file so the developer knows which env vars to set:

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
CLERK_WEBHOOK_SECRET=whsec_...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Shopify
SHOPIFY_API_KEY=your_shopify_api_key
SHOPIFY_API_SECRET=your_shopify_api_secret

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

- [ ] **Step 3: Verify the dev server starts**

```bash
npm run dev
```

Expected: Next.js dev server starts on localhost:3000 without errors.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json .env.local.example
git commit -m "chore: install clerk and supabase dependencies"
```

---

## Task 2: Design System — Global CSS Tokens and Tailwind Theme

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Replace `globals.css` with design tokens and animations**

Replace the entire contents of `src/app/globals.css` with:

```css
@import "tailwindcss";

:root {
  --canvas: #000000;
  --ink: #fcfdff;
  --body: rgba(252, 253, 255, 0.86);
  --charcoal: rgba(252, 253, 255, 0.7);
  --mute: #a1a4a5;
  --ash: #888e90;
  --stone: #464a4d;
  --surface-card: #0a0a0c;
  --surface-elevated: #101012;
  --surface-deep: #06060a;
  --hairline: rgba(255, 255, 255, 0.06);
  --hairline-strong: rgba(255, 255, 255, 0.14);
  --accent-orange: #ff801f;
  --accent-orange-glow: rgba(255, 89, 0, 0.22);
  --accent-yellow: #ffc53d;
  --accent-blue: #3b9eff;
  --accent-blue-glow: rgba(0, 117, 255, 0.34);
  --accent-green: #11ff99;
  --accent-green-glow: rgba(34, 255, 153, 0.18);
  --accent-red: #ff2047;
  --accent-red-glow: rgba(255, 32, 71, 0.34);
}

@theme inline {
  --color-canvas: var(--canvas);
  --color-ink: var(--ink);
  --color-body: var(--body);
  --color-charcoal: var(--charcoal);
  --color-mute: var(--mute);
  --color-ash: var(--ash);
  --color-stone: var(--stone);
  --color-surface-card: var(--surface-card);
  --color-surface-elevated: var(--surface-elevated);
  --color-surface-deep: var(--surface-deep);
  --color-hairline: var(--hairline);
  --color-hairline-strong: var(--hairline-strong);
  --color-accent-orange: var(--accent-orange);
  --color-accent-yellow: var(--accent-yellow);
  --color-accent-blue: var(--accent-blue);
  --color-accent-green: var(--accent-green);
  --color-accent-red: var(--accent-red);
  --font-display: "DM Serif Display", Georgia, serif;
  --font-body: "Inter", system-ui, sans-serif;
  --font-mono: "Geist Mono", monospace;
}

body {
  background: var(--canvas);
  color: var(--ink);
  font-family: var(--font-body);
}

/* Animations */
@keyframes fade-up {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes glow-pulse {
  0%, 100% { opacity: 0.15; transform: translate(-50%, -50%) scale(1); }
  50% { opacity: 0.25; transform: translate(-50%, -50%) scale(1.05); }
}

@keyframes line-grow {
  from { width: 0; }
  to { width: 100%; }
}

@keyframes dot-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(17, 255, 153, 0.4); }
  50% { box-shadow: 0 0 0 6px rgba(17, 255, 153, 0); }
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
```

- [ ] **Step 2: Update root layout with fonts and ClerkProvider**

Replace the entire contents of `src/app/layout.tsx` with:

```tsx
import type { Metadata } from "next";
import { Inter, DM_Serif_Display, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const dmSerif = DM_Serif_Display({
  variable: "--font-dm-serif",
  weight: "400",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "InstantCreator — Bangladesh's First Influencer-Brand Marketplace",
  description:
    "Track orders. Filter fraud. Pay creators. The only platform connecting Shopify brands with influencers in Bangladesh.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider appearance={{ baseTheme: dark }}>
      <html
        lang="en"
        className={`${inter.variable} ${dmSerif.variable} ${geistMono.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col bg-canvas text-ink font-body">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
```

- [ ] **Step 3: Verify dev server renders black page with correct fonts**

```bash
npm run dev
```

Open http://localhost:3000. Expected: pure black page, no errors in console.

- [ ] **Step 4: Commit**

```bash
git add src/app/globals.css src/app/layout.tsx
git commit -m "feat: add design system tokens, fonts, and ClerkProvider"
```

---

## Task 3: Shared UI Components — Button, SwissCard, Badge, SectionHeader

**Files:**
- Create: `src/components/ui/Button.tsx`
- Create: `src/components/ui/SwissCard.tsx`
- Create: `src/components/ui/Badge.tsx`
- Create: `src/components/ui/SectionHeader.tsx`

- [ ] **Step 1: Create Button component**

Create `src/components/ui/Button.tsx`:

```tsx
import Link from "next/link";

type ButtonVariant = "primary" | "ghost" | "outline";

interface ButtonProps {
  children: React.ReactNode;
  variant?: ButtonVariant;
  href?: string;
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit";
}

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-ink text-canvas hover:bg-[#e8e9eb]",
  ghost:
    "bg-surface-elevated text-ink border border-hairline-strong hover:border-white/25",
  outline:
    "bg-transparent text-ink border border-hairline-strong hover:border-white/30 hover:bg-white/[0.04]",
};

export function Button({
  children,
  variant = "primary",
  href,
  className = "",
  onClick,
  type = "button",
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-[8px] px-5 py-2 text-sm font-medium transition-all duration-200 hover:-translate-y-px cursor-pointer";
  const classes = `${base} ${variants[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} className={classes}>
      {children}
    </button>
  );
}
```

- [ ] **Step 2: Create SwissCard component**

Create `src/components/ui/SwissCard.tsx`:

```tsx
"use client";

interface SwissCardProps {
  children: React.ReactNode;
  className?: string;
  highlighted?: boolean;
  elevated?: boolean;
  onClick?: () => void;
}

export function SwissCard({
  children,
  className = "",
  highlighted = false,
  elevated = false,
  onClick,
}: SwissCardProps) {
  const bg = elevated ? "bg-surface-elevated" : "bg-surface-card";
  const highlightBorder = highlighted
    ? "border-accent-blue"
    : "border-hairline-strong";

  return (
    <div
      onClick={onClick}
      className={`
        group relative overflow-hidden rounded-[12px] border p-8
        ${bg} ${highlightBorder}
        transition-all duration-300
        hover:border-white/25 hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)]
        ${onClick ? "cursor-pointer" : ""}
        ${className}
      `}
    >
      {/* Top-left + */}
      <span className="absolute top-2.5 left-3 font-inter text-sm font-light text-white/[0.12] transition-all duration-300 group-hover:text-white/[0.35] group-hover:rotate-90 leading-none select-none">
        +
      </span>
      {/* Top-right + */}
      <span className="absolute top-2.5 right-3 font-inter text-sm font-light text-white/[0.12] transition-all duration-300 group-hover:text-white/[0.35] leading-none select-none">
        +
      </span>
      {/* Bottom-left + */}
      <span className="absolute bottom-2.5 left-3 font-inter text-sm font-light text-white/[0.12] transition-all duration-300 group-hover:text-white/[0.35] group-hover:rotate-90 leading-none select-none">
        +
      </span>
      {/* Bottom-right + */}
      <span className="absolute bottom-2.5 right-3 font-inter text-sm font-light text-white/[0.12] transition-all duration-300 group-hover:text-white/[0.35] leading-none select-none">
        +
      </span>
      {children}
    </div>
  );
}
```

- [ ] **Step 3: Create Badge component**

Create `src/components/ui/Badge.tsx`:

```tsx
interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}

export function Badge({ children, className = "", dot = false }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full bg-surface-elevated border border-hairline-strong px-3 py-1 text-xs text-body ${className}`}
    >
      {dot && (
        <span className="h-1.5 w-1.5 rounded-full bg-accent-green" />
      )}
      {children}
    </span>
  );
}
```

- [ ] **Step 4: Create SectionHeader component**

Create `src/components/ui/SectionHeader.tsx`:

```tsx
interface SectionHeaderProps {
  label?: string;
  title: string;
  subtitle?: string;
  className?: string;
}

export function SectionHeader({
  label,
  title,
  subtitle,
  className = "",
}: SectionHeaderProps) {
  return (
    <div className={`text-center mb-14 ${className}`}>
      {label && (
        <p className="text-xs font-medium tracking-[1.5px] uppercase text-mute mb-4">
          {label}
        </p>
      )}
      <h2
        className="font-display text-5xl font-normal leading-[1.05] tracking-tight"
        dangerouslySetInnerHTML={{ __html: title }}
      />
      {subtitle && (
        <p className="text-[17px] text-charcoal mt-3.5 leading-normal">
          {subtitle}
        </p>
      )}
    </div>
  );
}
```

- [ ] **Step 5: Verify build passes**

```bash
npm run build
```

Expected: build succeeds with no type errors.

- [ ] **Step 6: Commit**

```bash
git add src/components/ui/
git commit -m "feat: add shared UI components — Button, SwissCard, Badge, SectionHeader"
```

---

## Task 4: ScrollReveal Client Component

**Files:**
- Create: `src/components/ui/ScrollReveal.tsx`

- [ ] **Step 1: Create ScrollReveal component**

Create `src/components/ui/ScrollReveal.tsx`:

```tsx
"use client";

import { useEffect, useRef } from "react";

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export function ScrollReveal({
  children,
  className = "",
  delay = 0,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.transitionDelay = `${delay}s`;
          el.classList.add("opacity-100", "translate-y-0");
          el.classList.remove("opacity-0", "translate-y-[30px]");
          observer.unobserve(el);
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div
      ref={ref}
      className={`opacity-0 translate-y-[30px] transition-all duration-700 ease-out ${className}`}
    >
      {children}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ui/ScrollReveal.tsx
git commit -m "feat: add ScrollReveal component for scroll-triggered animations"
```

---

## Task 5: Marketing Components — Navbar and Footer

**Files:**
- Create: `src/components/marketing/Navbar.tsx`
- Create: `src/components/marketing/Footer.tsx`
- Create: `src/app/(marketing)/layout.tsx`

- [ ] **Step 1: Create Navbar**

Create `src/components/marketing/Navbar.tsx`:

```tsx
import Link from "next/link";
import { Button } from "@/components/ui/Button";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "For Creators", href: "#creators" },
];

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between px-10 py-4 border-b border-hairline bg-canvas/85 backdrop-blur-xl animate-[fade-in_0.6s_ease]">
      <Link href="/" className="flex items-center gap-2 font-semibold text-[17px] tracking-tight">
        <span className="h-2 w-2 rounded-full bg-accent-green animate-[dot-pulse_2s_ease-in-out_infinite]" />
        InstantCreator
      </Link>
      <div className="flex items-center gap-7 text-sm text-charcoal">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="relative hover:text-ink transition-colors duration-200 after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-ink after:transition-all after:duration-300 hover:after:w-full"
          >
            {link.label}
          </Link>
        ))}
        <Button href="/sign-up" variant="primary">
          Get Started
        </Button>
      </div>
    </nav>
  );
}
```

- [ ] **Step 2: Create Footer**

Create `src/components/marketing/Footer.tsx`:

```tsx
import Link from "next/link";

const footerLinks = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Contact", href: "/contact" },
];

export function Footer() {
  return (
    <footer className="border-t border-hairline px-10 py-14">
      <div className="flex items-center justify-between max-w-[1000px] mx-auto text-[13px] text-white/40">
        <span>&copy; 2026 InstantCreator &middot; Arc Lab Technology</span>
        <div className="flex gap-6">
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="hover:text-charcoal transition-colors duration-200"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 3: Create marketing layout**

Create `src/app/(marketing)/layout.tsx`:

```tsx
import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/marketing/Navbar.tsx src/components/marketing/Footer.tsx src/app/\(marketing\)/layout.tsx
git commit -m "feat: add Navbar, Footer, and marketing layout"
```

---

## Task 6: Marketing Components — Hero Section

**Files:**
- Create: `src/components/marketing/Hero.tsx`

- [ ] **Step 1: Create Hero component**

Create `src/components/marketing/Hero.tsx`:

```tsx
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export function Hero() {
  return (
    <section className="relative overflow-hidden text-center px-10 pt-[120px] pb-[100px]">
      {/* Atmospheric orange glow */}
      <div className="absolute top-1/2 left-1/2 w-[800px] h-[600px] bg-[radial-gradient(ellipse,rgba(255,89,0,0.08),transparent_70%)] animate-[glow-pulse_6s_ease-in-out_infinite] pointer-events-none" />

      <div className="relative">
        <div className="animate-[fade-up_0.8s_ease_0.2s_both]">
          <Badge dot>Bangladesh&apos;s First Influencer-Brand Marketplace</Badge>
        </div>

        <h1 className="font-display text-[80px] font-normal leading-[1.0] tracking-[-2px] mt-8 mb-7 max-w-[800px] mx-auto animate-[fade-up_0.8s_ease_0.4s_both]">
          Track orders.
          <br />
          Filter{" "}
          <span className="bg-gradient-to-br from-accent-orange to-accent-yellow bg-clip-text text-transparent">
            fraud
          </span>
          .
          <br />
          Pay creators.
        </h1>

        <p className="text-lg text-charcoal max-w-[520px] mx-auto mb-10 leading-relaxed animate-[fade-up_0.8s_ease_0.6s_both]">
          The only platform that connects Shopify brands with influencers — and
          catches fake orders before you pay commission.
        </p>

        <div className="flex gap-3 justify-center animate-[fade-up_0.8s_ease_0.8s_both]">
          <Button href="/sign-up" variant="primary">
            Start Free Trial
          </Button>
          <Button href="#how-it-works" variant="outline">
            See How It Works
          </Button>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/marketing/Hero.tsx
git commit -m "feat: add Hero section with animated headline and atmospheric glow"
```

---

## Task 7: Marketing Components — Problem, HowItWorks, Features, Pricing

**Files:**
- Create: `src/components/marketing/ProblemSection.tsx`
- Create: `src/components/marketing/HowItWorks.tsx`
- Create: `src/components/marketing/FeaturesSection.tsx`
- Create: `src/components/marketing/PricingSection.tsx`

- [ ] **Step 1: Create ProblemSection**

Create `src/components/marketing/ProblemSection.tsx`:

```tsx
import { SwissCard } from "@/components/ui/SwissCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

const stats = [
  { value: "৳5L+", color: "text-accent-red", lineColor: "bg-accent-red", desc: "Lost monthly to fake COD orders from fraudulent influencers" },
  { value: "40%+", color: "text-accent-orange", lineColor: "bg-accent-orange", desc: "Average RTO rate on unvetted influencer-driven campaigns" },
  { value: "Zero", color: "text-accent-yellow", lineColor: "bg-accent-yellow", desc: "Tools built for BD's COD market to track influencer performance" },
];

export function ProblemSection() {
  return (
    <section className="px-10 py-24">
      <SectionHeader
        label="The Problem"
        title="Influencer campaigns are<br>bleeding money"
      />
      <div className="grid grid-cols-3 gap-4 max-w-[1000px] mx-auto">
        {stats.map((stat, i) => (
          <ScrollReveal key={stat.value} delay={0.1 * (i + 1)}>
            <SwissCard>
              <p className={`font-display text-5xl font-normal mb-3 ${stat.color}`}>
                {stat.value}
              </p>
              <div className={`w-8 h-0.5 rounded-sm my-4 ${stat.lineColor}`} />
              <p className="text-sm text-charcoal leading-normal">{stat.desc}</p>
            </SwissCard>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Create HowItWorks**

Create `src/components/marketing/HowItWorks.tsx`:

```tsx
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

const steps = [
  { num: "1", title: "Connect Shopify", desc: "One-click OAuth. Your products and orders sync automatically." },
  { num: "2", title: "Invite Influencers", desc: "Set commission rates. Each creator gets a unique discount code." },
  { num: "3", title: "Track & Pay", desc: "See real delivery status. Pay only for orders that actually land." },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="px-10 py-24">
      <SectionHeader
        label="How It Works"
        title="Three steps to profitable<br>influencer campaigns"
      />
      <div className="relative grid grid-cols-3 gap-6 max-w-[1000px] mx-auto">
        {/* Connecting line */}
        <div className="absolute top-[36px] left-[16.66%] right-[16.66%] h-px bg-gradient-to-r from-transparent via-hairline-strong to-transparent" />

        {steps.map((step, i) => (
          <ScrollReveal key={step.num} delay={0.1 * (i + 1)}>
            <div className="group text-center">
              <div className="relative z-10 mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-[14px] bg-surface-elevated border border-hairline-strong font-display text-[22px] transition-all duration-300 group-hover:border-white/30 group-hover:bg-white/[0.08] group-hover:scale-105">
                {step.num}
              </div>
              <h3 className="text-[17px] font-medium mb-2">{step.title}</h3>
              <p className="text-sm text-charcoal leading-normal max-w-[260px] mx-auto">
                {step.desc}
              </p>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Create FeaturesSection**

Create `src/components/marketing/FeaturesSection.tsx`:

```tsx
import { SwissCard } from "@/components/ui/SwissCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

const features = [
  { icon: "⚡", title: "RTO Fraud Detection", desc: "Auto-flag influencers with return rates above 25%. Commission only triggers on delivered orders.", tag: "Anti-fraud" },
  { icon: "🔗", title: "Shopify Integration", desc: "Real-time order sync. Discount codes auto-generated per influencer. No manual tracking.", tag: "One-click setup" },
  { icon: "💸", title: "bKash Payouts", desc: "Pay influencers directly via bKash or bank transfer. No more screenshots and WhatsApp threads.", tag: "Instant payout" },
  { icon: "🔍", title: "Creator Marketplace", desc: "Browse verified influencers by niche, follower count, and RTO history. Find creators that convert.", tag: "Discovery" },
];

export function FeaturesSection() {
  return (
    <section id="features" className="relative overflow-hidden px-10 py-24">
      {/* Blue atmospheric glow */}
      <div className="absolute top-0 left-1/2 w-[900px] h-[500px] bg-[radial-gradient(ellipse,rgba(0,117,255,0.12),transparent_70%)] -translate-x-1/2 animate-[glow-pulse_8s_ease-in-out_infinite] pointer-events-none" />

      <div className="relative">
        <SectionHeader
          label="Features"
          title="Built for Bangladesh's<br>COD market"
        />
        <div className="grid grid-cols-2 gap-4 max-w-[1000px] mx-auto">
          {features.map((f, i) => (
            <ScrollReveal key={f.title} delay={0.1 * (i + 1)}>
              <SwissCard>
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-[10px] bg-surface-elevated border border-hairline-strong text-lg transition-all duration-300 group-hover:scale-110 group-hover:border-white/30">
                  {f.icon}
                </div>
                <h3 className="text-[17px] font-medium mb-2">{f.title}</h3>
                <p className="text-sm text-charcoal leading-relaxed">{f.desc}</p>
                <span className="inline-block mt-3.5 text-xs text-mute px-2.5 py-0.5 border border-hairline rounded-full transition-colors duration-300 group-hover:border-hairline-strong">
                  {f.tag}
                </span>
              </SwissCard>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Create PricingSection**

Create `src/components/marketing/PricingSection.tsx`:

```tsx
import { SwissCard } from "@/components/ui/SwissCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Button } from "@/components/ui/Button";

const tiers = [
  {
    name: "Starter",
    price: "৳2,000",
    featured: false,
    features: ["Up to 10 influencers", "1 Shopify store", "Basic reports", "Email support"],
  },
  {
    name: "Growth",
    price: "৳5,000",
    featured: true,
    features: ["Up to 30 influencers", "1 Shopify store", "bKash payouts", "RTO auto-flagging", "Full reports"],
  },
  {
    name: "Pro",
    price: "৳12,000",
    featured: false,
    features: ["Unlimited influencers", "3 Shopify stores", "bKash + Bank payouts", "CSV exports", "WhatsApp support"],
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="px-10 py-24">
      <SectionHeader
        label="Pricing"
        title="Simple, transparent pricing"
        subtitle="Start free. Scale when you're ready."
      />
      <div className="grid grid-cols-3 gap-4 max-w-[1000px] mx-auto">
        {tiers.map((tier, i) => (
          <ScrollReveal key={tier.name} delay={0.1 * (i + 1)}>
            <SwissCard elevated={tier.featured} className="flex flex-col h-full">
              {tier.featured && (
                <span className="absolute top-3 right-3 bg-canvas border border-hairline-strong px-2.5 py-0.5 rounded-full text-[11px] text-body">
                  Popular
                </span>
              )}
              <p className="text-sm text-charcoal mb-1.5">{tier.name}</p>
              <p className="font-display text-[44px] font-normal tracking-tight mb-0.5">
                {tier.price}
              </p>
              <p className="text-[13px] text-white/40 mb-7">/month</p>
              <ul className="flex-1 text-[13px] text-charcoal">
                {tier.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-center gap-2.5 py-2 border-b border-hairline"
                  >
                    <span className="text-xs text-mute">&rarr;</span>
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-7">
                <Button
                  href="/sign-up"
                  variant={tier.featured ? "primary" : "outline"}
                  className="w-full justify-center"
                >
                  Get Started
                </Button>
              </div>
            </SwissCard>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add src/components/marketing/ProblemSection.tsx src/components/marketing/HowItWorks.tsx src/components/marketing/FeaturesSection.tsx src/components/marketing/PricingSection.tsx
git commit -m "feat: add Problem, HowItWorks, Features, and Pricing sections"
```

---

## Task 8: Assemble Landing Page

**Files:**
- Create: `src/app/(marketing)/page.tsx`
- Delete: `src/app/page.tsx`

- [ ] **Step 1: Remove the default page.tsx**

```bash
rm "/Users/noorkarimmehedi/Downloads/Instant:Creator/src/app/page.tsx"
```

- [ ] **Step 2: Create the marketing landing page**

Create `src/app/(marketing)/page.tsx`:

```tsx
import { Hero } from "@/components/marketing/Hero";
import { ProblemSection } from "@/components/marketing/ProblemSection";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { FeaturesSection } from "@/components/marketing/FeaturesSection";
import { PricingSection } from "@/components/marketing/PricingSection";

function SectionDivider() {
  return (
    <div className="relative w-full h-px bg-hairline overflow-hidden">
      <div className="absolute top-0 left-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[line-grow_1.5s_ease_forwards]" />
    </div>
  );
}

export default function HomePage() {
  return (
    <>
      <Hero />
      <SectionDivider />
      <ProblemSection />
      <SectionDivider />
      <HowItWorks />
      <SectionDivider />
      <FeaturesSection />
      <SectionDivider />
      <PricingSection />
    </>
  );
}
```

- [ ] **Step 3: Verify landing page renders**

```bash
npm run dev
```

Open http://localhost:3000. Expected: full landing page with all sections, animations, Swiss cards, atmospheric glows, working hover states.

- [ ] **Step 4: Verify build**

```bash
npm run build
```

Expected: build succeeds.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: assemble landing page with all marketing sections"
```

---

## Task 9: Clerk Auth Pages

**Files:**
- Create: `src/app/(auth)/layout.tsx`
- Create: `src/app/(auth)/sign-in/[[...sign-in]]/page.tsx`
- Create: `src/app/(auth)/sign-up/[[...sign-up]]/page.tsx`
- Create: `src/middleware.ts`

- [ ] **Step 1: Create auth layout**

Create `src/app/(auth)/layout.tsx`:

```tsx
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
      {children}
    </div>
  );
}
```

- [ ] **Step 2: Create sign-in page**

Create `src/app/(auth)/sign-in/[[...sign-in]]/page.tsx`:

```tsx
import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return <SignIn />;
}
```

- [ ] **Step 3: Create sign-up page**

Create `src/app/(auth)/sign-up/[[...sign-up]]/page.tsx`:

```tsx
import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return <SignUp />;
}
```

- [ ] **Step 4: Create Clerk middleware**

Create `src/middleware.ts`:

```ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
```

- [ ] **Step 5: Commit**

```bash
git add src/app/\(auth\) src/middleware.ts
git commit -m "feat: add Clerk auth pages and middleware"
```

---

## Task 10: Supabase Client and Brands Table

**Files:**
- Create: `src/lib/supabase/server.ts`

- [ ] **Step 1: Create Supabase server client**

Create `src/lib/supabase/server.ts`:

```ts
import { createClient } from "@supabase/supabase-js";

export function createSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing Supabase environment variables");
  }

  return createClient(supabaseUrl, serviceRoleKey);
}
```

- [ ] **Step 2: Create the brands table in Supabase**

Run this SQL in your Supabase dashboard (SQL Editor):

```sql
CREATE TABLE brands (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id   text UNIQUE NOT NULL,
  name            text NOT NULL,
  email           text NOT NULL,
  logo_url        text,
  rto_threshold   integer DEFAULT 25,
  shopify_store   text,
  shopify_token   text,
  plan            text DEFAULT 'starter',
  onboarding_step integer DEFAULT 0,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/supabase/server.ts
git commit -m "feat: add Supabase server client"
```

---

## Task 11: Clerk Webhook — Sync Users to Supabase

**Files:**
- Create: `src/app/api/webhooks/clerk/route.ts`

- [ ] **Step 1: Install svix for webhook verification**

```bash
cd "/Users/noorkarimmehedi/Downloads/Instant:Creator"
npm install svix
```

- [ ] **Step 2: Create the Clerk webhook route**

Create `src/app/api/webhooks/clerk/route.ts`:

```ts
import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { createSupabaseAdmin } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: "Missing CLERK_WEBHOOK_SECRET" },
      { status: 500 }
    );
  }

  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json({ error: "Missing svix headers" }, { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (evt.type === "user.created") {
    const { id, email_addresses, first_name, last_name } = evt.data;
    const email = email_addresses[0]?.email_address ?? "";
    const name = [first_name, last_name].filter(Boolean).join(" ") || "My Brand";

    const supabase = createSupabaseAdmin();
    const { error } = await supabase.from("brands").insert({
      clerk_user_id: id,
      name,
      email,
    });

    if (error) {
      console.error("Failed to insert brand:", error);
      return NextResponse.json({ error: "DB insert failed" }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
```

- [ ] **Step 3: Verify build**

```bash
npm run build
```

Expected: build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/app/api/webhooks/clerk/route.ts package.json package-lock.json
git commit -m "feat: add Clerk webhook to sync users to Supabase brands table"
```

---

## Task 12: Dashboard Layout — Sidebar and Topbar

**Files:**
- Create: `src/components/dashboard/Sidebar.tsx`
- Create: `src/components/dashboard/Topbar.tsx`
- Create: `src/app/(dashboard)/layout.tsx`

- [ ] **Step 1: Create Sidebar**

Create `src/components/dashboard/Sidebar.tsx`:

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";

const mainNav = [
  { label: "Dashboard", icon: "◻", href: "/dashboard", badge: null },
  { label: "Products", icon: "📦", href: "/dashboard/products", badge: "0" },
  { label: "Influencers", icon: "👥", href: "/dashboard/influencers", badge: "0" },
  { label: "Orders", icon: "📋", href: "/dashboard/orders", badge: "0" },
  { label: "Payouts", icon: "💰", href: "/dashboard/payouts", badge: null },
];

const settingsNav = [
  { label: "Settings", icon: "⚙", href: "/dashboard/settings" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-60 flex-col border-r border-hairline-strong bg-surface-card animate-[fade-in_0.5s_ease] shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2 px-5 pb-6 pt-6 border-b border-hairline font-semibold text-[15px] tracking-tight">
        <span className="h-[7px] w-[7px] rounded-full bg-accent-green animate-[dot-pulse_2s_ease-in-out_infinite]" />
        InstantCreator
      </div>

      {/* Main nav */}
      <div className="px-0 pt-4">
        <p className="px-3 pb-2 text-[11px] font-medium tracking-[1.2px] uppercase text-white/30">
          Main
        </p>
        {mainNav.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex items-center gap-2.5 px-5 py-2 text-sm transition-colors duration-200 ${
                active
                  ? "text-ink bg-white/5"
                  : "text-charcoal hover:text-ink hover:bg-white/[0.03]"
              }`}
            >
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-sm bg-ink" />
              )}
              <span className="w-5 text-center text-base">{item.icon}</span>
              {item.label}
              {item.badge !== null && (
                <span className="ml-auto bg-surface-elevated border border-hairline px-[7px] py-px rounded-full text-[11px] text-mute">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Settings nav */}
      <div className="px-0 pt-4">
        <p className="px-3 pb-2 text-[11px] font-medium tracking-[1.2px] uppercase text-white/30">
          Settings
        </p>
        {settingsNav.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex items-center gap-2.5 px-5 py-2 text-sm transition-colors duration-200 ${
                active
                  ? "text-ink bg-white/5"
                  : "text-charcoal hover:text-ink hover:bg-white/[0.03]"
              }`}
            >
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-sm bg-ink" />
              )}
              <span className="w-5 text-center text-base">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </div>

      {/* User */}
      <div className="mt-auto border-t border-hairline px-5 py-4">
        <UserButton
          afterSignOutUrl="/"
          appearance={{
            elements: {
              rootBox: "flex items-center gap-2.5",
              userButtonTrigger: "flex items-center gap-2.5",
            },
          }}
        />
      </div>
    </aside>
  );
}
```

- [ ] **Step 2: Create Topbar**

Create `src/components/dashboard/Topbar.tsx`:

```tsx
import { Button } from "@/components/ui/Button";

interface TopbarProps {
  title: string;
  actions?: React.ReactNode;
}

export function Topbar({ title, actions }: TopbarProps) {
  return (
    <div className="flex items-center justify-between px-8 py-4 border-b border-hairline animate-[fade-in_0.5s_ease]">
      <h1 className="text-base font-medium">{title}</h1>
      <div className="flex items-center gap-2.5">
        {actions ?? (
          <>
            <Button variant="ghost" href="https://docs.instantcreator.com">
              Docs
            </Button>
            <Button variant="primary" href="/dashboard/settings">
              + Connect Shopify
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create dashboard layout**

Create `src/app/(dashboard)/layout.tsx`:

```tsx
import { Sidebar } from "@/components/dashboard/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">{children}</div>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/dashboard/Sidebar.tsx src/components/dashboard/Topbar.tsx src/app/\(dashboard\)/layout.tsx
git commit -m "feat: add dashboard layout with Sidebar and Topbar"
```

---

## Task 13: Dashboard Page — Empty State with Setup Checklist

**Files:**
- Create: `src/components/dashboard/StatsRow.tsx`
- Create: `src/components/dashboard/SetupChecklist.tsx`
- Create: `src/app/(dashboard)/dashboard/page.tsx`

- [ ] **Step 1: Create StatsRow**

Create `src/components/dashboard/StatsRow.tsx`:

```tsx
const stats = [
  { label: "Total Orders", value: "—" },
  { label: "Active Influencers", value: "—" },
  { label: "RTO Rate", value: "—" },
  { label: "Commission Due", value: "—" },
];

export function StatsRow() {
  return (
    <div className="grid grid-cols-4 gap-3 mb-8 animate-[fade-up_0.6s_ease_0.15s_both]">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-surface-card border border-hairline rounded-[10px] p-4"
        >
          <p className="text-xs text-mute mb-1.5">{stat.label}</p>
          <p className="font-display text-2xl text-white/30">{stat.value}</p>
          <div className="mt-2 h-2 rounded bg-gradient-to-r from-surface-elevated via-white/[0.04] to-surface-elevated bg-[length:200%_100%] animate-[shimmer_2s_ease-in-out_infinite]" />
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Create SetupChecklist**

Create `src/components/dashboard/SetupChecklist.tsx`:

```tsx
import { SwissCard } from "@/components/ui/SwissCard";

const steps = [
  {
    num: "1",
    title: "Connect your Shopify store",
    desc: "One-click OAuth. We'll sync your products and start tracking orders.",
    tag: "Required",
    href: "/dashboard/settings",
  },
  {
    num: "2",
    title: "List your first product",
    desc: "Choose which products influencers can promote and set commission rates.",
    href: "/dashboard/products",
  },
  {
    num: "3",
    title: "Invite your first influencer",
    desc: "Send an invite by email or phone. They'll get a unique discount code.",
    href: "/dashboard/influencers",
  },
  {
    num: "4",
    title: "Set your RTO threshold",
    desc: "Default is 25%. Influencers above this get auto-flagged after 30 orders.",
    href: "/dashboard/settings",
  },
];

interface SetupChecklistProps {
  currentStep: number;
}

export function SetupChecklist({ currentStep }: SetupChecklistProps) {
  return (
    <div className="max-w-[640px] mx-auto animate-[fade-up_0.6s_ease_0.2s_both]">
      <div className="text-center mb-12">
        <h1 className="font-display text-4xl font-normal tracking-tight mb-3">
          Welcome to InstantCreator
        </h1>
        <p className="text-base text-charcoal leading-normal">
          Complete these steps to start tracking influencer orders and
          commissions.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {steps.map((step, i) => {
          const isActive = currentStep === i;
          const isComplete = currentStep > i;

          return (
            <div
              key={step.num}
              style={{ animationDelay: `${0.3 + i * 0.1}s` }}
              className="animate-[fade-up_0.6s_ease_both]"
            >
              <SwissCard
                highlighted={isActive}
                className="!p-6 flex items-center gap-5 cursor-pointer"
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] border font-display text-lg transition-all duration-300 ${
                    isActive
                      ? "border-accent-blue bg-accent-blue/[0.08] text-accent-blue"
                      : isComplete
                        ? "border-accent-green bg-accent-green/[0.08] text-accent-green"
                        : "border-hairline-strong bg-surface-elevated"
                  }`}
                >
                  {isComplete ? "✓" : step.num}
                </div>
                <div className="flex-1">
                  <p className="text-[15px] font-medium mb-1">
                    {step.title}
                    {step.tag && (
                      <span
                        className={`ml-2 text-[11px] px-2 py-0.5 border rounded-full ${
                          isActive
                            ? "border-accent-blue/30 text-accent-blue"
                            : "border-hairline text-mute"
                        }`}
                      >
                        {step.tag}
                      </span>
                    )}
                  </p>
                  <p className="text-[13px] text-charcoal leading-snug">
                    {step.desc}
                  </p>
                </div>
                <span className="text-base text-mute transition-all duration-300 group-hover:translate-x-[3px] group-hover:text-ink">
                  &rarr;
                </span>
              </SwissCard>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create the dashboard page**

Create `src/app/(dashboard)/dashboard/page.tsx`:

```tsx
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createSupabaseAdmin } from "@/lib/supabase/server";
import { Topbar } from "@/components/dashboard/Topbar";
import { StatsRow } from "@/components/dashboard/StatsRow";
import { SetupChecklist } from "@/components/dashboard/SetupChecklist";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const supabase = createSupabaseAdmin();
  const { data: brand } = await supabase
    .from("brands")
    .select("onboarding_step")
    .eq("clerk_user_id", userId)
    .single();

  const currentStep = brand?.onboarding_step ?? 0;

  return (
    <>
      <Topbar title="Dashboard" />
      <div className="flex-1 overflow-y-auto px-8 py-12">
        <StatsRow />

        {/* Progress bar */}
        <div className="mb-8 animate-[fade-up_0.6s_ease_0.1s_both]">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[13px] text-mute">Setup progress</span>
            <span className="text-[13px] text-charcoal">
              {currentStep} of 4 complete
            </span>
          </div>
          <div className="h-[3px] rounded-sm bg-surface-elevated overflow-hidden">
            <div
              className="h-full rounded-sm bg-gradient-to-r from-accent-blue to-accent-green transition-all duration-1000 ease-out"
              style={{ width: `${(currentStep / 4) * 100}%` }}
            />
          </div>
        </div>

        <SetupChecklist currentStep={currentStep} />
      </div>
    </>
  );
}
```

- [ ] **Step 4: Verify build**

```bash
npm run build
```

Expected: build succeeds.

- [ ] **Step 5: Commit**

```bash
git add src/components/dashboard/StatsRow.tsx src/components/dashboard/SetupChecklist.tsx src/app/\(dashboard\)/dashboard/page.tsx
git commit -m "feat: add dashboard page with empty-state checklist and stats row"
```

---

## Task 14: Settings Page with Shopify Integration

**Files:**
- Create: `src/app/(dashboard)/dashboard/settings/page.tsx`
- Create: `src/lib/shopify/oauth.ts`
- Create: `src/app/api/shopify/auth/route.ts`
- Create: `src/app/api/shopify/callback/route.ts`

- [ ] **Step 1: Create Shopify OAuth helpers**

Create `src/lib/shopify/oauth.ts`:

```ts
export function buildShopifyAuthUrl(shop: string): string {
  const apiKey = process.env.SHOPIFY_API_KEY!;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/shopify/callback`;
  const scopes = "read_orders,read_products,write_discounts";
  const nonce = crypto.randomUUID();

  return `https://${shop}/admin/oauth/authorize?client_id=${apiKey}&scope=${scopes}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${nonce}`;
}

export async function exchangeCodeForToken(
  shop: string,
  code: string
): Promise<string> {
  const response = await fetch(
    `https://${shop}/admin/oauth/access_token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: process.env.SHOPIFY_API_KEY,
        client_secret: process.env.SHOPIFY_API_SECRET,
        code,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Shopify token exchange failed: ${response.statusText}`);
  }

  const data = await response.json();
  return data.access_token;
}
```

- [ ] **Step 2: Create Shopify auth initiation route**

Create `src/app/api/shopify/auth/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { buildShopifyAuthUrl } from "@/lib/shopify/oauth";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const shop = req.nextUrl.searchParams.get("shop");
  if (!shop) {
    return NextResponse.json({ error: "Missing shop parameter" }, { status: 400 });
  }

  const authUrl = buildShopifyAuthUrl(shop);
  return NextResponse.redirect(authUrl);
}
```

- [ ] **Step 3: Create Shopify callback route**

Create `src/app/api/shopify/callback/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { exchangeCodeForToken } from "@/lib/shopify/oauth";
import { createSupabaseAdmin } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  const shop = req.nextUrl.searchParams.get("shop");
  const code = req.nextUrl.searchParams.get("code");

  if (!shop || !code) {
    return NextResponse.redirect(
      new URL("/dashboard/settings?error=missing_params", req.url)
    );
  }

  try {
    const accessToken = await exchangeCodeForToken(shop, code);

    const supabase = createSupabaseAdmin();
    const { error } = await supabase
      .from("brands")
      .update({
        shopify_store: shop,
        shopify_token: accessToken,
        onboarding_step: 1,
        updated_at: new Date().toISOString(),
      })
      .eq("clerk_user_id", userId);

    if (error) {
      console.error("Failed to save Shopify token:", error);
      return NextResponse.redirect(
        new URL("/dashboard/settings?error=db_error", req.url)
      );
    }

    return NextResponse.redirect(
      new URL("/dashboard?shopify=connected", req.url)
    );
  } catch (err) {
    console.error("Shopify OAuth error:", err);
    return NextResponse.redirect(
      new URL("/dashboard/settings?error=oauth_failed", req.url)
    );
  }
}
```

- [ ] **Step 4: Create Settings page**

Create `src/app/(dashboard)/dashboard/settings/page.tsx`:

```tsx
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createSupabaseAdmin } from "@/lib/supabase/server";
import { Topbar } from "@/components/dashboard/Topbar";
import { SwissCard } from "@/components/ui/SwissCard";
import { Button } from "@/components/ui/Button";

export default async function SettingsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const supabase = createSupabaseAdmin();
  const { data: brand } = await supabase
    .from("brands")
    .select("*")
    .eq("clerk_user_id", userId)
    .single();

  const isShopifyConnected = Boolean(brand?.shopify_store);

  return (
    <>
      <Topbar title="Settings" actions={null} />
      <div className="flex-1 overflow-y-auto px-8 py-12">
        <div className="max-w-[640px] mx-auto space-y-6">
          {/* Profile */}
          <SwissCard>
            <h2 className="text-lg font-medium mb-4">Profile</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-mute mb-1.5">
                  Brand Name
                </label>
                <div className="bg-surface-elevated border border-hairline-strong rounded-[8px] px-3.5 py-2.5 text-sm text-ink">
                  {brand?.name ?? "—"}
                </div>
              </div>
              <div>
                <label className="block text-xs text-mute mb-1.5">Email</label>
                <div className="bg-surface-elevated border border-hairline-strong rounded-[8px] px-3.5 py-2.5 text-sm text-ink">
                  {brand?.email ?? "—"}
                </div>
              </div>
            </div>
          </SwissCard>

          {/* Shopify Integration */}
          <SwissCard highlighted={!isShopifyConnected}>
            <h2 className="text-lg font-medium mb-4">Shopify Integration</h2>
            {isShopifyConnected ? (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="h-2 w-2 rounded-full bg-accent-green animate-[dot-pulse_2s_ease-in-out_infinite]" />
                  <span className="text-sm text-accent-green">Connected</span>
                </div>
                <div className="bg-surface-elevated border border-hairline-strong rounded-[8px] px-3.5 py-2.5 text-sm text-charcoal">
                  {brand?.shopify_store}
                </div>
              </div>
            ) : (
              <div>
                <p className="text-sm text-charcoal mb-4 leading-relaxed">
                  Connect your Shopify store to start syncing products and
                  tracking influencer orders.
                </p>
                <form className="flex items-end gap-3">
                  <div className="flex-1">
                    <label className="block text-xs text-mute mb-1.5">
                      Store URL
                    </label>
                    <input
                      name="shop"
                      type="text"
                      placeholder="yourstore.myshopify.com"
                      className="w-full bg-surface-card border border-hairline-strong rounded-[8px] px-3.5 py-2.5 text-sm text-ink placeholder:text-stone focus:border-ink focus:outline-none transition-colors"
                    />
                  </div>
                  <Button
                    variant="primary"
                    type="submit"
                    className="shrink-0"
                  >
                    Connect Store
                  </Button>
                </form>
              </div>
            )}
          </SwissCard>

          {/* RTO Threshold */}
          <SwissCard>
            <h2 className="text-lg font-medium mb-4">RTO Threshold</h2>
            <p className="text-sm text-charcoal mb-4 leading-relaxed">
              Influencers with a return-to-origin rate above this percentage
              will be auto-flagged after 30 orders.
            </p>
            <div className="flex items-center gap-3">
              <div className="bg-surface-elevated border border-hairline-strong rounded-[8px] px-3.5 py-2.5 text-sm text-ink w-20 text-center">
                {brand?.rto_threshold ?? 25}%
              </div>
              <span className="text-xs text-mute">Default: 25%</span>
            </div>
          </SwissCard>

          {/* Billing */}
          <SwissCard>
            <h2 className="text-lg font-medium mb-4">Billing</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-charcoal">Current plan</p>
                <p className="text-lg font-medium capitalize">
                  {brand?.plan ?? "starter"}
                </p>
              </div>
              <Button variant="outline" href="#pricing">
                Upgrade Plan
              </Button>
            </div>
          </SwissCard>
        </div>
      </div>
    </>
  );
}
```

- [ ] **Step 5: Verify build**

```bash
npm run build
```

Expected: build succeeds.

- [ ] **Step 6: Commit**

```bash
git add src/lib/shopify/oauth.ts src/app/api/shopify src/app/\(dashboard\)/dashboard/settings/page.tsx
git commit -m "feat: add Settings page with Shopify OAuth integration"
```

---

## Self-Review Checklist

- [x] **Spec coverage:** All 12 spec sections covered — design tokens (Task 2), typography (Task 2), Swiss cards (Task 3), animations (Task 4), landing page sections (Tasks 5-8), auth (Task 9), database (Task 10), Clerk webhook (Task 11), dashboard layout (Task 12), empty-state checklist (Task 13), settings + Shopify OAuth (Task 14). Section 10 "What's NOT" is out-of-scope by definition.
- [x] **Placeholder scan:** No TBDs, TODOs, or vague instructions. All steps have concrete code.
- [x] **Type consistency:** `createSupabaseAdmin()` used consistently across Tasks 10, 11, 13, 14. `SwissCard` props (`highlighted`, `elevated`, `className`) match across all usages. `Button` variants (`primary`, `ghost`, `outline`) match Task 3 definition.
