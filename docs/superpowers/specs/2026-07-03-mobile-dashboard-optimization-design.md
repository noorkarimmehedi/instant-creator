# Mobile Dashboard Optimization Design

## Context

Both the brand dashboard and creator dashboard currently use a desktop-only shell on every viewport. The layouts force a `240px` sidebar next to the page content with `h-screen` and desktop page padding. On phones this squeezes the main content, makes tables hard to use, and creates a dashboard experience that feels broken even when the data loads correctly.

The approved direction is a mobile top bar with a slide-out menu. Desktop keeps the current sidebar pattern.

## Goals

- Make both brand and creator dashboards usable on phones without changing business logic.
- Preserve the current desktop visual language and sidebar behavior.
- Reuse the same responsive shell pattern for both account types.
- Reduce horizontal overflow from fixed sidebars, wide tables, dense forms, and desktop padding.
- Keep navigation discoverable on mobile with a clear menu button and drawer.

## Non-Goals

- No redesign of the marketing or auth pages.
- No changes to Supabase data models, server actions, or dashboard calculations.
- No new navigation destinations.
- No full visual rebrand.

## Approved Approach

Use a responsive dashboard shell:

- `md` and wider: keep the existing desktop sidebar layout.
- Below `md`: hide the desktop sidebar and show a compact mobile top bar.
- The mobile top bar includes a menu button, current page title, and account affordance.
- The menu button opens a slide-out drawer containing the same navigation links and account identity shown in the desktop sidebar.
- Main content uses mobile-safe spacing: small padding on phones, progressively larger padding on wider screens.

This approach was selected over bottom tabs and horizontal pill navigation because both dashboards have enough destinations that tabs or pills would become cramped or hide important links.

## Components

### Responsive Dashboard Shell

Create or refactor toward shared shell primitives used by both dashboard groups:

- Brand dashboard passes brand nav items, settings nav, brand name, and plan.
- Creator dashboard passes creator nav items, settings nav, display name, and verification status.
- The shell owns the breakpoint behavior: desktop sidebar, mobile top bar, mobile drawer, and scroll container.

The implementation can be incremental if a full shared abstraction creates too much churn. The key requirement is that brand and creator behavior stay visually and structurally consistent.

### Mobile Drawer

The drawer should:

- Slide in from the left.
- Include the `Zair's/Creator` brand mark.
- Show main navigation and settings navigation.
- Show the user/account section at the bottom.
- Close when a nav link is selected.
- Provide accessible labels for open and close controls.

### Topbar

Update the shared `Topbar` to support mobile spacing:

- Phone: shorter horizontal padding and title text that does not overflow.
- Desktop: keep the current spacing and visual weight.
- If actions are passed as children, they should wrap or stack cleanly on small screens.

## Page-Level Responsive Rules

Apply these rules across both dashboard trees:

- Replace page wrappers like `p-8` with responsive padding such as `p-4 sm:p-6 lg:p-8`.
- Keep stats cards single-column on phones, two columns where useful, and current desktop grids on large screens.
- Product grids should avoid cramped two-column mobile cards when forms are present. Product cards with editable fields should have enough width for inputs and buttons.
- Forms should stack controls vertically on phones and avoid tiny inline action areas.
- Tables should not be the only mobile view for high-use pages.

## Table Strategy

Pages with order, payout, earning, or influencer tables should provide a mobile-friendly card/list representation below `md` while keeping the existing table on desktop.

Mobile cards should show the important fields first:

- Orders: order number/customer, status, total, commission, courier/return info where present.
- Creator earnings: product/order/customer context, status, commission amount.
- Payouts: creator, amount, note/date.
- Influencers: creator name/email, verification/state, key metrics.

Desktop tables remain available at `md` and wider. Horizontal scroll can remain as a fallback, but it should not be the primary phone experience.

## Error Handling And Empty States

Responsive changes should preserve existing empty states and error messages. If a table has no rows, the mobile card list should show the same empty message rather than a blank area.

Drawer state should be client-only UI state. If JavaScript is available, users can open and close it. If the drawer is closed or unavailable, the desktop route pages should still render their content normally.

## Testing And Verification

Verify these routes at mobile and desktop widths:

- `/dashboard`
- `/dashboard/products`
- `/dashboard/orders`
- `/dashboard/influencers`
- `/dashboard/payouts`
- `/dashboard/settings`
- `/creator`
- `/creator/products`
- `/creator/orders`
- `/creator/earnings`
- `/creator/settings`

Verification should check:

- No fixed sidebar visible on phones.
- Mobile top bar appears on phones and not on desktop.
- Drawer opens, closes, and contains the expected links.
- Content does not require horizontal page scrolling.
- Tables are usable on phones through card/list views where specified.
- Desktop layout remains materially unchanged.

## Open Decisions

None. The selected mobile navigation pattern is top bar with slide-out drawer.
