"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AppNav() {
  const pathname = usePathname();
  const tabs = [
    { href: "/", label: "Home" },
    { href: "/directory", label: "Directory" },
    { href: "/jobs", label: "Jobs" },
    { href: "/mentors", label: "Mentors" },
    { href: "/feed", label: "Feed" },
    { href: "/profile", label: "My Profile" },
  ];
  return (
    <nav className="mx-auto max-w-5xl flex flex-wrap items-center gap-4 p-4">
      {tabs.map((t) => {
        const active = pathname === t.href || (t.href !== "/" && pathname.startsWith(t.href));
        return (
          <Link
            key={t.href}
            href={t.href}
            className={active ? "font-semibold text-blue-600" : "text-gray-700 hover:text-blue-600"}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
