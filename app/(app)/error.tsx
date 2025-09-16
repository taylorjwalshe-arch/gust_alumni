"use client";

import { useEffect } from "react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface details in the browser console and Vercel logs
    // eslint-disable-next-line no-console
    console.error("App route error:", error);
  }, [error]);

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-xl font-bold mb-2">Something went wrong</h1>
      <p className="text-sm text-gray-700 mb-4">
        A client-side exception occurred. Try reloading this page. If the issue persists, return to Home.
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => reset()}
          className="px-4 py-2 rounded bg-blue-600 text-white"
        >
          Try again
        </button>
        <a href="/" className="px-4 py-2 rounded border">Go Home</a>
      </div>
    </div>
  );
}
