import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getCachedBrand } from "@/lib/queries/brand";
import { Sidebar } from "@/components/dashboard/Sidebar";

export async function DashboardSidebar() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const brand = await getCachedBrand(userId);

  return (
    <Sidebar
      brandName={brand.name ?? "My Brand"}
      plan={brand.plan ?? "starter"}
    />
  );
}
