import "../globals.css";
import type { ReactNode } from "react";
import Header from "@/components/layout/Header";
import NotificationsProvider from "@/components/notify/NotificationsProvider";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <NotificationsProvider>
          <Header />
          <main>{children}</main>
        </NotificationsProvider>
      </body>
    </html>
  );
}
