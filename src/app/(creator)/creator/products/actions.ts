"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { createSupabaseAdmin } from "@/lib/supabase/server";
import { buildCouponCode, createShopifyDiscountCode } from "@/lib/shopify/discounts";

type Result =
  | { ok: true; coupon: { code: string } }
  | { ok: false; error: string };

type ProductForCoupon = {
  id: string;
  name: string;
  clerk_user_id: string | null;
  org_id: string | null;
  coupon_discount_percentage: number | string | null;
};

type BrandForCoupon = {
  shopify_store: string | null;
  shopify_token: string | null;
};

type InfluencerForCoupon = {
  display_name: string | null;
};

export async function generateShopifyCoupon(
  _prev: Result | null,
  formData: FormData
): Promise<Result> {
  const { userId } = await auth();
  if (!userId) return { ok: false, error: "Unauthorized" };

  const productId = String(formData.get("product_id") ?? "").trim();
  if (!productId) return { ok: false, error: "Missing product." };

  const supabase = createSupabaseAdmin();
  const { data: existingCoupon } = await supabase
    .from("product_coupons")
    .select("code")
    .eq("product_id", productId)
    .eq("influencer_clerk_user_id", userId)
    .maybeSingle();

  if (existingCoupon?.code) {
    return { ok: true, coupon: { code: existingCoupon.code } };
  }

  const { data: product, error: productError } = await supabase
    .from("products")
    .select("id, name, clerk_user_id, org_id, coupon_discount_percentage")
    .eq("id", productId)
    .single();

  if (productError || !product) return { ok: false, error: "Product could not be found." };

  const typedProduct = product as ProductForCoupon;
  const ownerId = typedProduct.clerk_user_id ?? typedProduct.org_id;
  if (!ownerId) {
    return { ok: false, error: "This product is not connected to a brand." };
  }

  const typedBrand = typedProduct.clerk_user_id
    ? ((await supabase
        .from("brands")
        .select("shopify_store, shopify_token")
        .eq("clerk_user_id", typedProduct.clerk_user_id)
        .single()).data as BrandForCoupon | null)
    : await getLegacyShopifyCredentials(ownerId);

  if (!typedBrand?.shopify_store || !typedBrand.shopify_token) {
    return { ok: false, error: "The brand needs to reconnect Shopify before coupons can be generated." };
  }

  const percentage = Number(typedProduct.coupon_discount_percentage ?? 0);
  if (!Number.isFinite(percentage) || percentage <= 0 || percentage > 100) {
    return { ok: false, error: "This product does not have a valid coupon discount." };
  }

  const { data: influencer } = await supabase
    .from("influencers")
    .select("display_name")
    .eq("clerk_user_id", userId)
    .single();
  const typedInfluencer = influencer as InfluencerForCoupon | null;
  const code = buildCouponCode(typedInfluencer?.display_name ?? null, typedProduct.id, userId);
  let discount;
  try {
    discount = await createShopifyDiscountCode({
      shop: typedBrand.shopify_store,
      accessToken: typedBrand.shopify_token,
      code,
      percentage,
    });
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Shopify failed to create the coupon.",
    };
  }

  const { error: insertError } = await supabase.from("product_coupons").insert({
    product_id: productId,
    influencer_clerk_user_id: userId,
    code: discount.code,
    shopify_price_rule_id: discount.priceRuleId,
    shopify_discount_code_id: discount.discountCodeId,
  });

  if (insertError) return { ok: false, error: `Failed to save coupon: ${insertError.message}` };

  revalidatePath("/creator/products");
  return { ok: true, coupon: { code: discount.code } };
}

async function getLegacyShopifyCredentials(orgId: string): Promise<BrandForCoupon | null> {
  const supabase = createSupabaseAdmin();
  const { data } = await supabase
    .from("app_settings")
    .select("key, value")
    .in("key", [`${orgId}:shopify_store_url`, `${orgId}:shopify_admin_api_token`]);

  const settings = new Map((data ?? []).map((row) => [row.key, row.value]));
  return {
    shopify_store: settings.get(`${orgId}:shopify_store_url`) ?? null,
    shopify_token: settings.get(`${orgId}:shopify_admin_api_token`) ?? null,
  };
}
