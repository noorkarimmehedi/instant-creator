export default function Loading() {
  return (
    <div className="w-[min(22rem,calc(100vw-3rem))] space-y-6 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-[10px] border border-hairline-strong bg-surface-card shadow-card">
        <div className="h-2.5 w-2.5 animate-[dot-pulse_1.4s_ease-in-out_infinite] rounded-full bg-accent-green" />
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-mute">
          Routing account
        </p>
        <h1 className="font-display text-2xl text-ink">Opening your workspace</h1>
        <p className="mx-auto max-w-xs text-sm leading-6 text-charcoal">
          Checking your account type so we can send you to the right dashboard.
        </p>
      </div>

      <div className="space-y-2 rounded-[10px] border border-hairline bg-surface-card p-3 text-left shadow-card">
        <div className="h-2 rounded-full bg-surface-elevated">
          <div className="h-full w-2/3 animate-[line-grow_1.2s_ease-out_infinite_alternate] rounded-full bg-accent-orange" />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="h-10 rounded-md border border-hairline bg-surface-deep" />
          <div className="h-10 rounded-md border border-hairline bg-surface-deep" />
          <div className="h-10 rounded-md border border-hairline bg-surface-deep" />
        </div>
      </div>
    </div>
  );
}
