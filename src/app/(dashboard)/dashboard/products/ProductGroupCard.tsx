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

  const allNames = products.map((p) => p.name).join("\\n");

  return (
    <div className="group overflow-hidden rounded-lg border border-hairline bg-surface-card transition-colors hover:border-overlay-strong">
      <a
        href={primary.source_url ?? "#"}
        target={primary.source_url ? "_blank" : undefined}
        rel={primary.source_url ? "noreferrer" : undefined}
        className="block"
      >
        <div className="relative aspect-square w-full bg-surface-elevated">
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
            <span className="absolute top-2 right-2 rounded-full bg-ink/70 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
              {products.length} variants
            </span>
          )}
        </div>
      </a>

      <div className="space-y-3 p-3">
        {products.length > 1 && (
          <div className="flex gap-1.5 overflow-x-auto py-1">
            {products.map((variant, idx) => (
              <button
                key={variant.id}
                type="button"
                onClick={(e) => {
                  e.preventDefault(); // In case it's in a link (it's not here, but safe)
                  e.stopPropagation(); // Prevent card clicks if any
                  setActiveIdx(idx);
                }}
                title={variant.variant_label ?? variant.name}
                className={`relative h-8 w-8 shrink-0 overflow-hidden rounded-md border transition-all ${
                  idx === activeIdx ? "border-ink ring-1 ring-ink" : "border-hairline hover:border-overlay-strong"
                }`}
              >
                {variant.image_url ? (
                  <Image
                    src={variant.image_url}
                    alt={variant.variant_label ?? variant.name}
                    fill
                    sizes="32px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-surface-elevated text-[8px] text-stone">
                    —
                  </div>
                )}
              </button>
            ))}
          </div>
        )}

        <div>
          <p className="truncate text-sm text-ink" title={allNames}>
            {primary.name}
          </p>
          <p className="mt-1 text-xs text-mute">{formatTaka(primary.price)}</p>
        </div>

        <form action={formAction} className="space-y-3 rounded-md border border-hairline bg-surface-elevated p-3">
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
                  defaultValue={String(primary.coupon_discount_percentage ?? 0)}
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
              defaultValue={primary.target_gender ?? "all"}
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
          className="flex items-center justify-between gap-2"
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
