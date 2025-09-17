"use client";
import { useEffect } from "react";
import Link from "next/link";

export default function Error(props: { error: Error & { digest?: string }; reset: () => void }) {
  const { error, reset } = props;
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-5xl p-6">
      <h1 className="text-xl font-semibold">Something went wrong</h1>
      <p className="text-sm text-gray-600 mt-2">An unexpected error occurred.</p>
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
  );
}
