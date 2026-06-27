import type { Metadata } from "next";
import { Inter, DM_Serif_Display, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
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
  title: "InstantCreator — Bangladesh's First Influencer-Brand Marketplace",
  description:
    "Track orders. Filter fraud. Pay creators. The only platform connecting Shopify brands with influencers in Bangladesh.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorBackground: "#0a0a0c",
          colorPrimary: "#fcfdff",
          colorInputForeground: "#fcfdff",
        },
      }}
    >
      <html
        lang="en"
        className={`${inter.variable} ${dmSerif.variable} ${geistMono.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col bg-canvas text-ink font-body">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
