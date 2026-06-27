import crypto from "crypto";

export function buildShopifyAuthUrl(shop: string, state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.SHOPIFY_API_KEY!,
    scope: "read_products,read_orders",
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/shopify/callback`,
    state,
  });

  return `https://${shop}/admin/oauth/authorize?${params.toString()}`;
}

export async function exchangeCodeForToken(
  shop: string,
  code: string
): Promise<string> {
  const res = await fetch(`https://${shop}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.SHOPIFY_API_KEY!,
      client_secret: process.env.SHOPIFY_API_SECRET!,
      code,
    }),
  });

  if (!res.ok) {
    throw new Error(`Shopify token exchange failed: ${res.statusText}`);
  }

  const data = await res.json();
  return data.access_token;
}

export function generateNonce(): string {
  return crypto.randomBytes(16).toString("hex");
}
