// Maps Steadfast delivery statuses (and our return state) to a coloured pill.
const TONE: Record<string, string> = {
  delivered: "bg-accent-green/10 text-accent-green",
  partial_delivered: "bg-accent-green/10 text-accent-green",
  cancelled: "bg-accent-red/10 text-accent-red",
  returned: "bg-accent-red/10 text-accent-red",
  hold: "bg-accent-orange/10 text-accent-orange",
  in_review: "bg-surface-elevated text-mute",
  pending: "bg-surface-elevated text-mute",
};

const LABEL: Record<string, string> = {
  delivered_approval_pending: "delivered (pending)",
  partial_delivered_approval_pending: "partial (pending)",
  cancelled_approval_pending: "cancelled (pending)",
  unknown_approval_pending: "pending review",
  partial_delivered: "partial delivered",
  in_review: "in review",
};

export function CourierStatusBadge({
  status,
  returnStatus,
}: {
  status: string | null;
  returnStatus?: string | null;
}) {
  if (returnStatus) {
    return (
      <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${TONE.returned}`}>
        returned
      </span>
    );
  }

  if (!status) {
    return <span className="text-xs text-stone">Not sent</span>;
  }

  const tone = TONE[status] ?? "bg-accent-blue/10 text-accent-blue";
  const label = LABEL[status] ?? status.replace(/_/g, " ");

  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${tone}`}>
      {label}
    </span>
  );
}
