import type { ReactNode } from "react";
import TeamTabs from "@/components/teams/TeamTabs";

export default function TeamLayout({ children }: { children: ReactNode }) {
  return (
    <div className="p-6">
      <TeamTabs />
      {children}
    </div>
  );
}
