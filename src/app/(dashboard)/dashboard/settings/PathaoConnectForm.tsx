"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { connectPathao, type CourierConnectState } from "./actions";

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
      {pending ? "Connecting…" : "Connect Pathao"}
    </button>
  );
}

export function PathaoConnectForm() {
  const [state, formAction] = useActionState<CourierConnectState, FormData>(connectPathao, {
    error: null,
  });

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="text-xs text-mute uppercase tracking-wide block mb-1">Environment</label>
        <select name="environment" defaultValue="live" className={inputClass}>
          <option value="live">Live</option>
          <option value="sandbox">Sandbox (testing)</option>
        </select>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="text-xs text-mute uppercase tracking-wide block mb-1">Client ID</label>
          <input name="client_id" type="text" placeholder="Pathao client ID" className={inputClass} required />
        </div>
        <div>
          <label className="text-xs text-mute uppercase tracking-wide block mb-1">Client Secret</label>
          <input
            name="client_secret"
            type="password"
            placeholder="Pathao client secret"
            className={inputClass}
            required
          />
        </div>
        <div>
          <label className="text-xs text-mute uppercase tracking-wide block mb-1">Username (email)</label>
          <input name="username" type="text" placeholder="merchant@email.com" className={inputClass} required />
        </div>
        <div>
          <label className="text-xs text-mute uppercase tracking-wide block mb-1">Password</label>
          <input name="password" type="password" placeholder="Pathao password" className={inputClass} required />
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
