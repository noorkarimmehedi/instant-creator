import { Suspense } from "react";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";

function SidebarSkeleton() {
  return (
    <aside className="h-screen w-[240px] bg-[#e5e5e5] p-0.5">
      <div className="h-full rounded bg-[#F5F5F5] p-3">
        <div className="h-11 rounded-lg bg-black/5" />
      </div>
    </aside>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-[#ffffff] font-body">
      <Suspense fallback={<SidebarSkeleton />}>
        <DashboardSidebar />
      </Suspense>
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
