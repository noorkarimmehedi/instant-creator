"use client";

import { useState } from "react";
import { createPortal, useFormStatus } from "react-dom";
import { approvePayout } from "./actions";

type BankAccount = {
  bank_name?: string;
  account_number?: string;
  account_holder?: string;
  branch_name?: string;
  routing_number?: string;
} | null;

type Props = {
  influencerId: string;
  name: string;
  pending: number;
  bank: BankAccount;
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-9 items-center justify-center rounded-[8px] border border-[#111] bg-[linear-gradient(180deg,#2F2F2F,#181818)] px-4 text-sm font-medium text-white transition-opacity hover:opacity-95 disabled:opacity-60"
    >
      {pending ? "Recording…" : "Approve & mark paid"}
    </button>
  );
}

const inputClass =
  "w-full rounded-md border border-hairline-strong bg-surface-elevated px-3 py-2 text-sm text-ink placeholder:text-stone focus:outline-none focus:border-accent-blue transition-colors";

export function ApprovePayoutDialog({ influencerId, name, pending, bank }: Props) {
  const [open, setOpen] = useState(false);
  const hasBank = Boolean(bank?.account_number);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={pending <= 0}
        className="rounded-[8px] border border-accent-green/40 px-3 py-1.5 text-xs font-medium text-accent-green transition-colors hover:bg-accent-green/10 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Approve payout
      </button>

      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            onClick={() => setOpen(false)}
          >
            <div
              className="w-full max-w-md rounded-lg border border-hairline-strong bg-surface-card p-6 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-base font-medium text-ink">Approve payout to {name}</h3>
              <p className="mt-1 text-xs text-mute">
                Record a payout you have disbursed. Enter the amount you actually paid.
              </p>

              <div className="mt-4 rounded-md border border-hairline bg-surface-elevated p-3 text-sm">
                <p className="text-xs text-mute uppercase tracking-wide mb-1">Bank account</p>
                {hasBank ? (
                  <div className="text-ink">
                    <p className="font-medium">{bank?.account_holder ?? "—"}</p>
                    <p className="text-charcoal">{bank?.bank_name ?? "—"}</p>
                    <p className="text-charcoal">A/C {bank?.account_number}</p>
                    {bank?.branch_name && (
                      <p className="text-charcoal">Branch {bank.branch_name}</p>
                    )}
                    {bank?.routing_number && (
                      <p className="text-charcoal">Routing {bank.routing_number}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-accent-orange">No bank details on file for this creator.</p>
                )}
              </div>

              <form action={approvePayout} className="mt-4 space-y-3">
                <input type="hidden" name="influencerId" value={influencerId} />
                <div>
                  <label className="text-xs text-mute uppercase tracking-wide block mb-1">Paid amount (BDT)</label>
                  <input
                    name="amount"
                    type="number"
                    min={1}
                    step="0.01"
                    defaultValue={pending}
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-mute uppercase tracking-wide block mb-1">Note (optional)</label>
                  <input name="note" type="text" placeholder="Transaction reference, date, etc." className={inputClass} />
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="rounded-[8px] border border-hairline-strong px-4 py-2 text-sm text-charcoal transition-colors hover:bg-surface-elevated"
                  >
                    Cancel
                  </button>
                  <SubmitButton />
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
