import type { Metadata } from "next";
import { DM_Sans, Fraunces } from "next/font/google";
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${bodyFont.variable} ${displayFont.variable}`}>
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
