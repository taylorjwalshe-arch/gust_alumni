import type { ReactNode } from "react";
import NotificationsProvider from "@/components/notify/NotificationsProvider";
import NotifyBell from "@/components/notify/NotifyBell";

export default function AppGroupLayout({ children }: { children: ReactNode }) {
  return (
    <NotificationsProvider>
      {children}
      <NotifyBell />
    </NotificationsProvider>
  );
}
