import type { ReactNode } from "react";
import { Suspense } from "react";
import ClaimBanner from "@/components/profile/ClaimBanner";

export default function ProfileLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <Suspense fallback={null}>
        <ClaimBanner />
      </Suspense>
    </>
  );
}
