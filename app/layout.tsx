import "./globals.css";
import type { ReactNode } from "react";
import { Suspense } from "react";
import AppNav from "@/components/layout/AppNav";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-white text-gray-900 antialiased">
        <header className="border-b">
          <Suspense fallback={null}>
            <AppNav />
          </Suspense>
        </header>
        <main className="mx-auto max-w-5xl p-6">{children}</main>
        <footer className="mx-auto max-w-5xl p-6 text-center text-sm text-gray-500 border-t">
          © 2025 GUST Alumni MVP
        </footer>
      </body>
    </html>
  );
}
