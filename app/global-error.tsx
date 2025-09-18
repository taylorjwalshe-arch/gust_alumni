"use client";
import Link from "next/link";

export default function GlobalError(props: { error: Error & { digest?: string }; reset: () => void }) {
  const { error, reset } = props;

  return (
    <html>
      <body>
        <div className="mx-auto max-w-5xl p-6">
          <h1 className="text-xl font-semibold">App crashed</h1>
          <p className="text-sm text-gray-600 mt-2">An unrecoverable error occurred.</p>
          <pre className="mt-3 rounded-lg bg-gray-100 p-3 text-xs text-gray-800 overflow-x-auto">
            {error?.message ?? "Unknown error"}
          </pre>
          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={() => reset()}
              className="rounded-full bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Try again
            </button>
            <Link href="/" className="text-blue-600 underline underline-offset-2 hover:text-blue-700">
              Go home
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
