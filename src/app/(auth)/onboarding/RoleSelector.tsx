import { selectRole } from "./actions";

export function RoleSelector() {
  return (
    <div className="flex flex-col gap-4 text-left">
      <form action={selectRole} className="space-y-3">
        <input type="hidden" name="role" value="brand" />
        <div>
          <label className="text-xs text-mute uppercase tracking-wide block mb-1">
            Brand Name
          </label>
          <input
            name="name"
            type="text"
            placeholder="Acme Apparel"
            className="w-full rounded-md border border-hairline-strong bg-surface-elevated px-3 py-2 text-sm text-ink placeholder:text-stone focus:outline-none focus:border-accent-blue transition-colors"
            required
          />
        </div>
        <button
          type="submit"
          className="group relative w-full overflow-hidden rounded-[8px] p-5 text-left cursor-pointer bg-[#F7F7F7]/80 shadow-[0_2px_4px_0_rgba(0,0,0,0.05),0_0_0_1px_rgba(0,0,0,0.06)]"
        >
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] bg-accent-blue/10 text-accent-blue text-lg">
              🏪
            </div>
            <div className="space-y-1">
              <p className="font-medium text-ink">I&apos;m a Brand</p>
              <p className="text-sm text-mute">
                Connect your Shopify store, list products, and manage influencer campaigns
              </p>
            </div>
          </div>
        </button>
      </form>

      <form action={selectRole} className="space-y-3">
        <input type="hidden" name="role" value="influencer" />
        <div>
          <label className="text-xs text-mute uppercase tracking-wide block mb-1">
            Creator Name
          </label>
          <input
            name="name"
            type="text"
            placeholder="Your creator name"
            className="w-full rounded-md border border-hairline-strong bg-surface-elevated px-3 py-2 text-sm text-ink placeholder:text-stone focus:outline-none focus:border-accent-orange transition-colors"
            required
          />
        </div>
        <button
          type="submit"
          className="group relative w-full overflow-hidden rounded-[8px] p-5 text-left cursor-pointer bg-[#F7F7F7]/80 shadow-[0_2px_4px_0_rgba(0,0,0,0.05),0_0_0_1px_rgba(0,0,0,0.06)]"
        >
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] bg-accent-orange/10 text-accent-orange text-lg">
              ✨
            </div>
            <div className="space-y-1">
              <p className="font-medium text-ink">I&apos;m an Influencer</p>
              <p className="text-sm text-mute">
                Browse products, promote brands, and earn commissions on delivered orders
              </p>
            </div>
          </div>
        </button>
      </form>
    </div>
  );
}
