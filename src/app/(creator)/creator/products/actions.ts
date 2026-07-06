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
  product_group_id: string;
  clerk_user_id: string | null;
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

  const { data: product, error: productError } = await supabase
    .from("products")
    .select("id, name, product_group_id, clerk_user_id, coupon_discount_percentage")
    .eq("id", productId)
    .eq("archived", false)
    .single();

  if (productError || !product) {
    console.error("generateShopifyCoupon: product query failed", { productId, productError: JSON.stringify(productError) });
    return { ok: false, error: `Product could not be found.` };
  }

  const typedProduct = product as ProductForCoupon;

  const { data: existingCoupon } = await supabase
    .from("product_coupons")
    .select("code")
    .eq("product_group_id", typedProduct.product_group_id)
    .eq("influencer_clerk_user_id", userId)
    .maybeSingle();

  if (existingCoupon?.code) {
    return { ok: true, coupon: { code: existingCoupon.code } };
  }
  if (!typedProduct.clerk_user_id) {
    return { ok: false, error: "This product is not connected to a brand." };
  }

  const typedBrand = ((await supabase
    .from("brands")
    .select("shopify_store, shopify_token")
    .eq("clerk_user_id", typedProduct.clerk_user_id)
    .single()).data as BrandForCoupon | null);

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
  const code = buildCouponCode(typedInfluencer?.display_name ?? null, typedProduct.product_group_id, userId);
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
    product_group_id: typedProduct.product_group_id,
    influencer_clerk_user_id: userId,
    code: discount.code,
    shopify_price_rule_id: discount.priceRuleId,
    shopify_discount_code_id: discount.discountCodeId,
  });

  if (insertError) return { ok: false, error: `Failed to save coupon: ${insertError.message}` };

  revalidatePath("/creator/products");
  return { ok: true, coupon: { code: discount.code } };
}

