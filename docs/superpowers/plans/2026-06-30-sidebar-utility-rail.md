# Sidebar Utility Rail Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove duplicate navigation from the sidebar rail while keeping the approved rounded neutral sidebar style.

**Architecture:** Keep the existing sidebar components and links. Change the rail to utility-only, leaving navigation icons and labels only inside the `#F5F5F5` panel.

**Tech Stack:** Next.js App Router, React 19, Tailwind CSS 4.

---

## File Structure

- Modify `src/components/dashboard/Sidebar.tsx`: remove rail nav map; keep brand, theme toggle, and user button in rail.
- Modify `src/components/creator/CreatorSidebarClient.tsx`: same utility rail treatment for creator dashboard.
- Modify `src/app/(dashboard)/layout.tsx`: reduce skeleton width to match the utility rail layout.
- Modify `src/app/(creator)/creator/layout.tsx`: reduce skeleton width to match the utility rail layout.

## Tasks

- [ ] Remove duplicated nav icons from both sidebar rails.
- [ ] Keep full navigation with existing icons inside each rounded panel.
- [ ] Change sidebar width from `304px` to `272px`, with a `56px` utility rail.
- [ ] Update loading skeletons to `272px` and `56px` rail columns.
- [ ] Run `npm run lint`.
