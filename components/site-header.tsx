import Link from "next/link";

const links = [
  { href: "/", label: "Home" },
  { href: "/directory", label: "Directory" },
  { href: "/profile", label: "My Profile" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur">
      <nav className="mx-auto max-w-6xl px-4 py-3 flex gap-4">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className="text-sm font-medium hover:underline">
            {l.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
