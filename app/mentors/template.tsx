"use client";

import { Suspense, type ReactNode } from "react";

export default function MentorsTemplate({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="p-6 space-y-4" role="status" aria-label="Loading mentors">
          <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
          <div className="h-24 w-full bg-gray-100 rounded animate-pulse" />
          <div className="h-64 w-full bg-gray-100 rounded animate-pulse" />
        </div>
      }
    >
      {children}
    </Suspense>
  );
}
