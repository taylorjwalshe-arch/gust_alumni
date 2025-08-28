"use client";

import { people } from "@/data/people";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function DirectoryPage() {
  return (
    <main className="space-y-6">
      <h1 className="text-2xl font-bold">Team Directory</h1>

      {/* Filter bar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Label htmlFor="search">Search</Label>
          <Input id="search" placeholder="Search by name..." />
        </div>
        <div className="flex-1">
          <Label htmlFor="role">Role</Label>
          <Select>
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
          <Input id="industry" placeholder="e.g. Tech, Finance..." />
        </div>
      </div>

      {/* List */}
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {people.map((p) => (
          <li key={p.id} className="border rounded-xl p-4">
            <div className="font-semibold">
              {p.firstName} {p.lastName}
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
    </main>
  );
}
