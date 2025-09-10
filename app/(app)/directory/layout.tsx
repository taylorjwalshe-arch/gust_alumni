import type { ReactNode } from "react";
import { Suspense } from "react";
import TeamFilter from "@/components/teams/TeamFilter";

export default function DirectoryLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <Suspense fallback={null}>
        <TeamFilter />
      </Suspense>
    </>
  );
}
