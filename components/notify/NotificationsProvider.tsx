"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type Note = { id: string; text: string; ts: number };

type Ctx = {
  notify: (text: string) => void;
  count: number;
  items: Note[];
  clear: () => void;
};

const NotificationsCtx = createContext<Ctx | null>(null);

export function useNotify() {
  const c = useContext(NotificationsCtx);
  return c ?? { notify: (_: string) => {}, count: 0, items: [], clear: () => {} };
}

export default function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Note[]>([]);

  const notify = useCallback((text: string) => {
    const n: Note = { id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, text, ts: Date.now() };
    setItems((prev) => [n, ...prev].slice(0, 20));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  useEffect(() => {
    function onEvt(e: Event) {
      const detail = (e as CustomEvent).detail as { text?: string } | undefined;
      if (detail && typeof detail.text === "string") notify(detail.text);
    }
    window.addEventListener("gust:notify", onEvt as EventListener);
    return () => window.removeEventListener("gust:notify", onEvt as EventListener);
  }, [notify]);

  const value = useMemo<Ctx>(() => ({ notify, count: items.length, items, clear }), [notify, items, clear]);

  return <NotificationsCtx.Provider value={value}>{children}</NotificationsCtx.Provider>;
}
