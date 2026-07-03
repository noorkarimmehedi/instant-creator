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
