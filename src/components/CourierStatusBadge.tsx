// Maps Steadfast delivery statuses and Pathao order_status_slugs to a coloured pill.
// Both providers are normalised to lowercase and matched with a small heuristic so we
// don't have to enumerate every Pathao slug.

const GREEN = "bg-accent-green/10 text-accent-green";
const RED = "bg-accent-red/10 text-accent-red";
const ORANGE = "bg-accent-orange/10 text-accent-orange";
const MUTE = "bg-surface-elevated text-mute";
const BLUE = "bg-accent-blue/10 text-accent-blue";

// Statuses that mean the consignment is settled (across both providers).
const FINAL = [
  "delivered",
  "partial_delivered",
  "partial_delivery",
  "cancelled",
  "returned",
  "paid",
  "paid_return",
];

export function isFinalCourierStatus(status: string | null): boolean {
  return FINAL.includes((status ?? "").toLowerCase());
}

function tone(status: string): string {
  const s = status.toLowerCase();
  if (s.includes("return")) return RED;
  if (s.includes("cancel") || s.includes("fail")) return RED;
  if (s.includes("deliver") || s === "paid") return GREEN;
  if (s.includes("hold")) return ORANGE;
  if (s === "pending" || s.includes("review")) return MUTE;
  return BLUE;
}

export function CourierStatusBadge({
  status,
  returnStatus,
}: {
  status: string | null;
  returnStatus?: string | null;
}) {
  if (returnStatus) {
    return (
      <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${RED}`}>
        returned
      </span>
    );
  }

  if (!status) {
    return <span className="text-xs text-stone">Not sent</span>;
  }

  const label = status.replace(/_/g, " ").toLowerCase();

  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${tone(status)}`}>
      {label}
    </span>
  );
}
