const allowedAvatarMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

export function isAllowedAvatarMimeType(mimeType: string) {
  return allowedAvatarMimeTypes.has(mimeType);
}

export function buildAvatarStoragePath(userId: string, fileName: string) {
  const ext = fileName.includes(".") ? fileName.split(".").pop() : "jpg";
  return `avatars/${userId}.${ext || "jpg"}`;
}

export const avatarBucket = "meta-media";
export const avatarMaxBytes = 2 * 1024 * 1024;
