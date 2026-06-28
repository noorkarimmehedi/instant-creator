import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { buildShopifyAuthUrl, generateNonce } from "@/lib/shopify/oauth";
import { cookies } from "next/headers";

function normalizeShop(shop: string) {
  return shop
    .trim()
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "");
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const shop = normalizeShop(String(formData.get("shop") ?? ""));
  const clientId = String(formData.get("client_id") ?? "").trim();
  const clientSecret = String(formData.get("client_secret") ?? "").trim();

  if (!shop || !clientId || !clientSecret) {
    return NextResponse.json(
      { error: "Missing Shopify store, client ID, or client secret" },
      { status: 400 }
    );
  }

  const state = generateNonce();
  const cookieStore = await cookies();
  cookieStore.set("shopify_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
  });
  cookieStore.set("shopify_client_id", clientId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
  });
  cookieStore.set("shopify_client_secret", clientSecret, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
  });

  const authUrl = buildShopifyAuthUrl(shop, state, clientId);
  return NextResponse.redirect(authUrl);
}
