"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { dispatchToCourier } from "./actions";

type Props = {
  orderId: string;
  orderNumber: string;
  providerLabel: string;
  defaultName: string;
  defaultPhone: string;
  defaultAddress: string;
  defaultCod: number;
};

function SubmitButton({ providerLabel }: { providerLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-9 items-center justify-center rounded-[8px] border border-[#111] bg-[linear-gradient(180deg,#2F2F2F,#181818)] px-4 text-sm font-medium text-white transition-opacity hover:opacity-95 disabled:opacity-60"
    >
      {pending ? "Sending…" : `Send to ${providerLabel}`}
    </button>
  );
}

const inputClass =
  "w-full rounded-md border border-hairline-strong bg-surface-elevated px-3 py-2 text-sm text-ink placeholder:text-stone focus:outline-none focus:border-accent-blue transition-colors";

export function DispatchDialog({
  orderId,
  orderNumber,
  providerLabel,
  defaultName,
  defaultPhone,
  defaultAddress,
  defaultCod,
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-[8px] border border-accent-blue/40 px-3 py-1.5 text-xs font-medium text-accent-blue transition-colors hover:bg-accent-blue/10"
      >
        Send to courier
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-lg border border-hairline-strong bg-surface p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-medium text-ink">Send order #{orderNumber} to {providerLabel}</h3>
            <p className="mt-1 text-xs text-mute">Review and edit the delivery details before sending.</p>

            <form action={dispatchToCourier} className="mt-4 space-y-3">
              <input type="hidden" name="orderId" value={orderId} />
              <div>
                <label className="text-xs text-mute uppercase tracking-wide block mb-1">Recipient name</label>
                <input name="recipientName" type="text" defaultValue={defaultName} className={inputClass} required />
              </div>
              <div>
                <label className="text-xs text-mute uppercase tracking-wide block mb-1">Phone</label>
                <input
                  name="recipientPhone"
                  type="text"
                  defaultValue={defaultPhone}
                  placeholder="01XXXXXXXXX"
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className="text-xs text-mute uppercase tracking-wide block mb-1">Address</label>
                <textarea name="recipientAddress" defaultValue={defaultAddress} rows={2} className={inputClass} required />
              </div>
              <div>
                <label className="text-xs text-mute uppercase tracking-wide block mb-1">COD amount (BDT)</label>
                <input
                  name="codAmount"
                  type="number"
                  min={0}
                  step="1"
                  defaultValue={defaultCod}
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className="text-xs text-mute uppercase tracking-wide block mb-1">Note (optional)</label>
                <input name="note" type="text" placeholder="Delivery instructions" className={inputClass} />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-[8px] border border-hairline-strong px-4 py-2 text-sm text-charcoal transition-colors hover:bg-surface-elevated"
                >
                  Cancel
                </button>
                <SubmitButton providerLabel={providerLabel} />
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
