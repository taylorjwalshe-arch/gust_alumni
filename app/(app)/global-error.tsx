"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // eslint-disable-next-line no-console
  console.error("Global error:", error);

  return (
    <html>
      <body>
        <div className="p-6 max-w-2xl mx-auto">
          <h1 className="text-xl font-bold mb-2">Application error</h1>
          <p className="text-sm text-gray-700 mb-4">
            A client-side exception occurred while loading this app.
          </p>
          <button
            onClick={() => reset()}
            className="px-4 py-2 rounded bg-blue-600 text-white"
          >
            Reload
          </button>
        </div>
      </body>
    </html>
  );
}
