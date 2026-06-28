"use client";

import Image from "next/image";
import { useActionState, useState } from "react";
import { Button } from "@/components/ui/Button";
import { buildTrackedProductUrl } from "@/lib/shopify/discounts";
import { generateShopifyCoupon } from "./actions";

type Product = {
  id: string;
  name: string;
  price: number | string | null;
  source_url: string | null;
  image_url: string | null;
  commission_percentage: number | string | null;
  coupon_discount_percentage: number | string | null;
};

export function ProductPromotionCard({
  product,
  creatorUserId,
  initialCouponCode,
}: {
  product: Product;
  creatorUserId: string;
  initialCouponCode?: string;
}) {
  const [state, formAction, pending] = useActionState(generateShopifyCoupon, null);
  const [copied, setCopied] = useState(false);
  const couponCode = state?.ok ? state.coupon.code : initialCouponCode;
  const trackedUrl = product.source_url && couponCode
    ? buildTrackedProductUrl(product.source_url, creatorUserId, couponCode)
    : null;

  async function copyLink() {
    if (!trackedUrl) return;
    await navigator.clipboard.writeText(trackedUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="group overflow-hidden rounded-lg border border-hairline bg-surface-card transition-colors hover:border-overlay-strong">
      <a
        href={product.source_url ?? "#"}
        target={product.source_url ? "_blank" : undefined}
        rel={product.source_url ? "noreferrer" : undefined}
        className="block"
      >
        <div className="relative aspect-square w-full bg-surface-elevated">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-stone">
              No image
            </div>
          )}
        </div>
      </a>

      <div className="space-y-3 p-3">
        <div>
          <p className="truncate text-sm text-ink">{product.name}</p>
          <p className="mt-1 text-xs text-mute">
            {product.price ? `$${product.price}` : "Price unavailable"}
          </p>
        </div>

        <div className="rounded-md border border-hairline bg-surface-elevated p-3 text-xs text-charcoal">
          <p>
            You earn <span className="font-medium text-ink">{product.commission_percentage ?? 0}%</span> commission
          </p>
          <p className="mt-1">
            Customer coupon: <span className="font-medium text-ink">{product.coupon_discount_percentage ?? 0}% off</span>
          </p>
        </div>

        {couponCode ? (
          <div className="space-y-2">
            <div className="rounded-md border border-hairline-strong bg-canvas px-3 py-2">
              <p className="text-[10px] uppercase tracking-wide text-mute">Shopify coupon</p>
              <p className="mt-1 break-all text-sm font-medium text-ink">{couponCode}</p>
            </div>
            <Button type="button" variant="outline" className="w-full" onClick={copyLink}>
              {copied ? "Copied" : "Copy link"}
            </Button>
          </div>
        ) : (
          <form action={formAction} className="space-y-2">
            <input type="hidden" name="product_id" value={product.id} />
            <Button type="submit" variant={pending ? "ghost" : "primary"} className="w-full">
              {pending ? "Creating coupon…" : "Generate Shopify coupon"}
            </Button>
            {state && !state.ok ? (
              <p className="text-xs text-accent-red">{state.error}</p>
            ) : null}
          </form>
        )}
      </div>
    </div>
  );
}
