# Two Column Sidebar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the dashboard-style sidebar with the approved two-column neutral sidebar preview while keeping the app's existing icon set.

**Architecture:** Update the existing brand and creator sidebar components in place. Keep routing and auth data unchanged; only alter sidebar layout classes and markup.

**Tech Stack:** Next.js App Router, React 19, Tailwind CSS 4.

---

## File Structure

- Modify `src/components/dashboard/Sidebar.tsx`: brand sidebar two-column shell.
- Modify `src/components/creator/CreatorSidebarClient.tsx`: creator sidebar two-column shell.
- Modify `src/app/(dashboard)/layout.tsx`: brand loading skeleton width/background.
- Modify `src/app/(creator)/creator/layout.tsx`: creator loading skeleton width/background.

## Tasks

- [ ] Replace each `aside` with a 304px grid: 64px icon rail + 1fr rounded panel.
- [ ] Keep current SVG icon components and render them in the rail and panel links.
- [ ] Use `bg-[#e5e5e5]` for the outer shell and `bg-[#F5F5F5]` for the inner panel.
- [ ] Keep profile/user controls at the bottom of the inner panel.
- [ ] Run `npm run lint`.
- [ ] Capture a local preview screenshot with gstack browse.
