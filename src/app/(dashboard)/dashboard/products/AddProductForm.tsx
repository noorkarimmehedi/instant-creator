"use client";

import { useActionState } from "react";
import { addProductFromUrl } from "./actions";
import { Button } from "@/components/ui/Button";

export function AddProductForm() {
  const [state, formAction, pending] = useActionState(addProductFromUrl, null);

  return (
    <form action={formAction} className="space-y-3">
      <label className="text-xs text-mute uppercase tracking-wide">
        Paste product URL
      </label>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          name="url"
          type="url"
          required
          placeholder="https://example.com/products/abc"
          className="flex-1 rounded-md border border-hairline-strong bg-surface-elevated px-4 py-2.5 text-sm text-ink placeholder:text-stone focus:outline-none focus:border-accent-blue transition-colors"
        />
        <Button type="submit" variant={pending ? "ghost" : "primary"}>
          {pending ? "Extracting…" : "Add product"}
        </Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="text-xs text-mute uppercase tracking-wide">
            Influencer commission
          </label>
          <div className="mt-1 flex items-center gap-2">
            <input
              name="commission_percentage"
              type="number"
              min="0"
              max="100"
              step="0.01"
              defaultValue="10"
              className="w-full rounded-md border border-hairline-strong bg-surface-elevated px-4 py-2.5 text-sm text-ink placeholder:text-stone focus:outline-none focus:border-accent-blue transition-colors"
            />
            <span className="text-sm text-mute">%</span>
          </div>
        </div>
        <div>
          <label className="text-xs text-mute uppercase tracking-wide">
            Customer coupon discount
          </label>
          <div className="mt-1 flex items-center gap-2">
            <input
              name="coupon_discount_percentage"
              type="number"
              min="0"
              max="100"
              step="0.01"
              defaultValue="10"
              className="w-full rounded-md border border-hairline-strong bg-surface-elevated px-4 py-2.5 text-sm text-ink placeholder:text-stone focus:outline-none focus:border-accent-blue transition-colors"
            />
            <span className="text-sm text-mute">%</span>
          </div>
        </div>
      </div>
      <p className="text-xs text-charcoal">
        Firecrawl extracts the title, price, and images. The commission is what creators earn; the coupon discount is what customers get in Shopify.
      </p>
      {state && !state.ok ? (
        <p className="text-xs text-accent-red">{state.error}</p>
      ) : null}
    </form>
  );
}
