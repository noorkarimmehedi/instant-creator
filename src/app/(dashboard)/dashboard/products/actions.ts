"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { createSupabaseAdmin } from "@/lib/supabase/server";
import { readPercentageValue } from "@/lib/products/formatting";

type Result = { ok: true } | { ok: false; error: string };

export async function addProductFromUrl(
  _prev: Result | null,
  formData: FormData
): Promise<Result> {
  const { userId } = await auth();
  if (!userId) return { ok: false, error: "Unauthorized" };

  const url = String(formData.get("url") ?? "").trim();
  if (!url) return { ok: false, error: "Please paste a product URL." };

  const commissionPercentage = readPercentage(formData, "commission_percentage");
  const couponDiscountPercentage = readPercentage(formData, "coupon_discount_percentage");
  const targetGender = readTargetGender(formData);
  if (commissionPercentage === null || couponDiscountPercentage === null) {
    return { ok: false, error: "Commission and coupon discount must be between 0 and 100%." };
  }

  const apiKey = process.env.FIRECRAWL_API_KEY;
  if (!apiKey) return { ok: false, error: "FIRECRAWL_API_KEY is not configured." };

  let payload: { data?: { product?: Record<string, unknown> } };
  try {
    const res = await fetch("https://api.firecrawl.dev/v2/scrape", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        url,
        formats: ["product"],
      }),
    });
    if (!res.ok) {
      return { ok: false, error: `Firecrawl error (${res.status}).` };
    }
    payload = await res.json();
  } catch {
    return { ok: false, error: "Failed to reach Firecrawl." };
  }

  const product = payload?.data?.product;
  if (!product) {
    return { ok: false, error: "No product found on that page." };
  }

  const title = (product.title as string) || "Untitled product";
  const variants =
    (product.variants as
      | Array<{
          price?: { amount?: number };
          images?: { url?: string }[];
          name?: string;
          color?: string;
          size?: string;
        }>
      | undefined) ?? [];

  const productGroupId = crypto.randomUUID();
  const supabase = createSupabaseAdmin();

  if (variants.length > 1) {
    const rows = variants.map((v, idx) => {
      const variantImages: string[] = (v?.images ?? [])
        .map((i) => i?.url)
        .filter((u): u is string => Boolean(u));
      const priceAmount = v?.price?.amount;
      const priceNum = typeof priceAmount === "number" ? priceAmount : 0;
      const variantLabel =
        v.name || v.color || v.size || `Variant ${idx + 1}`;

      return {
        clerk_user_id: userId,
        name: title,
        price: priceNum,
        selling_price: priceNum,
        url,
        source_url: url,
        image_url: variantImages[0] ?? null,
        images: variantImages,
        commission_percentage: commissionPercentage,
        coupon_discount_percentage: couponDiscountPercentage,
        target_gender: targetGender,
        product_group_id: productGroupId,
        variant_label: variantLabel,
      };
    });

    const { error } = await supabase.from("products").insert(rows);
    if (error) return { ok: false, error: `Failed to save the product: ${error.message}` };
  } else {
    const priceAmount = variants[0]?.price?.amount;
    const priceNum = typeof priceAmount === "number" ? priceAmount : 0;
    const images: string[] = Array.from(
      new Set(
        variants
          .flatMap((v) => (v?.images ?? []))
          .map((i) => i?.url)
          .filter((u): u is string => Boolean(u))
      )
    );

    const { error } = await supabase.from("products").insert({
      clerk_user_id: userId,
      name: title,
      price: priceNum,
      selling_price: priceNum,
      url,
      source_url: url,
      image_url: images[0] ?? null,
      images,
      commission_percentage: commissionPercentage,
      coupon_discount_percentage: couponDiscountPercentage,
      target_gender: targetGender,
      product_group_id: productGroupId,
    });

    if (error) return { ok: false, error: `Failed to save the product: ${error.message}` };
  }

  revalidatePath("/dashboard/products");
  return { ok: true };
}

export async function updateProductTerms(
  _prev: Result | null,
  formData: FormData
): Promise<Result> {
  const { userId } = await auth();
  if (!userId) return { ok: false, error: "Unauthorized" };

  const productId = String(formData.get("product_id") ?? "").trim();
  if (!productId) return { ok: false, error: "Missing product." };

  const commissionPercentage = readPercentage(formData, "commission_percentage");
  const couponDiscountPercentage = readPercentage(formData, "coupon_discount_percentage");
  const targetGender = readTargetGender(formData);
  if (commissionPercentage === null || couponDiscountPercentage === null) {
    return { ok: false, error: "Commission and coupon discount must be between 0 and 100%." };
  }

  const supabase = createSupabaseAdmin();

  // Lookup the product's group so we can update all variants together.
  const { data: origin, error: lookupError } = await supabase
    .from("products")
    .select("product_group_id")
    .eq("id", productId)
    .eq("clerk_user_id", userId)
    .maybeSingle();

  if (lookupError) return { ok: false, error: `Failed to update the product: ${lookupError.message}` };
  if (!origin) return { ok: false, error: "Product could not be found." };

  const { error } = await supabase
    .from("products")
    .update({
      commission_percentage: commissionPercentage,
      coupon_discount_percentage: couponDiscountPercentage,
      target_gender: targetGender,
    })
    .eq("product_group_id", origin.product_group_id)
    .eq("clerk_user_id", userId);

  if (error) return { ok: false, error: `Failed to update the product: ${error.message}` };

  revalidatePath("/dashboard/products");
  revalidatePath("/creator/products");
  return { ok: true };
}

export async function deleteProduct(
  _prev: Result | null,
  formData: FormData
): Promise<Result> {
  const { userId } = await auth();
  if (!userId) return { ok: false, error: "Unauthorized" };

  const productId = String(formData.get("product_id") ?? "").trim();
  if (!productId) return { ok: false, error: "Missing product." };

  const supabase = createSupabaseAdmin();

  // Lookup the product's group so we can archive all variants together.
  const { data: origin, error: lookupError } = await supabase
    .from("products")
    .select("product_group_id")
    .eq("id", productId)
    .eq("clerk_user_id", userId)
    .maybeSingle();

  if (lookupError) return { ok: false, error: `Failed to remove product: ${lookupError.message}` };
  if (!origin) return { ok: false, error: "Product could not be found." };

  // Archive rather than hard-delete: orders reference the product's coupons via
  // a restricting foreign key, and that history feeds earnings and payouts.
  const { data: archived, error: archiveError } = await supabase
    .from("products")
    .update({ archived: true })
    .eq("product_group_id", origin.product_group_id)
    .eq("clerk_user_id", userId)
    .select("id");

  if (archiveError) return { ok: false, error: `Failed to remove product: ${archiveError.message}` };
  if (!archived || archived.length === 0) return { ok: false, error: "Product could not be found." };

  revalidatePath("/dashboard/products");
  revalidatePath("/creator/products");
  return { ok: true };
}

function readPercentage(formData: FormData, key: string) {
  return readPercentageValue(formData.get(key));
}

function readTargetGender(formData: FormData) {
  const value = String(formData.get("target_gender") ?? "all");
  return ["all", "women", "men", "kids"].includes(value) ? value : "all";
}
