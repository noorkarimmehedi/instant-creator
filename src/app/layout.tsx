import type { Metadata } from "next";
import { Inter, DM_Serif_Display, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { ClerkThemedProvider } from "@/components/ClerkThemedProvider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const dmSerif = DM_Serif_Display({
  variable: "--font-dm-serif",
  weight: "400",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Zair/Creator — Bangladesh's First Influencer-Brand Marketplace",
  description:
    "Track orders. Filter fraud. Pay creators. The only platform connecting Shopify brands with influencers in Bangladesh.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${dmSerif.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col bg-canvas text-ink font-body"
      >
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <ClerkThemedProvider>{children}</ClerkThemedProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
