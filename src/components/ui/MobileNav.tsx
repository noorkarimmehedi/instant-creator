"use client";

import { createContext, useContext, useState } from "react";
import { usePathname } from "next/navigation";

type MobileNavValue = { open: boolean; setOpen: (v: boolean) => void };

const MobileNavContext = createContext<MobileNavValue>({
  open: false,
  setOpen: () => {},
});

export function MobileNavProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [prevPathname, setPrevPathname] = useState(pathname);

  // Close the drawer whenever the route changes (adjust state during render).
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setOpen(false);
  }

  return (
    <MobileNavContext.Provider value={{ open, setOpen }}>
      {children}
    </MobileNavContext.Provider>
  );
}

export function useMobileNav() {
  return useContext(MobileNavContext);
}

export function MobileNavToggle() {
  const { setOpen } = useMobileNav();
  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className="-ml-1 flex h-9 w-9 items-center justify-center rounded-lg text-ink transition-colors hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/50 lg:hidden"
      aria-label="Open navigation menu"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        className="h-5 w-5"
        aria-hidden="true"
      >
        <path d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>
  );
}
