import { ThemeToggle } from "@/components/ui/ThemeToggle";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="auth-page relative flex min-h-screen items-center justify-center bg-canvas px-4">
      <div className="absolute right-5 top-5">
        <ThemeToggle />
      </div>
      <div className="relative rounded-[12px] border border-hairline-strong p-3">
        <span className="absolute top-2.5 left-3 text-sm font-light text-marks leading-none select-none animate-[fade-in_0.6s_ease-out_0.25s_both]">+</span>
        <span className="absolute top-2.5 right-3 text-sm font-light text-marks leading-none select-none animate-[fade-in_0.6s_ease-out_0.35s_both]">+</span>
        <span className="absolute bottom-2.5 left-3 text-sm font-light text-marks leading-none select-none animate-[fade-in_0.6s_ease-out_0.45s_both]">+</span>
        <span className="absolute bottom-2.5 right-3 text-sm font-light text-marks leading-none select-none animate-[fade-in_0.6s_ease-out_0.55s_both]">+</span>
        {children}
      </div>
    </div>
  );
}
