import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  experimental: {
    // Reuse already-visited dashboard pages from the client router cache instead
    // of re-rendering them on the server on every sidebar click. Mutations still
    // bust the cache via revalidatePath.
    staleTimes: {
      dynamic: 30,
      static: 180,
    },
    // Warm the dynamic data on hover so content is usually ready by the click.
    dynamicOnHover: true,
  },
};

export default nextConfig;
