import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
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
  target_gender: string | null;
};

type ProductCoupon = {
  product_id: string;
  code: string;
};

type ProductsSearchParams = Promise<{
  q?: string | string[];
  sort?: string | string[];
  minCommission?: string | string[];
  minCoupon?: string | string[];
  gender?: string | string[];
}>;

const sortOptions = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
  { value: "commission_desc", label: "Commission: high to low" },
];

const percentageOptions = [
  { value: "", label: "Any" },
  { value: "10", label: "10%+" },
  { value: "20", label: "20%+" },
  { value: "30", label: "30%+" },
];

const genderOptions = [
  { value: "", label: "Any gender" },
  { value: "women", label: "Women" },
  { value: "men", label: "Men" },
  { value: "kids", label: "Kids" },
];

function getParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function getPercentageFilter(value: string) {
  return ["10", "20", "30"].includes(value) ? Number(value) : null;
}

function getGenderFilter(value: string) {
  return ["women", "men", "kids"].includes(value) ? value : "";
}

export default async function CreatorProductsPage({
  searchParams,
}: {
  searchParams: ProductsSearchParams;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const params = await searchParams;
  const q = getParam(params.q).trim().slice(0, 80);
  const sort = sortOptions.some((option) => option.value === getParam(params.sort))
    ? getParam(params.sort)
    : "newest";
  const minCommission = getPercentageFilter(getParam(params.minCommission));
  const minCoupon = getPercentageFilter(getParam(params.minCoupon));
  const gender = getGenderFilter(getParam(params.gender));
  const hasFilters = Boolean(q || minCommission !== null || minCoupon !== null || gender || sort !== "newest");

  const supabase = createSupabaseAdmin();
  let productsQuery = supabase
    .from("products")
    .select("id, name, price, source_url, image_url, commission_percentage, coupon_discount_percentage, target_gender");

  if (q) {
    productsQuery = productsQuery.ilike("name", `%${q}%`);
  }

  if (minCommission !== null) {
    productsQuery = productsQuery.gte("commission_percentage", minCommission);
  }

  if (minCoupon !== null) {
    productsQuery = productsQuery.gte("coupon_discount_percentage", minCoupon);
  }

  if (gender) {
    productsQuery = productsQuery.in("target_gender", ["all", gender]);
  }

  if (sort === "price_asc") {
    productsQuery = productsQuery.order("price", { ascending: true, nullsFirst: false });
  } else if (sort === "price_desc") {
    productsQuery = productsQuery.order("price", { ascending: false, nullsFirst: false });
  } else if (sort === "commission_desc") {
    productsQuery = productsQuery.order("commission_percentage", { ascending: false, nullsFirst: false });
  } else {
    productsQuery = productsQuery.order("created_at", { ascending: false });
  }

  const { data: products, error } = await productsQuery;

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

        <form
          action="/creator/products"
          className="rounded-lg border border-hairline bg-surface-card p-4 shadow-sm"
        >
          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_170px_140px_140px_140px_auto] md:items-end">
            <label className="space-y-1.5">
              <span className="text-xs font-medium uppercase tracking-wide text-mute">Search</span>
              <input
                type="search"
                name="q"
                defaultValue={q}
                placeholder="Search by product name"
                className="h-10 w-full rounded-md border border-hairline bg-canvas px-3 text-sm text-ink outline-none transition-colors placeholder:text-stone focus:border-overlay-strong"
              />
            </label>

            <label className="space-y-1.5">
              <span className="text-xs font-medium uppercase tracking-wide text-mute">Sort</span>
              <select
                name="sort"
                defaultValue={sort}
                className="h-10 w-full rounded-md border border-hairline bg-canvas px-3 text-sm text-ink outline-none transition-colors focus:border-overlay-strong"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>

            <label className="space-y-1.5">
              <span className="text-xs font-medium uppercase tracking-wide text-mute">Commission</span>
              <select
                name="minCommission"
                defaultValue={minCommission?.toString() ?? ""}
                className="h-10 w-full rounded-md border border-hairline bg-canvas px-3 text-sm text-ink outline-none transition-colors focus:border-overlay-strong"
              >
                {percentageOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>

            <label className="space-y-1.5">
              <span className="text-xs font-medium uppercase tracking-wide text-mute">Gender</span>
              <select
                name="gender"
                defaultValue={gender}
                className="h-10 w-full rounded-md border border-hairline bg-canvas px-3 text-sm text-ink outline-none transition-colors focus:border-overlay-strong"
              >
                {genderOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>

            <label className="space-y-1.5">
              <span className="text-xs font-medium uppercase tracking-wide text-mute">Coupon</span>
              <select
                name="minCoupon"
                defaultValue={minCoupon?.toString() ?? ""}
                className="h-10 w-full rounded-md border border-hairline bg-canvas px-3 text-sm text-ink outline-none transition-colors focus:border-overlay-strong"
              >
                {percentageOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>

            <div className="flex gap-2">
              <button
                type="submit"
                className="h-10 rounded-md bg-ink px-4 text-sm font-medium text-white transition-colors hover:bg-charcoal"
              >
                Apply
              </button>
              {hasFilters ? (
                <Link
                  href="/creator/products"
                  className="inline-flex h-10 items-center rounded-md border border-hairline px-3 text-sm text-charcoal transition-colors hover:border-overlay-strong hover:text-ink"
                >
                  Clear
                </Link>
              ) : null}
            </div>
          </div>
        </form>

        {error ? (
          <div className="rounded-lg border border-hairline-strong bg-surface-card p-6 text-sm text-charcoal">
            Products could not be loaded right now. Please try again in a moment.
          </div>
        ) : !products || products.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-hairline-strong py-16 text-center">
            <p className="text-sm text-charcoal">
              {hasFilters
                ? "No products match your filters. Try a broader search or clear filters."
                : "No products are available yet. Check back after brands add products."}
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
