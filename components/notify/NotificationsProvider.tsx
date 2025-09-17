"use client";
import { createContext, useContext, useState, ReactNode } from "react";

type Notification = { id: number; message: string };
type Ctx = { notify: (msg: string) => void; list: Notification[] };

const NotificationsContext = createContext<Ctx | null>(null);

let nextId = 1;

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [list, setList] = useState<Notification[]>([]);
  const notify = (msg: string) => {
    setList((prev) => [...prev, { id: nextId++, message: msg }]);
  };
  return (
    <NotificationsContext.Provider value={{ notify, list }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationsProvider");
  return ctx;
}
