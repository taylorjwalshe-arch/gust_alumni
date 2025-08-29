"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Person } from "@prisma/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Helper: normalize industries JSON into string[]
function toStringArray(x: unknown): string[] {
  if (Array.isArray(x)) return x.map((v) => String(v));
  if (typeof x === "string") {
    return x
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

type Role = "all" | "alumni" | "student";

export default function DirectoryClient({ initialPeople }: { initialPeople: Person[] }) {
  const [query, setQuery] = useState("");
  const [role, setRole] = useState<Role>("all");
  const [industry, setIndustry] = useState("");

  const people = useMemo(() => {
    const qn = query.trim().toLowerCase();
    const ind = industry.trim().toLowerCase();

    return initialPeople.filter((p) => {
      const name = `${p.firstName} ${p.lastName}`.toLowerCase();

      const matchesName = qn ? name.includes(qn) : true;
      const matchesRole = role === "all" ? true : p.role === role;

      const inds = toStringArray(p.industries);
      const indsJoined = inds.join(", ").toLowerCase();
      const matchesIndustry = ind ? indsJoined.includes(ind) : true;

      return matchesName && matchesRole && matchesIndustry;
    });
  }, [query, role, industry, initialPeople]);

  return (
    <main className="space-y-6 p-10 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold">Team Directory</h1>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="search">Search</Label>
          <Input
            id="search"
            placeholder="Search by name..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="role">Role</Label>
          <Select value={role} onValueChange={(v) => setRole(v as Role)}>
            <SelectTrigger id="role">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="alumni">Alumni</SelectItem>
              <SelectItem value="student">Student</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="industry">Industry</Label>
          <Input
            id="industry"
            placeholder="e.g. Tech, Finance..."
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
          />
        </div>
      </div>

      {/* Results header */}
      <div className="text-sm text-muted-foreground">
        Showing {people.length} result{people.length === 1 ? "" : "s"}
      </div>

      {/* List */}
      {people.length === 0 ? (
        <div className="text-sm text-muted-foreground border rounded-xl p-6">
          No matches. Try clearing filters.
        </div>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {people.map((p) => {
            const inds = toStringArray(p.industries);
            const indsDisplay = inds.length ? inds.join(", ") : "—";
            const companyDisplay = p.company ?? "—";
            const locationDisplay = p.location ?? "—";
            const grad = p.gradYear ?? "—";

            return (
              <li key={p.id}>
                <Link
                  href={`/profile/${p.id}`}
                  className="block border rounded-xl p-4 transition hover:shadow-sm hover:bg-muted/40 active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                  aria-label={`View profile for ${p.firstName} ${p.lastName}`}
                >
                  <div className="font-semibold">
                    {p.firstName} {p.lastName}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {p.role.toUpperCase()} · {grad}
                  </div>
                  <div className="text-sm">
                    {indsDisplay} @ {companyDisplay}
                  </div>
                  <div className="text-sm">{locationDisplay}</div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
