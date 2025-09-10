"use client";

import { useNotify } from "./NotificationsProvider";
import { useState } from "react";

export default function NotifyBell() {
  const { count, items, clear } = useNotify();
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-4 left-4 z-40">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative rounded-full bg-white border border-gray-300 shadow px-3 py-2"
        aria-label="Notifications"
      >
        🔔
        {count > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full px-1">
            {count}
          </span>
        )}
      </button>
      {open && (
        <div className="mt-2 w-72 max-h-80 overflow-auto rounded-2xl border bg-white shadow">
          <div className="flex items-center justify-between p-2 border-b">
            <div className="font-semibold text-sm">Notifications</div>
            <button onClick={clear} className="text-xs text-blue-600">Clear</button>
          </div>
          <ul className="divide-y">
            {items.length === 0 ? (
              <li className="p-3 text-sm text-gray-500">No notifications</li>
            ) : (
              items.map((n) => (
                <li key={n.id} className="p-3 text-sm">
                  <div>{n.text}</div>
                  <div className="text-xs text-gray-500">{new Date(n.ts).toLocaleString()}</div>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
