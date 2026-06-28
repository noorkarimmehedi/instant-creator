import Image from "next/image";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createSupabaseAdmin } from "@/lib/supabase/server";
import { Topbar } from "@/components/dashboard/Topbar";
import { SwissCard } from "@/components/ui/SwissCard";
import { AddProductForm } from "./AddProductForm";

export default async function ProductsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const supabase = createSupabaseAdmin();
  const { data: products } = await supabase
    .from("products")
    .select("id, name, price, source_url, image_url, images, commission_percentage, coupon_discount_percentage")
    .eq("clerk_user_id", userId)
    .order("created_at", { ascending: false });

  return (
    <>
      <Topbar title="Products" />

      <div className="p-8 space-y-8 animate-[fade-up_0.6s_ease-out_both]">
        <SwissCard>
          <h2 className="text-lg font-medium text-ink mb-4">Add a product</h2>
          <AddProductForm />
        </SwissCard>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-ink">
              Your products
              {products && products.length > 0 ? (
                <span className="ml-2 text-xs text-mute">
                  {products.length}
                </span>
              ) : null}
            </h2>
          </div>

          {!products || products.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-hairline-strong py-16 text-center">
              <p className="text-sm text-charcoal">
                No products yet. Paste a product URL above and Firecrawl will
                extract the details and images for you.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {products.map((p) => (
                <a
                  key={p.id}
                  href={p.source_url ?? "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="group overflow-hidden rounded-lg border border-hairline bg-surface-card transition-colors hover:border-overlay-strong"
                >
                  <div className="relative aspect-square w-full bg-surface-elevated">
                    {p.image_url ? (
                      <Image
                        src={p.image_url}
                        alt={p.name}
                        fill
                        sizes="(max-width: 768px) 50vw, 25vw"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-stone">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="truncate text-sm text-ink">{p.name}</p>
                    <p className="mt-1 text-xs text-mute">
                      {p.price ? `$${p.price}` : "—"}
                    </p>
                    <p className="mt-2 text-xs text-charcoal">
                      {p.commission_percentage}% commission · {p.coupon_discount_percentage}% coupon
                    </p>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
