import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Fairtech Owner", template: "%s · Fairtech Owner" },
  description: "Every Fairtech app in one screen: approvals, flags, numbers, messages.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Fairtech Owner", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0f172a",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
