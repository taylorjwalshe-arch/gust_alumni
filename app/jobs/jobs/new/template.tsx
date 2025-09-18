"use client";

import { Suspense, type ReactNode } from "react";

export default function JobsNewTemplate({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="p-4 text-sm text-gray-600" role="status" aria-label="Loading job form">
          Loading job form…
        </div>
      }
    >
      {children}
    </Suspense>
  );
}
