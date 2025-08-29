"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/directory", label: "Directory" },
  { href: "/jobs", label: "Jobs" },
  { href: "/mentors", label: "Mentors" },
  { href: "/feed", label: "Feed" },
  { href: "/profile", label: "My Profile" },
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur">
      <nav className="mx-auto max-w-6xl px-4 py-3 flex gap-6">
        {links.map((l) => {
          const isActive =
            l.href === "/"
              ? pathname === "/"
              : pathname.startsWith(l.href);

          return (
            <Link
              key={l.href}
              href={l.href}
              className={`text-sm font-medium hover:underline ${
                isActive ? "text-blue-600 underline" : "text-foreground"
              }`}
            >
              {l.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
