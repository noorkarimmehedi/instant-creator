import test from "node:test";
import assert from "node:assert/strict";

import { buildCouponCode, buildTrackedProductUrl } from "./discounts.ts";

test("buildCouponCode creates a stable Shopify-safe product creator code", () => {
  assert.equal(
    buildCouponCode("Red Silk Dress", "user_2Zabcdefghi"),
    "RED-SILK-DRESS-2ZABCDEF"
  );
});

test("buildTrackedProductUrl appends creator and coupon tracking", () => {
  assert.equal(
    buildTrackedProductUrl("https://shop.example/products/dress?variant=1", "user_2Zabcdefghi", "RED-2ZABCDEF"),
    "https://shop.example/products/dress?variant=1&ref=user_2Zabcdefghi&coupon=RED-2ZABCDEF"
  );
});
