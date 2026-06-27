import { SwissCard } from "../ui/SwissCard";

const stats = [
  { label: "Total Orders", value: "—" },
  { label: "Active Influencers", value: "—" },
  { label: "RTO Rate", value: "—" },
  { label: "Commission Due", value: "—" },
];

export function StatsRow() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <SwissCard key={stat.label} className="p-5">
          <p className="text-xs text-mute uppercase tracking-wide">{stat.label}</p>
          <p className="mt-2 font-display text-3xl text-ink relative overflow-hidden">
            <span className="relative z-10">{stat.value}</span>
            <span
              className="absolute inset-0 z-0 animate-[shimmer_2s_linear_infinite]"
              style={{
                backgroundImage:
                  "linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent)",
                backgroundSize: "200% 100%",
              }}
            />
          </p>
        </SwissCard>
      ))}
    </div>
  );
}
