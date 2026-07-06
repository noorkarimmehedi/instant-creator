"use client";

import { useState, useTransition } from "react";
import { ProductGroupCard } from "./ProductGroupCard";
import { groupProducts } from "./actions";
import { Button } from "@/components/ui/Button";

type Product = {
  id: string;
  name: string;
  price: number | string | null;
  source_url: string | null;
  image_url: string | null;
  images: string[] | null;
  commission_percentage: number | string | null;
  coupon_discount_percentage: number | string | null;
  target_gender: string | null;
  product_group_id: string;
  variant_label: string | null;
};

export function ProductsGrid({ groups }: { groups: Product[][] }) {
  const [isGrouping, setIsGrouping] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  function toggleGrouping() {
    setIsGrouping((prev) => !prev);
    setSelected(new Set());
    setMessage(null);
  }

  function toggleSelect(groupId: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  }

  function handleGroup() {
    startTransition(async () => {
      const result = await groupProducts([...selected]);
      if (result.ok) {
        setSelected(new Set());
        setIsGrouping(false);
        setMessage({ ok: true, text: "Products grouped successfully!" });
      } else {
        setMessage({ ok: false, text: result.error });
      }
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-ink">
          Your products
          {groups.length > 0 ? (
            <span className="ml-2 text-xs text-mute">{groups.length}</span>
          ) : null}
        </h2>
        {groups.length >= 2 && (
          <Button
            type="button"
            onClick={toggleGrouping}
            variant="productAction"
            className={isGrouping ? "text-accent-red" : ""}
          >
            {isGrouping ? "Cancel" : "Group variants"}
          </Button>
        )}
      </div>

      {message && (
        <p className={`text-xs mb-3 ${message.ok ? "text-accent-green" : "text-accent-red"}`}>
          {message.text}
        </p>
      )}

      {isGrouping && (
        <p className="text-xs text-mute mb-4">
          Select two or more products that are variants of each other (e.g. same product in different colors). They will share a single coupon code.
        </p>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {groups.map((group) => {
          const groupId = group[0].product_group_id;
          const isSelected = selected.has(groupId);

          return (
            <div
              key={groupId}
              className={`relative transition-all duration-200 rounded-lg ${
                isGrouping ? "cursor-pointer" : ""
              } ${isSelected ? "ring-2 ring-accent-blue ring-offset-2 ring-offset-canvas" : ""}`}
              onClick={isGrouping ? () => toggleSelect(groupId) : undefined}
            >
              {isGrouping && (
                <div className="absolute top-2 left-2 z-10">
                  <div
                    className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors ${
                      isSelected
                        ? "border-accent-blue bg-accent-blue"
                        : "border-overlay-strong bg-white/80 backdrop-blur-sm"
                    }`}
                  >
                    {isSelected && (
                      <svg
                        className="h-3 w-3 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={3}
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    )}
                  </div>
                </div>
              )}

              {/* Overlay to block card interactions during grouping mode */}
              {isGrouping && <div className="absolute inset-0 z-[5] rounded-lg" />}

              <ProductGroupCard products={group} />
            </div>
          );
        })}
      </div>

      {/* Floating action bar */}
      {isGrouping && selected.size >= 2 && (
        <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-4 rounded-full bg-ink/90 px-6 py-3 text-sm text-white shadow-lg backdrop-blur-md">
          <span>
            <span className="font-medium">{selected.size}</span> selected
          </span>
          <Button
            type="button"
            onClick={handleGroup}
            disabled={isPending}
            variant="productAction"
          >
            {isPending ? "Grouping…" : "Group as variants"}
          </Button>
        </div>
      )}
    </div>
  );
}
