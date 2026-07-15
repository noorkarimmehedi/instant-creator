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

  const allNames = products.map((p) => p.name).join(", ");

  async function copyLink() {
    if (!trackedUrl) return;
    await navigator.clipboard.writeText(trackedUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  function nextVariant(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setActiveIdx((i) => (i + 1) % products.length);
  }

  function prevVariant(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setActiveIdx((i) => (i - 1 + products.length) % products.length);
  }

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-lg border border-hairline bg-surface-card transition-colors hover:border-overlay-strong">
      <a
        href={product.source_url ?? "#"}
        target={product.source_url ? "_blank" : undefined}
        rel={product.source_url ? "noreferrer" : undefined}
        className="block"
      >
        <div className="group/carousel relative aspect-square w-full bg-surface-elevated">
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
            <>
              <span className="absolute right-2 top-2 z-10 rounded-full bg-ink/70 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
                {products.length} variants
              </span>

              <button
                type="button"
                onClick={prevVariant}
                className="absolute left-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-ink opacity-0 shadow-sm backdrop-blur-sm transition-all hover:bg-white group-hover/carousel:opacity-100"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>

              <button
                type="button"
                onClick={nextVariant}
                className="absolute right-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-ink opacity-0 shadow-sm backdrop-blur-sm transition-all hover:bg-white group-hover/carousel:opacity-100"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>

              <div className="absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 gap-1.5 rounded-full bg-ink/30 px-2 py-1 backdrop-blur-md">
                {products.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setActiveIdx(i);
                    }}
                    className={`h-1.5 w-1.5 rounded-full transition-all ${
                      i === activeIdx ? "w-3 bg-white" : "bg-white/50 hover:bg-white/80"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </a>

      <div className="flex flex-1 flex-col p-3">
        <div className="mb-3">
          <p className="truncate text-sm text-ink" title={allNames}>
            {product.name}
          </p>
          <p className="mt-1 text-xs text-mute">
            {formatTaka(product.price)}
          </p>
        </div>

        <div className="mt-4 flex min-h-[184px] flex-col justify-end space-y-3">
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
              <Button type="button" variant="productAction" className="w-full" onClick={copyLink}>
                {copied ? "Copied" : "Copy link"}
              </Button>
            </div>
          ) : (
            <form action={formAction} className="space-y-2">
              <input type="hidden" name="product_id" value={product.id} />
              <div className="rounded-md border border-dashed border-hairline bg-surface-elevated px-3 py-2 text-xs text-mute">
                Generate a Shopify coupon to unlock the shareable link.
              </div>
              <Button type="submit" variant="productAction" className="w-full">
                {pending ? "Creating coupon…" : "Generate coupon"}
              </Button>
              {state && !state.ok ? (
                <p className="text-xs text-accent-red">{state.error}</p>
              ) : null}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
