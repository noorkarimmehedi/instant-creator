"use client";

import { SwissCard } from "@/components/ui/SwissCard";
import { SettingsBookmarkButton } from "@/components/ui/SettingsBookmarkButton";
import { updatePayout } from "./actions";

export function PayoutSection({
  bank,
}: {
  bank: {
    bank_name?: string;
    account_number?: string;
    account_holder?: string;
    branch_name?: string;
    routing_number?: string;
    branch_routing_number?: string;
  } | null;
}) {
  return (
    <SwissCard>
      <h2 className="text-lg font-medium text-ink mb-4">Payout Method</h2>
      <p className="text-sm text-mute mb-4">Brands pay your commissions to this bank account.</p>
      <form action={updatePayout} className="space-y-4">
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
        <div>
          <label className="text-xs text-mute uppercase tracking-wide block mb-1">
            Branch Name
          </label>
          <input
            name="branch_name"
            type="text"
            defaultValue={bank?.branch_name ?? bank?.branch_routing_number ?? ""}
            placeholder="Branch name"
            className="w-full rounded-md border border-hairline-strong bg-surface-elevated px-3 py-2 text-sm text-ink placeholder:text-stone focus:outline-none focus:border-accent-orange transition-colors"
            required
          />
        </div>
        <div>
          <label className="text-xs text-mute uppercase tracking-wide block mb-1">
            Routing Number
          </label>
          <input
            name="routing_number"
            type="text"
            defaultValue={bank?.routing_number ?? ""}
            placeholder="Routing number"
            className="w-full rounded-md border border-hairline-strong bg-surface-elevated px-3 py-2 text-sm text-ink placeholder:text-stone focus:outline-none focus:border-accent-orange transition-colors"
            required
          />
        </div>

        <div className="flex justify-end">
          <SettingsBookmarkButton type="submit" ariaLabel="Save payout method" icon="wallet">Save</SettingsBookmarkButton>
        </div>
      </form>
    </SwissCard>
  );
}
