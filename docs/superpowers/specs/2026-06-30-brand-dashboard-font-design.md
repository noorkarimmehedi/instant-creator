# Brand Dashboard Font Design

## Goal

Make the brand dashboard use the same clean sans-serif typography feel as the creator dashboard across all `/dashboard` pages.

## Scope

- Applies to brand dashboard routes under `src/app/(dashboard)/dashboard` and shared dashboard components used there.
- Does not change marketing, auth, or creator dashboard typography.
- Removes explicit display-font usage that currently makes brand dashboard stats and welcome headings look different from the creator dashboard.

## Approach

Use the existing body font stack already configured globally. Add any needed route-level or component-level classes so brand dashboard content inherits the creator-style sans-serif typography. Replace brand-dashboard-only `font-display` usage with body/sans styling where it overrides that inheritance.

## Acceptance Criteria

- Brand dashboard stats, headings, forms, cards, topbar, and navigation use the creator-style sans-serif font.
- No marketing or auth pages are visually changed by the font update.
- The app passes lint after the change.
