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
    <div className="group flex h-full flex-col overflow-hidden rounded-lg border border-hairline bg-surface-card transition-colors hover:border-overlay-strong">
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
            <Button type="submit" variant={pending ? "ghost" : "outline"}>
              {pending ? "Saving…" : "Save"}
            </Button>
          </div>
        </form>

        <form
          action={deleteAction}
          onSubmit={(event) => {
            if (!confirm(`Delete ${primary.name}? This removes the product from creator browse pages.`)) {
              event.preventDefault();
            }
          }}
          className="mt-3 flex items-center justify-between gap-2"
        >
          <input type="hidden" name="product_id" value={primary.id} />
          <span className={`text-xs ${deleteState?.ok ? "text-accent-green" : "text-accent-red"}`}>
            {deleteState ? (deleteState.ok ? "Deleted" : deleteState.error) : ""}
          </span>
          <button
            type="submit"
            disabled={deletePending}
            className="rounded-md border border-accent-red/30 px-3 py-1.5 text-xs font-medium text-accent-red transition-colors hover:bg-accent-red/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {deletePending ? "Deleting…" : "Delete"}
          </button>
        </form>
      </div>
    </div>
  );
}
