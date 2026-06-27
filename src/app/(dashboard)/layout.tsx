import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createSupabaseAdmin } from "@/lib/supabase/server";
import { Sidebar } from "@/components/dashboard/Sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const supabase = createSupabaseAdmin();
  const { data: brand } = await supabase
    .from("brands")
    .select("name, plan")
    .eq("clerk_user_id", userId)
    .single();

  return (
    <div className="flex h-screen bg-canvas">
      <Sidebar brandName={brand?.name ?? "My Brand"} plan={brand?.plan ?? "starter"} />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
