import test from "node:test";
import assert from "node:assert/strict";
import { formatTaka, readPercentageValue } from "./formatting.ts";

test("formatTaka displays product prices with Bangladeshi taka symbol", () => {
  assert.equal(formatTaka(1250), "৳1,250");
  assert.equal(formatTaka("499.5"), "৳499.50");
  assert.equal(formatTaka(null), "—");
});

test("readPercentageValue accepts editable commission and coupon percentages", () => {
  assert.equal(readPercentageValue("12.5"), 12.5);
  assert.equal(readPercentageValue("0"), 0);
  assert.equal(readPercentageValue("100"), 100);
  assert.equal(readPercentageValue("101"), null);
  assert.equal(readPercentageValue("bad"), null);
});
