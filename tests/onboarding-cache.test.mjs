import { readFile } from "node:fs/promises";
import test from "node:test";
import assert from "node:assert/strict";

test("onboarding expires role caches before redirecting", async () => {
  const source = await readFile("src/app/(auth)/onboarding/actions.ts", "utf8");

  assert.match(source, /import \{ updateTag \} from "next\/cache";/);
  assert.doesNotMatch(source, /revalidateTag\("(?:brand|influencer)",\s*"max"\)/);
  assert.match(source, /updateTag\("brand"\)/);
  assert.match(source, /updateTag\("influencer"\)/);
});
