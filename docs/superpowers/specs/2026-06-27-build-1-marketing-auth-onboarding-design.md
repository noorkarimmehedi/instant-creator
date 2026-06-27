# InstantCreator — Build 1: Marketing Site + Auth + Brand Onboarding

**Date:** 2026-06-27
**Scope:** Landing page, Clerk authentication, brand dashboard (empty-state), Shopify OAuth connection, Supabase database

---

## 1. Overview

Build 1 delivers the public-facing marketing site, Clerk-based authentication, and the brand dashboard with empty-state guided onboarding. Shopify OAuth is functional (store connects, token stored) but order sync/webhooks are deferred to Build 2.

This build establishes the Resend-inspired dark design system with Swiss-style card components that every future build inherits.

## 2. Architecture

**Approach:** Server Components + Server Actions (Approach A)

- Landing page is fully server-rendered for SEO and speed
- Dashboard uses server components for data fetching, server actions for mutations
- Supabase queries happen server-side via `@supabase/supabase-js` with service role key
- Clerk middleware protects all `/(dashboard)` routes
- Shopify OAuth callback handled by Next.js API route

**Stack:**
- Next.js 16 (App Router, React 19)
- Clerk (authentication)
- Supabase (PostgreSQL database — data only, no auth)
- Tailwind CSS 4 (styling)
- Vercel (deployment)

## 3. App Structure

```
src/
  app/
    (marketing)/
      page.tsx              — Landing page
      layout.tsx            — Marketing layout (navbar + footer)
    (auth)/
      sign-in/[[...sign-in]]/page.tsx
      sign-up/[[...sign-up]]/page.tsx
      layout.tsx            — Centered auth layout (dark canvas)
    (dashboard)/
      dashboard/
        page.tsx            — Main dashboard (empty-state guided)
        settings/page.tsx   — Settings page (profile, Shopify, RTO config, billing)
      layout.tsx            — Dashboard layout (sidebar + topbar)
    api/
      shopify/
        auth/route.ts       — Initiates Shopify OAuth
        callback/route.ts   — Handles Shopify OAuth callback, stores token
      webhooks/
        clerk/route.ts      — Clerk user.created webhook → inserts brand row in Supabase
    layout.tsx              — Root layout (fonts, globals, ClerkProvider)
    globals.css             — Design tokens as CSS custom properties + Tailwind config
  middleware.ts             — Clerk auth middleware, protects /(dashboard)/*
  lib/
    supabase/
      server.ts             — createClient() with service role key for server-side use
      types.ts              — Generated TypeScript types from Supabase
    shopify/
      oauth.ts              — buildAuthUrl(), exchangeCode() helpers
  components/
    marketing/              — Landing page section components
      Navbar.tsx
      Hero.tsx
      ProblemSection.tsx
      HowItWorks.tsx
      FeaturesSection.tsx
      PricingSection.tsx
      Footer.tsx
    dashboard/              — Dashboard components
      Sidebar.tsx
      Topbar.tsx
      StatsRow.tsx
      SetupChecklist.tsx
    ui/                     — Shared design system primitives
      Button.tsx            — primary, ghost, outline variants
      SwissCard.tsx         — Card with + corner markers and hover animations
      Badge.tsx             — Pill badge component
      SectionHeader.tsx     — Label + serif heading + subtitle
```

## 4. Design System

Based on the approved Resend-inspired design document with Swiss-style enhancements.

### Core Tokens (CSS Custom Properties)

```css
--canvas: #000000;
--ink: #fcfdff;
--body: rgba(252,253,255,0.86);
--charcoal: rgba(252,253,255,0.7);
--mute: #a1a4a5;
--surface-card: #0a0a0c;
--surface-elevated: #101012;
--surface-deep: #06060a;
--hairline: rgba(255,255,255,0.06);
--hairline-strong: rgba(255,255,255,0.14);
--accent-orange: #ff801f;
--accent-blue: #3b9eff;
--accent-green: #11ff99;
--accent-red: #ff2047;
--accent-yellow: #ffc53d;
```

### Typography

- **Display:** DM Serif Display (Google Fonts substitute for Domaine Display), 48–80px, weight 400, line-height 1.0
- **Body:** Inter, 14–18px, weight 400–500
- **Code:** Geist Mono, 13px

### Swiss Card Pattern

Every card component includes:
- `+` markers in all four corners (top-left, top-right, bottom-left, bottom-right)
- Corners at `rgba(255,255,255,0.12)` resting, `rgba(255,255,255,0.35)` on hover
- Top-left and bottom-left `+` rotate 90° on hover
- Card lifts `translateY(-2px)` with border brightening on hover
- Background: `--surface-card`, border: `--hairline-strong`, radius: 12px

### Animations

- **Scroll-triggered fade-up:** IntersectionObserver, 0.7s ease, staggered delays (0.1–0.4s)
- **Hero sequence:** Badge → headline → subtitle → CTAs, staggered 0.2s intervals
- **Atmospheric glows:** Slow-pulsing radial gradients (6–8s cycle), orange for hero, blue for features
- **Section dividers:** Gradient line-grow animation on scroll
- **Nav:** Sticky with backdrop-blur glass effect, link underline slide-in on hover
- **Logo:** Green dot with pulsing box-shadow animation
- **Stat shimmer:** Empty-state loading shimmer on stat cards (2s cycle)
- **Gradient text:** "fraud" in hero headline uses orange→yellow gradient fill

### Button Variants

| Variant | Background | Text | Border | Use |
|---------|-----------|------|--------|-----|
| Primary | `--ink` (#fcfdff) | `--canvas` (#000) | none | Main CTA, one per viewport |
| Ghost | `--surface-elevated` | `--ink` | `--hairline-strong` | Secondary actions |
| Outline | transparent | `--ink` | `--hairline-strong` | Tertiary actions |

All buttons: 8px radius, 14px/500 Inter, translateY(-1px) on hover.

## 5. Landing Page Sections

Approved layout (see mockup `landing-page-v2.html`):

1. **Navbar** — sticky, backdrop-blur, green pulsing dot + "InstantCreator" logo, nav links with underline hover, white "Get Started" CTA
2. **Hero** — badge pill ("Bangladesh's First Influencer-Brand Marketplace"), DM Serif Display 80px "Track orders. / Filter fraud. / Pay creators." with gradient text on "fraud", subtitle, dual CTAs (primary + outline), warm orange atmospheric glow
3. **Problem** — section label "THE PROBLEM", serif heading, 3 Swiss stat cards with accent-colored numbers (৳5L+ red, 40%+ orange, Zero yellow), color accent lines
4. **How It Works** — 3 step cards connected by gradient horizontal line, numbered boxes with hover scale, serif step numbers
5. **Features** — 2×2 Swiss card grid, blue atmospheric glow, icon boxes, feature tags in pill badges, hover animations
6. **Pricing** — 3 tiers (Starter ৳2,000 / Growth ৳5,000 / Pro ৳12,000), Growth tier elevated (`--surface-elevated`), "Popular" badge, white CTA on featured tier, arrow-prefixed feature lists
7. **Footer** — minimal, copyright + links

## 6. Dashboard

### Sidebar Navigation

**Main section:**
- Dashboard (active state: white 2px left bar indicator)
- Products (badge: count)
- Influencers (badge: count)
- Orders (badge: count)
- Payouts

**Settings section:**
- Settings (single page containing all configuration)

**Bottom:** User avatar + brand name + plan label

### Empty State (post-signup)

1. **Stats row** — 4 mini cards (Total Orders, Active Influencers, RTO Rate, Commission Due) showing em-dash values with shimmer loading animation
2. **Progress bar** — "0 of 4 complete" with blue→green gradient fill
3. **Welcome message** — DM Serif Display "Welcome to InstantCreator" + subtitle
4. **Setup checklist** — 4 Swiss-style checklist cards:
   - Step 1: "Connect your Shopify store" — highlighted in blue, "Required" tag
   - Step 2: "List your first product"
   - Step 3: "Invite your first influencer"
   - Step 4: "Set your RTO threshold"
   - Each card: staggered fade-up, `+` corners, arrow that slides right on hover

### Settings Page

Single page with sections:
- **Profile** — brand name, email, logo upload
- **Shopify Integration** — connect/disconnect button, connection status, store URL display
- **RTO Threshold** — input field (default 25%), description of auto-flagging behavior
- **Billing** — current plan display, upgrade CTA

## 7. Database Schema

Single table for Build 1:

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

- `clerk_user_id`: links to Clerk user, synced via webhook
- `shopify_token`: Shopify API access token from OAuth exchange
- `onboarding_step`: 0–4 integer driving checklist UI highlight state
- `plan`: `starter` | `growth` | `pro`
- No RLS — all access via server-side service role client

## 8. Auth Flow (Clerk)

1. User clicks "Get Started" → Clerk sign-up page (`/(auth)/sign-up`)
2. Clerk handles email/password + verification
3. On `user.created` webhook → `/api/webhooks/clerk` inserts row into `brands` table
4. User redirected to `/(dashboard)/dashboard`
5. Clerk middleware blocks unauthenticated access to all `/(dashboard)` routes

## 9. Shopify OAuth Flow

1. Brand clicks "Connect Shopify" (checklist step 1 or Settings page)
2. Server action calls `/api/shopify/auth` → redirects to Shopify OAuth consent screen
3. Shopify redirects back to `/api/shopify/callback` with auth code
4. Callback route exchanges code for access token via Shopify API
5. Token stored in `brands.shopify_token`, store URL in `brands.shopify_store`
6. `brands.onboarding_step` updated to 1
7. Brand redirected back to dashboard — checklist step 1 shows complete

Order sync via webhooks is deferred to Build 2.

## 10. What's NOT in Build 1

- Influencer portal and profiles
- Product listing and marketplace
- Order sync via Shopify webhooks
- Commission calculation and tracking
- bKash/bank payout integration
- RTO fraud detection logic (threshold configurable but not enforced)
- Admin panel
- Bengali/Banglish language support

## 11. Dependencies

```
@clerk/nextjs          — Clerk SDK for Next.js
@supabase/supabase-js  — Supabase client
```

## 12. Environment Variables

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
SHOPIFY_API_KEY
SHOPIFY_API_SECRET
NEXT_PUBLIC_APP_URL
```
