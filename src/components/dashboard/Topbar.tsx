import { MobileNavToggle } from "@/components/ui/MobileNav";

interface TopbarProps {
  title: string;
  children?: React.ReactNode;
}

export function Topbar({ title, children }: TopbarProps) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-hairline px-4 sm:px-8">
      <div className="flex min-w-0 items-center gap-2">
        <MobileNavToggle />
        <h1 className="truncate text-lg font-medium text-ink sm:text-xl">{title}</h1>
      </div>
      {children && <div className="flex items-center gap-3">{children}</div>}
    </header>
  );
}
