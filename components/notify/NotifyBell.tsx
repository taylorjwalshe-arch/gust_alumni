"use client";
import { useState } from "react";
import { useNotifications } from "./NotificationsProvider";

export default function NotifyBell() {
  const { list } = useNotifications();
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2"
        aria-label="Notifications"
      >
        🔔
        {list.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full px-1 text-xs">
            {list.length}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-white border shadow-lg rounded p-2 text-sm z-50">
          {list.length === 0 ? (
            <div className="text-gray-500">No notifications</div>
          ) : (
            <ul className="space-y-1">
              {list.map((n) => (
                <li key={n.id} className="border-b last:border-0 py-1">
                  {n.message}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
