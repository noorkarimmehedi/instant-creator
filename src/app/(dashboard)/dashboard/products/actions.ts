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
      | Array<{ price?: { amount?: number }; images?: { url?: string }[] }>
      | undefined) ?? [];
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

  const supabase = createSupabaseAdmin();
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
  });

  if (error) return { ok: false, error: `Failed to save the product: ${error.message}` };

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
  const { error } = await supabase
    .from("products")
    .update({
      commission_percentage: commissionPercentage,
      coupon_discount_percentage: couponDiscountPercentage,
      target_gender: targetGender,
    })
    .eq("id", productId)
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

  // Archive rather than hard-delete: orders reference the product's coupons via
  // a restricting foreign key, and that history feeds earnings and payouts.
  const supabase = createSupabaseAdmin();
  const { data: product, error: archiveError } = await supabase
    .from("products")
    .update({ archived: true })
    .eq("id", productId)
    .eq("clerk_user_id", userId)
    .select("id")
    .maybeSingle();

  if (archiveError) return { ok: false, error: `Failed to remove product: ${archiveError.message}` };
  if (!product) return { ok: false, error: "Product could not be found." };

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
