import { Suspense } from "react";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";

function SidebarSkeleton() {
  return (
    <aside className="grid h-screen w-[304px] grid-cols-[64px_1fr] bg-[#e5e5e5]">
      <div className="animate-pulse p-2">
        <div className="mx-auto mt-2 h-11 w-11 rounded-lg bg-black/5" />
      </div>
      <div className="py-2 pr-2">
        <div className="h-full rounded-xl bg-[#F5F5F5] p-3">
          <div className="h-8 rounded-lg bg-black/5" />
        </div>
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
