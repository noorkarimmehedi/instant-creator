import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { exchangeCodeForToken } from "@/lib/shopify/oauth";
import { createSupabaseAdmin } from "@/lib/supabase/server";

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const shop = searchParams.get("shop");
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  if (!shop || !code || !state) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  const cookieStore = await cookies();
  const savedState = cookieStore.get("shopify_state")?.value;

  if (state !== savedState) {
    return NextResponse.json({ error: "Invalid state" }, { status: 403 });
  }

  cookieStore.delete("shopify_state");

  const accessToken = await exchangeCodeForToken(shop, code);

  const supabase = createSupabaseAdmin();
  await supabase
    .from("brands")
    .update({
      shopify_store: shop,
      shopify_token: accessToken,
      onboarding_step: 1,
      updated_at: new Date().toISOString(),
    })
    .eq("clerk_user_id", userId);

  return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?connected=true`);
}
