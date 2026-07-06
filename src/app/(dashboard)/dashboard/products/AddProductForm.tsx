"use client";

import { useActionState } from "react";
import { addProductFromUrl } from "./actions";

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
        <button
          type="submit"
          disabled={pending}
          aria-busy={pending}
          className="relative inline-flex shrink-0 items-center justify-center cursor-pointer rounded-[12px] px-6 py-2.5 text-sm font-medium text-zinc-900 bg-[#E3E3E3]/80 shadow-[0_2px_4px_0_rgba(0,0,0,0.10),0_0_0_1px_rgba(0,0,0,0.16),inset_0_1px_0_0_#FDFDFD] disabled:cursor-wait disabled:opacity-50 transition-all hover:bg-[#E3E3E3] active:scale-[0.98] outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1a1614]"
        >
          {pending ? "Extracting…" : "Add product"}
        </button>
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
      <div>
        <label className="text-xs text-mute uppercase tracking-wide">
          Target gender
        </label>
        <select
          name="target_gender"
          defaultValue="all"
          className="mt-1 w-full rounded-md border border-hairline-strong bg-surface-elevated px-4 py-2.5 text-sm text-ink focus:outline-none focus:border-accent-blue transition-colors"
        >
          <option value="all">All genders</option>
          <option value="women">Women</option>
          <option value="men">Men</option>
          <option value="kids">Kids</option>
        </select>
      </div>
      <p className="text-xs text-charcoal">
        AI extracts the title, price, and images. If the product has color or size variants, they are grouped automatically. The commission is what creators earn; the coupon discount is what customers get in Shopify.
      </p>
      {state && !state.ok ? (
        <p className="text-xs text-accent-red">{state.error}</p>
      ) : null}
    </form>
  );
}
