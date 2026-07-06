import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createSupabaseAdmin } from "@/lib/supabase/server";
import { Topbar } from "@/components/dashboard/Topbar";
import { SwissCard } from "@/components/ui/SwissCard";
import { AddProductForm } from "./AddProductForm";
import { ProductsGrid } from "./ProductsGrid";

export default async function ProductsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const supabase = createSupabaseAdmin();
  const { data: products } = await supabase
    .from("products")
    .select("id, name, price, source_url, image_url, images, commission_percentage, coupon_discount_percentage, target_gender, product_group_id, variant_label")
    .eq("clerk_user_id", userId)
    .eq("archived", false)
    .order("created_at", { ascending: false });

  // Group products by product_group_id so each card represents all variants.
  const groupMap = new Map<string, NonNullable<typeof products>>();
  for (const product of products ?? []) {
    const key = product.product_group_id as string;
    const group = groupMap.get(key);
    if (group) {
      group.push(product);
    } else {
      groupMap.set(key, [product]);
    }
  }
  const groups = Array.from(groupMap.values());

  return (
    <>
      <Topbar title="Products" />

      <div className="p-4 sm:p-8 space-y-8 animate-[fade-up_0.6s_ease-out_both]">
        <SwissCard>
          <h2 className="text-lg font-medium text-ink mb-4">Add a product</h2>
          <AddProductForm />
        </SwissCard>

        <div>
          {groups.length === 0 ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-ink">Your products</h2>
              </div>
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-hairline-strong py-16 text-center">
                <p className="text-sm text-charcoal">
                  No products yet. Paste a product URL above and Firecrawl will
                  extract the details and images for you.
                </p>
              </div>
            </>
          ) : (
            <ProductsGrid groups={groups} />
          )}
        </div>
      </div>
    </>
  );
}

