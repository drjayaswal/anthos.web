import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { Toaster } from "@/components/Toaster";

export const metadata: Metadata = {
  metadataBase: new URL("https://anthos-opensource.vercel.app"),
  title: {
    default: "Anthos",
    template: "%s | Anthos",
  },
  description: "Secure, Transparent, Reliable. Fire up your inbox.",
  applicationName: "Anthos",
  authors: [{ name: "Anthos Team and Dhruv Ratan Jayaswal" }],
  keywords: ["email analysis", "privacy", "gmail", "encryption", "ai mail", "anthos", "anthos mail"],
  icons: {
    icon: [
      { url: "/icons/favicon.ico" },
      { url: "/icons/favicon.svg", type: "image/svg+xml" },
      { url: "/icons/favicon-16x16.png", type: "image/png", sizes: "16x16" },
      { url: "/icons/favicon-32x32.png", type: "image/png", sizes: "32x32" },
    ],
    shortcut: "/icons/favicon.ico",
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/icons/site.webmanifest",

  openGraph: {
    title: "Anthos",
    description: "Fire up your inbox.",
    url: "https://anthos-opensource.vercel.app",
    siteName: "Anthos",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Anthos",
    description: "Fire up your inbox.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body className="flex flex-col select-none">
        <Toaster />
        <Suspense fallback={null}>
          <main className="flex-1">
            {children}
          </main>
        </Suspense>
      </body>
    </html>
  );
}