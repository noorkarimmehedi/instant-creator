import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createSupabaseAdmin } from "@/lib/supabase/server";
import { Topbar } from "@/components/dashboard/Topbar";
import { ProductPromotionCard } from "./ProductPromotionCard";

type Product = {
  id: string;
  name: string;
  price: number | string | null;
  source_url: string | null;
  image_url: string | null;
  commission_percentage: number | string | null;
  coupon_discount_percentage: number | string | null;
};

type ProductCoupon = {
  product_id: string;
  code: string;
};

export default async function CreatorProductsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const supabase = createSupabaseAdmin();
  const { data: products, error } = await supabase
    .from("products")
    .select("id, name, price, source_url, image_url, commission_percentage, coupon_discount_percentage")
    .order("created_at", { ascending: false });

  const productIds = (products ?? []).map((product) => product.id);
  const { data: coupons } = productIds.length > 0
    ? await supabase
        .from("product_coupons")
        .select("product_id, code")
        .eq("influencer_clerk_user_id", userId)
        .in("product_id", productIds)
    : { data: [] };
  const couponByProductId = new Map(
    ((coupons ?? []) as ProductCoupon[]).map((coupon) => [coupon.product_id, coupon.code])
  );

  return (
    <>
      <Topbar title="Products" />

      <div className="p-8 space-y-8 animate-[fade-up_0.6s_ease-out_both]">
        <div>
          <p className="text-sm font-medium text-accent-orange">Creator marketplace</p>
          <h1 className="mt-2 text-2xl font-medium tracking-tight text-ink">
            Browse products to promote
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-mute">
            Pick products from connected brands and use the product page to plan your next campaign.
          </p>
        </div>

        {error ? (
          <div className="rounded-lg border border-hairline-strong bg-surface-card p-6 text-sm text-charcoal">
            Products could not be loaded right now. Please try again in a moment.
          </div>
        ) : !products || products.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-hairline-strong py-16 text-center">
            <p className="text-sm text-charcoal">
              No products are available yet. Check back after brands add products.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {(products as Product[]).map((product) => (
              <ProductPromotionCard
                key={product.id}
                product={product}
                creatorUserId={userId}
                initialCouponCode={couponByProductId.get(product.id)}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
