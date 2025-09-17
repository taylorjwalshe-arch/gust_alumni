import type { ReactNode } from "react";
import { Suspense } from "react";
import PostJobOverlay from "@/components/auth/PostJobOverlay";
import TeamFilter from "@/components/teams/TeamFilter";

export default function JobsLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <PostJobOverlay />
      <Suspense fallback={null}>
        <TeamFilter />
      </Suspense>
    </>
  );
}
