import test from "node:test";
import assert from "node:assert/strict";

import { buildAvatarStoragePath, isAllowedAvatarMimeType } from "./avatar.ts";

test("buildAvatarStoragePath creates stable per-user avatar paths", () => {
  assert.equal(buildAvatarStoragePath("user_abc", "profile.png"), "avatars/user_abc.png");
  assert.equal(buildAvatarStoragePath("user_abc", "profile"), "avatars/user_abc.jpg");
});

test("isAllowedAvatarMimeType only accepts web image formats", () => {
  assert.equal(isAllowedAvatarMimeType("image/jpeg"), true);
  assert.equal(isAllowedAvatarMimeType("image/png"), true);
  assert.equal(isAllowedAvatarMimeType("image/webp"), true);
  assert.equal(isAllowedAvatarMimeType("application/pdf"), false);
});
