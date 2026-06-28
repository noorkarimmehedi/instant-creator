import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-hairline py-10">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6">
        <p className="text-xs text-mute">
          &copy; {new Date().getFullYear()} Instant
          <span className="font-bold text-accent-red">/</span>Creator. All rights reserved.
        </p>
        <div className="flex gap-6">
          <Link href="/privacy" className="text-xs text-mute hover:text-ink transition-colors">
            Privacy
          </Link>
          <Link href="/terms" className="text-xs text-mute hover:text-ink transition-colors">
            Terms
          </Link>
        </div>
      </div>
    </footer>
  );
}
