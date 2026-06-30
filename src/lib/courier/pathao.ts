import { normalizeBdPhone } from "./steadfast";

export const PATHAO_BASE_URLS = {
  sandbox: "https://courier-api-sandbox.pathao.com",
  live: "https://api-hermes.pathao.com",
} as const;

export type PathaoEnvironment = keyof typeof PATHAO_BASE_URLS;

// Pathao order_status_slug values that mean the consignment is settled.
export const PATHAO_FINAL_STATUSES = [
  "delivered",
  "partial_delivery",
  "returned",
  "paid",
  "paid_return",
];

export function pathaoBaseUrl(env: PathaoEnvironment): string {
  return PATHAO_BASE_URLS[env] ?? PATHAO_BASE_URLS.live;
}

type TokenResponse = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
};

async function parse(res: Response, action: string) {
  const text = await res.text();
  let payload: unknown;
  try {
    payload = text ? JSON.parse(text) : {};
  } catch {
    payload = text;
  }
  if (!res.ok) {
    const obj = (payload ?? {}) as Record<string, unknown>;
    const detail =
      typeof obj.message === "string"
        ? obj.message
        : obj.errors
        ? JSON.stringify(obj.errors)
        : typeof payload === "string"
        ? payload
        : JSON.stringify(payload);
    throw new Error(`Pathao ${action} failed (${res.status}): ${detail}`);
  }
  return payload as Record<string, unknown>;
}

export async function issueToken(args: {
  baseUrl: string;
  clientId: string;
  clientSecret: string;
  username: string;
  password: string;
}): Promise<TokenResponse> {
  const res = await fetch(`${args.baseUrl}/aladdin/api/v1/issue-token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: args.clientId,
      client_secret: args.clientSecret,
      grant_type: "password",
      username: args.username,
      password: args.password,
    }),
  });
  const payload = await parse(res, "issue-token");
  return payload as unknown as TokenResponse;
}

export async function refreshToken(args: {
  baseUrl: string;
  clientId: string;
  clientSecret: string;
  refreshToken: string;
}): Promise<TokenResponse> {
  const res = await fetch(`${args.baseUrl}/aladdin/api/v1/issue-token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: args.clientId,
      client_secret: args.clientSecret,
      grant_type: "refresh_token",
      refresh_token: args.refreshToken,
    }),
  });
  const payload = await parse(res, "refresh-token");
  return payload as unknown as TokenResponse;
}

export type PathaoStore = {
  store_id: number;
  store_name: string;
  is_default_store?: number | boolean;
};

export async function getStores(args: {
  baseUrl: string;
  accessToken: string;
}): Promise<PathaoStore[]> {
  const res = await fetch(`${args.baseUrl}/aladdin/api/v1/stores`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${args.accessToken}`,
    },
  });
  const payload = await parse(res, "stores");
  const data = (payload.data as { data?: PathaoStore[] } | undefined)?.data;
  return Array.isArray(data) ? data : [];
}

export type PathaoOrderResult = {
  consignment_id: string;
  order_status: string;
  delivery_fee: number;
};

export async function createOrder(
  args: { baseUrl: string; accessToken: string },
  order: {
    storeId: number;
    merchantOrderId: string;
    recipientName: string;
    recipientPhone: string;
    recipientAddress: string;
    amountToCollect: number;
    specialInstruction?: string;
    itemQuantity?: number;
    itemWeight?: number;
    deliveryType?: number;
    itemType?: number;
  }
): Promise<PathaoOrderResult> {
  const res = await fetch(`${args.baseUrl}/aladdin/api/v1/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${args.accessToken}`,
    },
    body: JSON.stringify({
      store_id: order.storeId,
      merchant_order_id: order.merchantOrderId,
      recipient_name: order.recipientName,
      recipient_phone: normalizeBdPhone(order.recipientPhone),
      recipient_address: order.recipientAddress,
      delivery_type: order.deliveryType ?? 48,
      item_type: order.itemType ?? 2,
      special_instruction: order.specialInstruction ?? "",
      item_quantity: order.itemQuantity ?? 1,
      item_weight: String(order.itemWeight ?? 0.5),
      amount_to_collect: Math.round(order.amountToCollect),
    }),
  });
  const payload = await parse(res, "create order");
  const data = payload.data as PathaoOrderResult | undefined;
  if (!data?.consignment_id) {
    throw new Error("Pathao create order returned no consignment id.");
  }
  return data;
}

export async function getOrderInfo(
  args: { baseUrl: string; accessToken: string },
  consignmentId: string
): Promise<string | null> {
  const res = await fetch(
    `${args.baseUrl}/aladdin/api/v1/orders/${consignmentId}/info`,
    {
      headers: { Authorization: `Bearer ${args.accessToken}` },
    }
  );
  const payload = await parse(res, "order info");
  const data = payload.data as { order_status_slug?: string; order_status?: string } | undefined;
  return data?.order_status_slug ?? data?.order_status ?? null;
}
