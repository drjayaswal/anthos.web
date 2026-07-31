import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { Toaster } from "@/components/Toaster";

export const metadata: Metadata = {
  metadataBase: new URL("https://firemail.in"),
  title: {
    default: "Firemail",
    template: "%s | Firemail",
  },
  description: "Secure, Transparent, Reliable. Fire up your inbox.",
  applicationName: "firemail",
  authors: [{ name: "Firemail Team and Dhruv Ratan Jayaswal" }],
  keywords: ["email analysis", "privacy", "gmail", "encryption", "ai mail", "firemail", "fire mail"],
  icons: {
    icon: "/icons/favicon.ico",
    shortcut: "/icons/favicon-32x32.png",
    apple: "/icons/apple-touch-icon.png",
    other: [
      {
        rel: "icon",
        type: "image/png",
        sizes: "32x32",
        url: "/icons/favicon-32x32.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "16x16",
        url: "/icons/favicon-16x16.png",
      },
    ],
  },

  openGraph: {
    title: "firemail",
    description: "Fire up your inbox.",
    url: "https://firemail.in",
    siteName: "firemail",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "firemail",
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
      <body className="bg-gray-50 flex flex-col select-none">
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