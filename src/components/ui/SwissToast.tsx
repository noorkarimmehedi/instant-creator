"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { getSettingsToastMessage } from "@/lib/settings/toast";

type ToastEvent = CustomEvent<{ message: string }>;

export function dispatchSwissToast(message: string) {
  window.dispatchEvent(new CustomEvent("swiss-toast", { detail: { message } }));
}

export function SwissToastViewport() {
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    function handleToast(event: Event) {
      setMessage((event as ToastEvent).detail.message);
    }

    window.addEventListener("swiss-toast", handleToast);
    return () => window.removeEventListener("swiss-toast", handleToast);
  }, []);

  useEffect(() => {
    const toastMessage = getSettingsToastMessage(searchParams.get("toast"));
    if (!toastMessage) return;

    dispatchSwissToast(toastMessage);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("toast");
    startTransition(() => {
      router.replace(params.size ? `${pathname}?${params.toString()}` : pathname, { scroll: false });
    });
  }, [pathname, router, searchParams]);

  useEffect(() => {
    if (!message) return;
    const timeout = window.setTimeout(() => setMessage(null), 3200);
    return () => window.clearTimeout(timeout);
  }, [message]);

  if (!message) return null;

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-50 sm:right-8 sm:top-8" aria-live="polite" aria-atomic="true">
      <div className="relative min-w-[260px] overflow-hidden rounded-[18px] border border-black/10 bg-[#fbfaf7] px-5 py-4 text-[#101010] shadow-[0_22px_70px_rgba(0,0,0,0.16)]">
        <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(#111_1px,transparent_1px),linear-gradient(90deg,#111_1px,transparent_1px)] [background-size:18px_18px]" />
        <div className="relative flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-black/10 bg-white text-[13px] font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
            ✓
          </span>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-black/45">Saved</p>
            <p className="mt-0.5 text-sm font-medium tracking-[-0.01em] text-black">{message}</p>
          </div>
        </div>
        {isPending && <span className="sr-only">Updating page URL</span>}
      </div>
    </div>
  );
}
