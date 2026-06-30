import { Suspense } from "react";
import { CreatorSidebar } from "@/components/creator/CreatorSidebar";

function SidebarSkeleton() {
  return (
    <aside className="h-screen w-[240px] bg-[#e5e5e5] p-2">
      <div className="h-full rounded-xl bg-[#F5F5F5] p-3">
        <div className="h-11 rounded-lg bg-black/5" />
      </div>
    </aside>
  );
}

export default function CreatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-[#ffffff]">
      <Suspense fallback={<SidebarSkeleton />}>
        <CreatorSidebar />
      </Suspense>
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
