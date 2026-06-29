import crypto from "crypto";
import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase/server";

type ShopifyDiscountCode = {
  code: string;
  amount: string;
  type: string;
};

type ShopifyOrder = {
  id: number;
  order_number: number;
  name?: string;
  email: string | null;
  total_price: string;
  currency: string;
  discount_codes: ShopifyDiscountCode[];
  created_at: string;
};

function verifyHmac(body: string, hmacHeader: string, secret: string): boolean {
  const digest = crypto
    .createHmac("sha256", secret)
    .update(body, "utf8")
    .digest("base64");
  return crypto.timingSafeEqual(
    Buffer.from(digest),
    Buffer.from(hmacHeader)
  );
}

export async function POST(req: Request) {
  const secret = process.env.SHOPIFY_API_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Not configured" }, { status: 500 });
  }

  const hmac = req.headers.get("x-shopify-hmac-sha256");
  if (!hmac) {
    return NextResponse.json({ error: "Missing HMAC" }, { status: 401 });
  }

  const rawBody = await req.text();

  try {
    if (!verifyHmac(rawBody, hmac, secret)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const order = JSON.parse(rawBody) as ShopifyOrder;

  if (!order.discount_codes || order.discount_codes.length === 0) {
    return NextResponse.json({ received: true });
  }

  const codes = order.discount_codes.map((dc) => dc.code.trim().toUpperCase());

  const supabase = createSupabaseAdmin();

  const { data: coupons } = await supabase
    .from("product_coupons")
    .select("id, product_id, influencer_clerk_user_id, code")
    .in("code", codes);

  if (!coupons || coupons.length === 0) {
    return NextResponse.json({ received: true });
  }

  const productIds = [...new Set(coupons.map((c) => c.product_id))];
  const { data: products } = await supabase
    .from("products")
    .select("id, clerk_user_id, org_id, commission_percentage")
    .in("id", productIds);

  const productMap = new Map(
    (products ?? []).map((p) => [p.id, p])
  );

  const orderTotal = parseFloat(order.total_price) || 0;

  const rows = coupons
    .flatMap((coupon) => {
      const product = productMap.get(coupon.product_id);
      if (!product) return [];

      const commissionPct = Number(product.commission_percentage ?? 0);
      const commissionAmount = Math.round(orderTotal * (commissionPct / 100) * 100) / 100;

      return [{
        shopify_order_id: String(order.id),
        shopify_order_number: String(order.order_number ?? order.id),
        order_number: order.name ?? `#${order.order_number ?? order.id}`,
        product_coupon_id: coupon.id,
        product_id: coupon.product_id,
        brand_clerk_user_id: product.clerk_user_id ?? product.org_id,
        org_id: product.org_id,
        influencer_clerk_user_id: coupon.influencer_clerk_user_id,
        customer_email: order.email ?? null,
        discount_code: coupon.code,
        order_total: orderTotal,
        commission_percentage: commissionPct,
        commission_amount: commissionAmount,
        currency: order.currency ?? "BDT",
        status: "pending",
        shopify_created_at: order.created_at,
      }];
    });

  if (rows.length > 0) {
    for (const row of rows) {
      const { data: updated, error: updateError } = await supabase
        .from("orders")
        .update(row)
        .eq("shopify_order_id", String(order.id))
        .select("id");

      if (updateError) {
        console.error("Failed to attribute Shopify order", updateError);
        continue;
      }

      if (!updated || updated.length === 0) {
        const { error: insertError } = await supabase.from("orders").insert(row);
        if (insertError) console.error("Failed to insert attributed Shopify order", insertError);
      }
    }
  }

  return NextResponse.json({ received: true });
}
