import test from "node:test";
import assert from "node:assert/strict";

import { getSettingsToastMessage } from "./toast.ts";

test("getSettingsToastMessage maps known settings events", () => {
  assert.equal(getSettingsToastMessage("brand-profile"), "Brand profile saved");
  assert.equal(getSettingsToastMessage("creator-payout"), "Payout method saved");
});

test("getSettingsToastMessage ignores unknown settings events", () => {
  assert.equal(getSettingsToastMessage("bad"), null);
  assert.equal(getSettingsToastMessage(null), null);
});
