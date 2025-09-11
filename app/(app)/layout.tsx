import "../globals.css";
import type { ReactNode } from "react";
import { Suspense } from "react";
import Header from "@/components/layout/Header";
import NotificationsProvider from "@/components/notify/NotificationsProvider";
import SessionProviderClient from "@/components/auth/SessionProviderClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SessionProviderClient>
          <NotificationsProvider>
            <Header />
            <Suspense fallback={null}>
              <main>{children}</main>
            </Suspense>
          </NotificationsProvider>
        </SessionProviderClient>
      </body>
    </html>
  );
}
