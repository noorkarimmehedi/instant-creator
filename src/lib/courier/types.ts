export type CourierProvider = "steadfast" | "pathao";

export type SteadfastCredentials = {
  api_key: string;
  secret_key: string;
};

export type CourierIntegration = {
  id: string;
  brand_clerk_user_id: string;
  provider: CourierProvider;
  credentials: SteadfastCredentials;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};
