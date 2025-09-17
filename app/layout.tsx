import type { ReactNode } from "react";
import "./globals.css";
import { Suspense } from "react";
import AppNav from "@/components/layout/AppNav";
import { NotificationsProvider } from "@/components/notify/NotificationsProvider";
import NotifyBell from "@/components/notify/NotifyBell";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <NotificationsProvider>
          <header className="border-b">
            <div className="mx-auto max-w-5xl flex items-center justify-between p-4">
              <Suspense fallback={null}>
                <AppNav />
              </Suspense>
              <NotifyBell />
            </div>
          </header>
          <main className="mx-auto max-w-5xl p-6">{children}</main>
          <footer className="mx-auto max-w-5xl p-6 text-center text-sm text-gray-500 border-t">
            © 2025 GUST Alumni MVP
          </footer>
        </NotificationsProvider>
      </body>
    </html>
  );
}
