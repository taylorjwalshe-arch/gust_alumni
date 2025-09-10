import type { ReactNode } from "react";
import PostJobOverlay from "@/components/auth/PostJobOverlay";

export default function JobsLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <PostJobOverlay />
    </>
  );
}
