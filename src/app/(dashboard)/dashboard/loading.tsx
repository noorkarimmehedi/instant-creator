import { Topbar } from "@/components/dashboard/Topbar";

export default function Loading() {
  return (
    <>
      <Topbar title="…" />
      <div className="p-8 space-y-6 animate-pulse">
        <div className="h-16 rounded-lg border border-hairline bg-surface-card" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[3/4] rounded-lg border border-hairline bg-surface-card"
            />
          ))}
        </div>
      </div>
    </>
  );
}
