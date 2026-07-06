"use client";

import Image from "next/image";
import { useActionState, useState } from "react";
import { Button } from "@/components/ui/Button";
import { formatTaka } from "@/lib/products/formatting";
import { deleteProduct, updateProductTerms } from "./actions";

type Product = {
  id: string;
  name: string;
  price: number | string | null;
  source_url: string | null;
  image_url: string | null;
  images: string[] | null;
  commission_percentage: number | string | null;
  coupon_discount_percentage: number | string | null;
  target_gender: string | null;
  product_group_id: string;
  variant_label: string | null;
};

export function ProductGroupCard({ products }: { products: Product[] }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const primary = products[activeIdx] || products[0];
  const [state, formAction, pending] = useActionState(updateProductTerms, null);
  const [deleteState, deleteAction, deletePending] = useActionState(deleteProduct, null);

  const allNames = products.map((p) => p.name).join(", ");

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
    <div className="group relative flex h-full flex-col overflow-hidden rounded-lg border border-hairline bg-surface-card transition-colors hover:border-overlay-strong">
      <form
        action={deleteAction}
        onSubmit={(event) => {
          if (!confirm(`Delete ${primary.name}? This removes the product from creator browse pages.`)) {
            event.preventDefault();
          }
        }}
        className="absolute top-2 left-2 z-20"
      >
        <input type="hidden" name="product_id" value={primary.id} />
        <Button
          type="submit"
          disabled={deletePending}
          variant="productAction"
          className="text-accent-red h-8 w-8 !px-0 flex items-center justify-center"
          title="Delete product group"
        >
          {deletePending ? (
            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
          )}
        </Button>
        {deleteState && !deleteState.ok && (
          <div className="absolute top-10 left-0 w-32 rounded-md bg-white/90 p-2 text-xs text-accent-red shadow-sm backdrop-blur-sm">
            {deleteState.error}
          </div>
        )}
      </form>
      <a
        href={primary.source_url ?? "#"}
        target={primary.source_url ? "_blank" : undefined}
        rel={primary.source_url ? "noreferrer" : undefined}
        className="block"
      >
        <div className="group/carousel relative aspect-square w-full bg-surface-elevated">
          {primary.image_url ? (
            <Image
              src={primary.image_url}
              alt={primary.name}
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
            {primary.name}
          </p>
          <p className="mt-1 text-xs text-mute">{formatTaka(primary.price)}</p>
        </div>

        <form action={formAction} className="mt-auto space-y-3 rounded-md border border-hairline bg-surface-elevated p-3">
          <input type="hidden" name="product_id" value={primary.id} />
          <div className="grid gap-2 sm:grid-cols-2">
            <label className="text-xs text-charcoal">
              Commission
              <div className="mt-1 flex items-center gap-1.5">
                <input
                  name="commission_percentage"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  defaultValue={String(primary.commission_percentage ?? 0)}
                  className="w-full rounded-md border border-hairline-strong bg-canvas px-2 py-1.5 text-xs text-ink focus:border-accent-blue focus:outline-none"
                />
                <span className="text-xs text-mute">%</span>
              </div>
            </label>
            <label className="text-xs text-charcoal">
              Coupon
              <div className="mt-1 flex items-center gap-1.5">
                <input
                  name="coupon_discount_percentage"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  defaultValue={String(primary.coupon_discount_percentage ?? 0)}
                  className="w-full rounded-md border border-hairline-strong bg-canvas px-2 py-1.5 text-xs text-ink focus:border-accent-blue focus:outline-none"
                />
                <span className="text-xs text-mute">%</span>
              </div>
            </label>
          </div>
          <label className="block text-xs text-charcoal">
            Target gender
            <select
              name="target_gender"
              defaultValue={primary.target_gender ?? "all"}
              className="mt-1 w-full rounded-md border border-hairline-strong bg-canvas px-2 py-1.5 text-xs text-ink focus:border-accent-blue focus:outline-none"
            >
              <option value="all">All genders</option>
              <option value="women">Women</option>
              <option value="men">Men</option>
              <option value="kids">Kids</option>
            </select>
          </label>
          <div className="flex items-center justify-between gap-2">
            <span className={`text-xs ${state?.ok ? "text-accent-green" : "text-accent-red"}`}>
              {state ? (state.ok ? "Saved" : state.error) : ""}
            </span>
            <Button type="submit" variant="productAction">
              {pending ? "Saving…" : "Save"}
            </Button>
          </div>
        </form>

      </div>
    </div>
  );
}
