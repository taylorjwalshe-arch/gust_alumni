"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { people as seed } from "@/data/people";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Role = "all" | "alumni" | "student";

export default function DirectoryPage() {
  const [q, setQ] = useState("");
  const [role, setRole] = useState<Role>("all");
  const [industry, setIndustry] = useState("");

  const people = useMemo(() => {
    const qn = q.trim().toLowerCase();
    const ind = industry.trim().toLowerCase();

    return seed.filter((p) => {
      const name = `${p.firstName} ${p.lastName}`.toLowerCase();
      const matchesName = qn ? name.includes(qn) : true;
      const matchesRole = role === "all" ? true : p.role === role;
      const matchesIndustry = ind
        ? (p.industry ?? "").toLowerCase().includes(ind)
        : true;
      return matchesName && matchesRole && matchesIndustry;
    });
  }, [q, role, industry]);

  return (
    <main className="space-y-6">
      <h1 className="text-2xl font-bold">Team Directory</h1>

      {/* Filter bar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Label htmlFor="search">Search</Label>
          <Input
            id="search"
            placeholder="Search by name..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        <div className="flex-1">
          <Label htmlFor="role">Role</Label>
          <Select value={role} onValueChange={(v) => setRole(v as Role)}>
            <SelectTrigger>
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="alumni">Alumni</SelectItem>
              <SelectItem value="student">Student</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1">
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
          {people.map((p) => (
            <li key={p.id} className="border rounded-xl p-4">
              <div className="font-semibold">
                <Link
                  href={`/profile/${p.id}`}
                  className="text-blue-600 underline"
                >
                  {p.firstName} {p.lastName}
                </Link>
              </div>
              <div className="text-sm text-muted-foreground">
                {p.role.toUpperCase()} · {p.gradYear ?? "—"}
              </div>
              <div className="text-sm">
                {p.industry ?? "—"} @ {p.company ?? "—"}
              </div>
              <div className="text-sm">{p.location ?? "—"}</div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
