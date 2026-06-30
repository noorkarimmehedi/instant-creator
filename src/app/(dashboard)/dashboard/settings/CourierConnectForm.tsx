"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { connectCourier, type CourierConnectState } from "./actions";

const inputClass =
  "w-full rounded-md border border-hairline-strong bg-surface-elevated px-3 py-2 text-sm text-ink placeholder:text-stone focus:outline-none focus:border-accent-blue transition-colors";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-10 items-center justify-center rounded-[10px] border border-[#111] bg-[linear-gradient(180deg,#2F2F2F,#181818)] px-5 text-sm font-medium text-white transition-opacity hover:opacity-95 disabled:opacity-60"
    >
      {pending ? "Connecting…" : "Connect Steadfast"}
    </button>
  );
}

export function CourierConnectForm() {
  const [state, formAction] = useActionState<CourierConnectState, FormData>(connectCourier, {
    error: null,
  });

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="provider" value="steadfast" />
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="text-xs text-mute uppercase tracking-wide block mb-1">API Key</label>
          <input name="api_key" type="text" placeholder="Steadfast API key" className={inputClass} required />
        </div>
        <div>
          <label className="text-xs text-mute uppercase tracking-wide block mb-1">Secret Key</label>
          <input
            name="secret_key"
            type="password"
            placeholder="Steadfast secret key"
            className={inputClass}
            required
          />
        </div>
      </div>
      {state.error && (
        <p className="rounded-md border border-accent-red/30 bg-accent-red/5 px-3 py-2 text-sm text-accent-red">
          {state.error}
        </p>
      )}
      <div className="flex justify-end">
        <SubmitButton />
      </div>
    </form>
  );
}
