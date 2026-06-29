const DEFAULT_SHOPIFY_API_VERSION = "2024-10";

type ShopifyPriceRuleResponse = {
  price_rule?: { id?: number | string };
  errors?: unknown;
};

type ShopifyDiscountCodeResponse = {
  discount_code?: { id?: number | string; code?: string };
  errors?: unknown;
};

export type ShopifyDiscountResult = {
  code: string;
  priceRuleId: string;
  discountCodeId: string;
};

export function buildCouponCode(influencerName: string | null, productId: string, influencerUserId: string) {
  const creatorPart = (influencerName || "CREATOR")
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "")
    .replace(/^-+|-+$/g, "")
    .slice(0, 18) || "CREATOR";
  const digits = String(hashToThreeDigits(`${productId}:${influencerUserId}`)).padStart(3, "0");

  return `${creatorPart}${digits}`;
}

function hashToThreeDigits(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) % 1000;
  }
  return hash;
}

export function buildTrackedProductUrl(sourceUrl: string, influencerUserId: string, code: string) {
  const url = new URL(sourceUrl);
  url.searchParams.set("ref", influencerUserId);
  url.searchParams.set("coupon", code);
  return url.toString();
}

export async function createShopifyDiscountCode({
  shop,
  accessToken,
  code,
  percentage,
}: {
  shop: string;
  accessToken: string;
  code: string;
  percentage: number;
}): Promise<ShopifyDiscountResult> {
  const apiBase = `https://${shop}/admin/api/${DEFAULT_SHOPIFY_API_VERSION}`;
  const priceRuleRes = await fetch(`${apiBase}/price_rules.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": accessToken,
    },
    body: JSON.stringify({
      price_rule: {
        title: code,
        target_type: "line_item",
        target_selection: "all",
        allocation_method: "across",
        value_type: "percentage",
        value: `-${percentage}`,
        customer_selection: "all",
        starts_at: new Date().toISOString(),
      },
    }),
  });

  const priceRulePayload = (await priceRuleRes.json()) as ShopifyPriceRuleResponse;
  const priceRuleId = priceRulePayload.price_rule?.id;
  if (!priceRuleRes.ok || !priceRuleId) {
    throw new Error(formatShopifyError("price rule", priceRulePayload.errors));
  }

  const discountCodeRes = await fetch(`${apiBase}/price_rules/${priceRuleId}/discount_codes.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": accessToken,
    },
    body: JSON.stringify({ discount_code: { code } }),
  });

  const discountCodePayload = (await discountCodeRes.json()) as ShopifyDiscountCodeResponse;
  const discountCode = discountCodePayload.discount_code;
  if (!discountCodeRes.ok || !discountCode?.id || !discountCode.code) {
    throw new Error(formatShopifyError("discount code", discountCodePayload.errors));
  }

  return {
    code: discountCode.code,
    priceRuleId: String(priceRuleId),
    discountCodeId: String(discountCode.id),
  };
}

function formatShopifyError(resource: string, errors: unknown) {
  const message = typeof errors === "string" ? errors : JSON.stringify(errors ?? "");
  if (message.includes("merchant approval") || message.includes("write_price_rules")) {
    return `Shopify failed to create the ${resource}: reconnect Shopify from brand settings so the merchant can approve the write_price_rules scope.`;
  }

  if (!errors) return `Shopify failed to create the ${resource}.`;
  if (typeof errors === "string") return `Shopify failed to create the ${resource}: ${errors}`;
  return `Shopify failed to create the ${resource}: ${JSON.stringify(errors)}`;
}
