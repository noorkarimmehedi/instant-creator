import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { buildShopifyAuthUrl, generateNonce } from "@/lib/shopify/oauth";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const shop = searchParams.get("shop");

  if (!shop) {
    return NextResponse.json({ error: "Missing shop parameter" }, { status: 400 });
  }

  const state = generateNonce();
  const cookieStore = await cookies();
  cookieStore.set("shopify_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
  });

  const authUrl = buildShopifyAuthUrl(shop, state);
  return NextResponse.redirect(authUrl);
}
