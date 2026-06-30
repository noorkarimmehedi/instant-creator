const BASE_URL = "https://portal.packzy.com/api/v1";

// Steadfast statuses that mean the consignment is settled and no longer worth polling.
export const FINAL_STATUSES = ["delivered", "partial_delivered", "cancelled"];

type SteadfastAuth = {
  apiKey: string;
  secretKey: string;
};

function headers({ apiKey, secretKey }: SteadfastAuth) {
  return {
    "Api-Key": apiKey,
    "Secret-Key": secretKey,
    "Content-Type": "application/json",
  };
}

/**
 * Coerce a Bangladeshi phone number to the 11-digit `01XXXXXXXXX` form Steadfast expects.
 * Handles `+8801…`, `8801…`, and numbers with spaces/dashes. Returns the cleaned digits as-is
 * if it can't confidently normalize, so the caller/courier can surface the validation error.
 */
export function normalizeBdPhone(raw: string | null | undefined): string {
  if (!raw) return "";
  let digits = raw.replace(/\D/g, "");
  if (digits.startsWith("880")) digits = digits.slice(3);
  if (digits.length === 10 && digits.startsWith("1")) digits = `0${digits}`;
  return digits;
}

async function parse(res: Response, action: string) {
  const text = await res.text();
  let payload: unknown;
  try {
    payload = text ? JSON.parse(text) : {};
  } catch {
    payload = text;
  }
  if (!res.ok) {
    const message =
      typeof payload === "object" && payload !== null && "message" in payload
        ? String((payload as { message: unknown }).message)
        : typeof payload === "string"
        ? payload
        : JSON.stringify(payload);
    throw new Error(`Steadfast ${action} failed (${res.status}): ${message}`);
  }
  return payload as Record<string, unknown>;
}

export type SteadfastConsignment = {
  consignment_id: number;
  tracking_code: string;
  status: string;
};

export async function createOrder(
  auth: SteadfastAuth,
  order: {
    invoice: string;
    recipientName: string;
    recipientPhone: string;
    recipientAddress: string;
    codAmount: number;
    note?: string;
  }
): Promise<SteadfastConsignment> {
  const res = await fetch(`${BASE_URL}/create_order`, {
    method: "POST",
    headers: headers(auth),
    body: JSON.stringify({
      invoice: order.invoice,
      recipient_name: order.recipientName,
      recipient_phone: normalizeBdPhone(order.recipientPhone),
      recipient_address: order.recipientAddress,
      cod_amount: order.codAmount,
      note: order.note ?? "",
    }),
  });

  const payload = await parse(res, "create_order");
  const consignment = payload.consignment as SteadfastConsignment | undefined;
  if (!consignment?.consignment_id || !consignment.tracking_code) {
    throw new Error("Steadfast create_order returned no consignment.");
  }
  return consignment;
}

export async function getStatusByCid(
  auth: SteadfastAuth,
  consignmentId: string
): Promise<string | null> {
  const res = await fetch(`${BASE_URL}/status_by_cid/${consignmentId}`, {
    headers: headers(auth),
  });
  const payload = await parse(res, "status_by_cid");
  return typeof payload.delivery_status === "string" ? payload.delivery_status : null;
}

export async function getBalance(auth: SteadfastAuth): Promise<number> {
  const res = await fetch(`${BASE_URL}/get_balance`, {
    headers: headers(auth),
  });
  const payload = await parse(res, "get_balance");
  return typeof payload.current_balance === "number" ? payload.current_balance : 0;
}

export async function createReturnRequest(
  auth: SteadfastAuth,
  args: { consignmentId: string; reason?: string }
): Promise<string> {
  const res = await fetch(`${BASE_URL}/create_return_request`, {
    method: "POST",
    headers: headers(auth),
    body: JSON.stringify({
      consignment_id: args.consignmentId,
      reason: args.reason ?? "",
    }),
  });
  const payload = await parse(res, "create_return_request");
  return typeof payload.status === "string" ? payload.status : "pending";
}
