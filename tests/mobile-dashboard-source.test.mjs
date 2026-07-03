import { readFile } from "node:fs/promises";
import test from "node:test";
import assert from "node:assert/strict";

async function read(path) {
  return readFile(path, "utf8");
}

test("dashboard shell has mobile top bar, drawer, and desktop sidebar breakpoints", async () => {
  const source = await read("src/components/dashboard/DashboardShellClient.tsx");

  assert.match(source, /<header\s+className="[^"]*\bmd:hidden\b[^"]*"/);
  assert.match(source, /<div\s+className="[^"]*\bhidden\b[^"]*\bmd:block\b[^"]*"/);
  assert.match(source, /<button[\s\S]*?aria-label="Open navigation"/);
  assert.match(source, /<button[\s\S]*?aria-label="Close navigation"/);
  assert.match(source, /className={`[\s\S]*?transition-transform[\s\S]*?open \? "translate-x-0" : "-translate-x-full"/);
});

test("dashboard layouts use responsive shell instead of fixed mobile sidebar", async () => {
  const brandLayout = await read("src/app/(dashboard)/layout.tsx");
  const creatorLayout = await read("src/app/(creator)/creator/layout.tsx");

  assert.match(brandLayout, /<DashboardShellClient\b|<DashboardSidebar>\s*{children}\s*<\/DashboardSidebar>/);
  assert.match(creatorLayout, /<DashboardShellClient\b|<CreatorSidebar>\s*{children}\s*<\/CreatorSidebar>/);
  assert.doesNotMatch(brandLayout, /<div className="flex h-screen/);
  assert.doesNotMatch(creatorLayout, /<div className="flex h-screen/);
});

test("topbar and high-traffic pages use mobile-safe spacing", async () => {
  const topbar = await read("src/components/dashboard/Topbar.tsx");
  const brandHome = await read("src/app/(dashboard)/dashboard/page.tsx");
  const creatorHome = await read("src/app/(creator)/creator/page.tsx");

  assert.match(topbar, /<header\s+className="[^"]*\bpx-4\b[^"]*\bsm:px-6\b[^"]*\blg:px-8\b[^"]*"/);
  assert.match(brandHome, /className="[^"]*\bp-4\b[^"]*\bsm:p-6\b[^"]*\blg:p-8\b[^"]*"/);
  assert.match(creatorHome, /className="[^"]*\bp-4\b[^"]*\bsm:p-6\b[^"]*\blg:p-8\b[^"]*"/);
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
    assert.match(source, /space-y-3 md:hidden/, `${file} needs a mobile card list`);
    assert.match(source, /hidden md:block md:overflow-x-auto/, `${file} needs desktop-only table wrapper`);
  }
});
