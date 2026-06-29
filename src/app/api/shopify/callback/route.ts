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
  const clientId = cookieStore.get("shopify_client_id")?.value;
  const clientSecret = cookieStore.get("shopify_client_secret")?.value;

  if (state !== savedState) {
    return NextResponse.json({ error: "Invalid state" }, { status: 403 });
  }

  if (!clientId || !clientSecret) {
    return NextResponse.json(
      { error: "Missing Shopify OAuth credentials" },
      { status: 400 }
    );
  }

  cookieStore.delete("shopify_state");
  cookieStore.delete("shopify_client_id");
  cookieStore.delete("shopify_client_secret");

  const accessToken = await exchangeCodeForToken(shop, code, clientId, clientSecret);

  const supabase = createSupabaseAdmin();
  await supabase
    .from("brands")
    .update({
      shopify_store: shop,
      shopify_token: accessToken,
      shopify_api_secret: clientSecret,
      onboarding_step: 1,
      updated_at: new Date().toISOString(),
    })
    .eq("clerk_user_id", userId);

  const webhookAddress = `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/shopify`;
  await fetch(`https://${shop}/admin/api/2024-10/webhooks.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": accessToken,
    },
    body: JSON.stringify({
      webhook: {
        topic: "orders/create",
        address: webhookAddress,
        format: "json",
      },
    }),
  });

  return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?connected=true`);
}
