"use client";

import { SwissCard } from "@/components/ui/SwissCard";
import { Button } from "@/components/ui/Button";
import { savePayout } from "../actions";

export function PayoutForm({
  bank,
}: {
  bank: { bank_name?: string; account_number?: string; account_holder?: string } | null;
}) {
  return (
    <SwissCard>
      <form action={savePayout} className="space-y-5">
        <div>
          <label className="text-xs text-mute uppercase tracking-wide block mb-1">
            Bank Name
          </label>
          <input
            name="bank_name"
            type="text"
            defaultValue={bank?.bank_name ?? ""}
            placeholder="e.g. Dutch Bangla Bank"
            className="w-full rounded-md border border-hairline-strong bg-surface-elevated px-3 py-2 text-sm text-ink placeholder:text-stone focus:outline-none focus:border-accent-orange transition-colors"
            required
          />
        </div>
        <div>
          <label className="text-xs text-mute uppercase tracking-wide block mb-1">
            Account Number
          </label>
          <input
            name="account_number"
            type="text"
            defaultValue={bank?.account_number ?? ""}
            placeholder="Your account number"
            className="w-full rounded-md border border-hairline-strong bg-surface-elevated px-3 py-2 text-sm text-ink placeholder:text-stone focus:outline-none focus:border-accent-orange transition-colors"
            required
          />
        </div>
        <div>
          <label className="text-xs text-mute uppercase tracking-wide block mb-1">
            Account Holder Name
          </label>
          <input
            name="account_holder"
            type="text"
            defaultValue={bank?.account_holder ?? ""}
            placeholder="Name on the account"
            className="w-full rounded-md border border-hairline-strong bg-surface-elevated px-3 py-2 text-sm text-ink placeholder:text-stone focus:outline-none focus:border-accent-orange transition-colors"
            required
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button href="/creator" variant="ghost">
            Skip for now
          </Button>
          <Button type="submit">Save & Finish</Button>
        </div>
      </form>
    </SwissCard>
  );
}
