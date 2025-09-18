import type { ReactNode } from "react";
import { Suspense } from "react";
import AppNav from "@/components/layout/AppNav";
import "./globals.css";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header>
          <Suspense fallback={null}>
            <AppNav />
          </Suspense>
        </header>
        <main className="mx-auto max-w-5xl p-6">{children}</main>
        <footer className="mx-auto max-w-5xl p-6 text-center text-sm text-gray-500 border-t">
          © 2025 GUST Alumni
        </footer>
      </body>
    </html>
  );
}
