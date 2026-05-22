import type { Metadata } from "next";
import { DM_Sans, Fraunces } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import { AppProviders } from "@/components/providers/app-providers";
import "./globals.css";

const bodyFont = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
});

const displayFont = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://littlegeniuslab.in"),
  title: {
    default: "LittleGenius LAB",
    template: "%s | LittleGenius LAB",
  },
  alternates: {
    canonical: "/",
  },
  description:
    "LittleGenius LAB makes personalized 3D printed gifts, custom keychains, toys, and keepsakes in India with WhatsApp customization support.",
  keywords: [
    "3d printed toys",
    "custom keychains",
    "anime keychains",
    "personalized 3d printed gifts",
    "3d printed accessories",
    "custom printed products",
    "little genius lab",
  ],
  openGraph: {
    type: "website",
    title: "LittleGenius LAB",
    description:
      "Shop ready-to-ship 3D printed toys, custom keychains, and personalized keepsakes in India.",
    url: "https://littlegeniuslab.in",
    siteName: "LittleGenius LAB",
    locale: "en_IN",
    images: [
      {
        url: "/android-chrome-512x512.png",
        width: 512,
        height: 512,
        alt: "LittleGenius LAB",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "LittleGenius LAB",
    description:
      "Shop ready-to-ship 3D printed toys and custom figurines made in India.",
  },
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${bodyFont.variable} ${displayFont.variable}`}>
      <body suppressHydrationWarning>
        <AppProviders>{children}</AppProviders>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
