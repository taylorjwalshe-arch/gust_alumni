"use client";
import { useNotifications } from "@/components/notify/NotificationsProvider";

export default function OfferHelpButton({ label = "Offer Help" }: { label?: string }) {
  const { notify } = useNotifications();

  const handleClick = () => {
    notify("Thanks for offering to help!");
  };

  return (
    <button
      onClick={handleClick}
      className="text-sm px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 transition"
    >
      {label}
    </button>
  );
}
