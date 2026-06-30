export type CourierProvider = "steadfast" | "pathao";

export type SteadfastCredentials = {
  api_key: string;
  secret_key: string;
};

export type PathaoCredentials = {
  environment: "sandbox" | "live";
  client_id: string;
  client_secret: string;
  username: string;
  password: string;
  access_token: string;
  refresh_token: string;
  token_expires_at: string; // ISO timestamp
  store_id: number;
  store_name: string;
};

export type CourierIntegration = {
  id: string;
  brand_clerk_user_id: string;
  provider: CourierProvider;
  credentials: SteadfastCredentials | PathaoCredentials;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};
