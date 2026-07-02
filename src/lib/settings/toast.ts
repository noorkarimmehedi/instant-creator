const settingsToastMessages: Record<string, string> = {
  "brand-profile": "Brand profile saved",
  "shopify-disconnected": "Shopify disconnected",
  "courier-active": "Courier made active",
  "courier-disconnected": "Courier disconnected",
  "steadfast-connected": "Steadfast connected",
  "pathao-connected": "Pathao connected",
  "creator-profile": "Creator profile saved",
  "creator-socials": "Social accounts saved",
  "creator-payout": "Payout method saved",
};

export function getSettingsToastMessage(toast: string | null) {
  if (!toast) return null;
  return settingsToastMessages[toast] ?? null;
}

export function settingsToastUrl(pathname: string, toast: keyof typeof settingsToastMessages) {
  return `${pathname}?toast=${toast}`;
}
