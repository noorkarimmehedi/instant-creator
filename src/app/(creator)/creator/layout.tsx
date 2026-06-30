import { Suspense } from "react";
import { CreatorSidebar } from "@/components/creator/CreatorSidebar";

function SidebarSkeleton() {
  return (
    <aside className="grid h-screen w-[272px] grid-cols-[56px_1fr] bg-[#e5e5e5]">
      <div className="animate-pulse px-2 py-3.5">
        <div className="mx-auto h-11 w-10 rounded-lg bg-black/5" />
      </div>
      <div className="py-[18px] pr-4">
        <div className="h-full rounded-xl bg-[#F5F5F5] p-3">
          <div className="h-8 rounded-lg bg-black/5" />
        </div>
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
