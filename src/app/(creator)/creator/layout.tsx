import { Suspense } from "react";
import { CreatorSidebar } from "@/components/creator/CreatorSidebar";

function SidebarSkeleton() {
  return (
    <aside className="flex h-screen w-[220px] flex-col border-r border-hairline bg-surface-deep">
      <div className="h-14 border-b border-hairline" />
      <div className="flex-1 animate-pulse p-3" />
      <div className="h-16 border-t border-hairline" />
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
