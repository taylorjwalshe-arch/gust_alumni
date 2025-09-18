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
    { href: "/profile", label: "My Profile" }
  ];

  return (
    <nav className="flex gap-4 border-b p-4 text-sm">
      {tabs.map((tab) => {
        const active = pathname === tab.href || (tab.href !== "/" && pathname.startsWith(tab.href));
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={active ? "font-semibold text-blue-600" : "text-gray-600 hover:text-blue-600"}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
