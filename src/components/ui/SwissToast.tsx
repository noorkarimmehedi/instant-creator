"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CheckCircle, X } from "lucide-react";
import { getSettingsToastMessage } from "@/lib/settings/toast";

type SwissToastPayload = {
  title?: string;
  message: string;
};

type ToastEvent = CustomEvent<SwissToastPayload>;

export function dispatchSwissToast(message: string) {
  window.dispatchEvent(new CustomEvent("swiss-toast", { detail: { title: "Success", message } }));
}

export function SwissToastViewport() {
  const [toast, setToast] = useState<SwissToastPayload | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    function handleToast(event: Event) {
      setToast((event as ToastEvent).detail);
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
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 4000);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  if (!toast) return null;

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 sm:bottom-8 sm:right-8" aria-live="polite" aria-atomic="true">
      <div className="pointer-events-auto flex w-full max-w-xs items-center justify-between gap-4 rounded-xl border border-green-600/50 bg-white p-3 text-[#111111] shadow-[0_18px_45px_rgba(15,23,42,0.16)] animate-[fade-up_0.22s_ease-out_both]">
        <div className="flex items-start gap-2">
          <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" aria-hidden="true" />
          <div>
            <h3 className="text-xs font-medium leading-none text-green-600">{toast.title ?? "Success"}</h3>
            <p className="mt-1 text-xs leading-snug text-[#6b6f72]">{toast.message}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setToast(null)}
          className="rounded-full p-1 text-[#6b6f72] transition-colors hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-green-600/30"
          aria-label="Dismiss notification"
        >
          <X className="h-3 w-3" aria-hidden="true" />
        </button>
        {isPending && <span className="sr-only">Updating page URL</span>}
      </div>
    </div>
  );
}
