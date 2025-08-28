import "./globals.css";
import type { Metadata } from "next";
import { SiteHeader } from "../components/site-header";

export const metadata: Metadata = {
  title: "GUST Alumni",
  description: "MVP",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground">
        <SiteHeader />
        <div className="mx-auto max-w-6xl px-4 py-10">{children}</div>
      </body>
    </html>
  );
}
