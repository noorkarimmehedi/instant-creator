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
          className="group relative inline-block shrink-0 cursor-pointer border-0 bg-transparent p-0 font-sans text-sm font-semibold tracking-[-0.005em] text-white outline-offset-4 [-webkit-tap-highlight-color:transparent] disabled:cursor-wait focus-visible:rounded-[12px] focus-visible:outline-2 focus-visible:outline-offset-[6px] focus-visible:outline-[#1a1614]"
        >
          <span className="absolute inset-0 translate-y-px rounded-[12px] bg-black/25 transition-transform duration-[600ms] ease-[cubic-bezier(0.3,0.7,0.4,1)] will-change-transform group-hover:translate-y-0.5 group-hover:duration-[250ms] group-hover:ease-[cubic-bezier(0.3,0.7,0.4,1.5)] group-active:translate-y-0 group-active:duration-[34ms]" />
          <span className="absolute inset-0 rounded-[12px] bg-[linear-gradient(to_left,#520019_0%,#a30037_8%,#a30037_92%,#520019_100%)]" />
          <span className="relative block translate-y-[-2px] rounded-[12px] bg-[#f00045] px-6 py-2.5 text-white transition-transform duration-[600ms] ease-[cubic-bezier(0.3,0.7,0.4,1)] will-change-transform group-hover:translate-y-[-3px] group-hover:duration-[250ms] group-hover:ease-[cubic-bezier(0.3,0.7,0.4,1.5)] group-active:translate-y-[-1px] group-active:duration-[34ms]">
            {pending ? "Extracting…" : "Add product"}
          </span>
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
        Firecrawl extracts the title, price, and images. The commission is what creators earn; the coupon discount is what customers get in Shopify.
      </p>
      {state && !state.ok ? (
        <p className="text-xs text-accent-red">{state.error}</p>
      ) : null}
    </form>
  );
}
