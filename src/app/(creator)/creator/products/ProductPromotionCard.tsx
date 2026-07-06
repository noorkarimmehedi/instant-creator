"use client";

import Image from "next/image";
import { useActionState, useState } from "react";
import { Button } from "@/components/ui/Button";
import { formatTaka } from "@/lib/products/formatting";
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
  product_group_id: string;
  variant_label: string | null;
};

export function ProductPromotionCard({
  products,
  creatorUserId,
  initialCouponCode,
}: {
  products: Product[];
  creatorUserId: string;
  initialCouponCode?: string;
}) {
  const [activeIdx, setActiveIdx] = useState(0);
  const product = products[activeIdx] || products[0];
  const [state, formAction, pending] = useActionState(generateShopifyCoupon, null);
  const [copied, setCopied] = useState(false);
  const couponCode = state?.ok ? state.coupon.code : initialCouponCode;
  const trackedUrl = product.source_url && couponCode
    ? buildTrackedProductUrl(product.source_url, creatorUserId, couponCode)
    : null;

  const allNames = products.map((p) => p.name).join("\\n");

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
          {products.length > 1 && (
            <span className="absolute top-2 right-2 rounded-full bg-ink/70 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
              {products.length} variants
            </span>
          )}
        </div>
      </a>

      {products.length > 1 && (
        <div className="flex gap-1.5 overflow-x-auto px-3 py-1.5">
          {products.map((v, idx) => (
            <button
              key={v.id}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setActiveIdx(idx);
              }}
              title={v.variant_label ?? v.name}
              className={`relative h-8 w-8 shrink-0 overflow-hidden rounded-md border transition-all ${
                idx === activeIdx ? "border-ink ring-1 ring-ink" : "border-hairline hover:border-overlay-strong"
              }`}
            >
              {v.image_url ? (
                <Image src={v.image_url} alt={v.variant_label ?? v.name} fill sizes="32px" className="object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center bg-surface-elevated text-[8px] text-stone">
                  —
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      <div className="space-y-3 p-3">
        <div>
          <p className="truncate text-sm text-ink" title={allNames}>
            {product.name}
          </p>
          <p className="mt-1 text-xs text-mute">
            {formatTaka(product.price)}
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
              {pending ? "Creating coupon…" : "Generate coupon"}
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
