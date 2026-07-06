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

        <form
          action={deleteAction}
          onSubmit={(event) => {
            if (!confirm(`Delete ${product.name}? This removes the product from creator browse pages.`)) {
              event.preventDefault();
            }
          }}
          className="flex items-center justify-between gap-2"
        >
          <input type="hidden" name="product_id" value={product.id} />
          <span className={`text-xs ${deleteState?.ok ? "text-accent-green" : "text-accent-red"}`}>
            {deleteState ? (deleteState.ok ? "Deleted" : deleteState.error) : ""}
          </span>
          <Button
            type="submit"
            disabled={deletePending}
            variant="productAction"
            className="text-accent-red"
          >
            {deletePending ? "Deleting…" : "Delete"}
          </Button>
        </form>
      </div>
    </div>
  );
}
