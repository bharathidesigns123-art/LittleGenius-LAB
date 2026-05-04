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
    "Full-stack toy commerce platform for LittleGenius LAB, an India-based 3D printed toy brand.",
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
