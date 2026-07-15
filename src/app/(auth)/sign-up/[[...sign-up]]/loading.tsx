export default function Loading() {
  return (
    <div className="flex items-center justify-center" role="status" aria-label="Loading sign-up">
      <svg
        className="h-5 w-5 animate-spin text-ink dark:text-mute"
        viewBox="0 0 24 24"
        fill="none"
      >
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-20" />
        <path
          d="M12 2a10 10 0 0 1 10 10"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </svg>
      <span className="sr-only">Loading sign-up</span>
    </div>
  );
}
