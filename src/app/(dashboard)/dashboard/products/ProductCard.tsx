"use client";

import Image from "next/image";
import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { formatTaka } from "@/lib/products/formatting";
import { deleteProduct, updateProductTerms } from "./actions";

type Product = {
  id: string;
  name: string;
  price: number | string | null;
  source_url: string | null;
  image_url: string | null;
  commission_percentage: number | string | null;
  coupon_discount_percentage: number | string | null;
  target_gender: string | null;
};

export function ProductCard({ product }: { product: Product }) {
  const [state, formAction, pending] = useActionState(updateProductTerms, null);
  const [deleteState, deleteAction, deletePending] = useActionState(deleteProduct, null);

  return (
    <div className="group relative overflow-hidden rounded-lg border border-hairline bg-surface-card transition-colors hover:border-overlay-strong">
      <form
        action={deleteAction}
        onSubmit={(event) => {
          if (!confirm(`Delete ${product.name}? This removes the product from creator browse pages.`)) {
            event.preventDefault();
          }
        }}
        className="absolute top-2 left-2 z-10"
      >
        <input type="hidden" name="product_id" value={product.id} />
        <Button
          type="submit"
          disabled={deletePending}
          variant="productAction"
          className="text-accent-red h-8 w-8 !px-0 flex items-center justify-center"
          title="Delete product"
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
          <p className="mt-1 text-xs text-mute">{formatTaka(product.price)}</p>
        </div>

        <form action={formAction} className="space-y-3 rounded-md border border-hairline bg-surface-elevated p-3">
          <input type="hidden" name="product_id" value={product.id} />
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
                  defaultValue={String(product.commission_percentage ?? 0)}
                  className="w-full rounded-md border border-hairline-strong bg-canvas px-2 py-1.5 text-xs text-ink focus:outline-none focus:border-accent-blue"
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
                  defaultValue={String(product.coupon_discount_percentage ?? 0)}
                  className="w-full rounded-md border border-hairline-strong bg-canvas px-2 py-1.5 text-xs text-ink focus:outline-none focus:border-accent-blue"
                />
                <span className="text-xs text-mute">%</span>
              </div>
            </label>
          </div>
          <label className="block text-xs text-charcoal">
            Target gender
            <select
              name="target_gender"
              defaultValue={product.target_gender ?? "all"}
              className="mt-1 w-full rounded-md border border-hairline-strong bg-canvas px-2 py-1.5 text-xs text-ink focus:outline-none focus:border-accent-blue"
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
