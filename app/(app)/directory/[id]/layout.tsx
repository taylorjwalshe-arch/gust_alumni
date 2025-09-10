import type { ReactNode } from "react";
import { Suspense } from "react";
import ClaimProfileButton from "@/components/profile/ClaimProfileButton";

export default function DirectoryIdLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <Suspense fallback={null}>
        <ClaimProfileButton />
      </Suspense>
    </>
  );
}
