import { Suspense } from "react";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { SwissToastViewport } from "@/components/ui/SwissToast";
import { MobileNavProvider } from "@/components/ui/MobileNav";

function SidebarSkeleton() {
  return (
    <aside className="hidden h-screen w-[240px] bg-[#e5e5e5] p-0.5 lg:block">
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
    <MobileNavProvider>
      <div className="flex h-screen bg-[#ffffff] font-body">
        <Suspense fallback={<SidebarSkeleton />}>
          <DashboardSidebar />
        </Suspense>
        <main className="flex-1 overflow-y-auto">{children}</main>
        <Suspense fallback={null}>
          <SwissToastViewport />
        </Suspense>
      </div>
    </MobileNavProvider>
  );
}
