"use client";

import { useTheme } from "next-themes";
import { ClerkProvider } from "@clerk/nextjs";

const appearance = (isDark: boolean) => ({
  variables: {
    colorBackground: isDark ? "#0a0a0c" : "#ffffff",
    colorPrimary: isDark ? "#fcfdff" : "#0a0a0c",
    colorPrimaryForeground: isDark ? "#000000" : "#ffffff",
    colorInputForeground: isDark ? "#fcfdff" : "#0a0a0c",
    colorInput: isDark ? "#101012" : "#f4f5f6",
    colorNeutral: isDark ? "#fcfdff" : "#0a0a0c",
    colorForeground: isDark ? "#fcfdff" : "#0a0a0c",
    colorMuted: isDark ? "#0a0a0c" : "#f4f5f6",
    colorMutedForeground: isDark ? "#a1a4a5" : "#6b6f72",
    colorBorder: isDark ? "rgba(255,255,255,0.14)" : "rgba(0,0,0,0.12)",
    borderRadius: "8px",
    fontFamily: "Inter, system-ui, sans-serif",
  },
  elements: {
    rootBox: {
      boxShadow: "none",
    },
    cardBox: {
      boxShadow: "none",
    },
    card: {
      boxShadow: "none",
    },
    main: {
      boxShadow: "none",
    },
    footer: {
      boxShadow: "none",
    },
    socialButtonsBlockButton: {
      border: isDark ? "1px solid #888e90" : "1px solid #9ca0a3",
      boxShadow: "none",
    },
    formButtonPrimary: {
      boxShadow: "none",
    },
  },
});

export function ClerkThemedProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  return <ClerkProvider appearance={appearance(isDark)}>{children}</ClerkProvider>;
}
