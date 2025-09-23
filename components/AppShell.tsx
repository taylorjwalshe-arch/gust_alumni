import Link from "next/link";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header / Nav */}
      <header className="bg-gray-100 border-b p-4">
        <nav className="flex gap-6">
          <Link href="/">Home</Link>
          <Link href="/directory">Directory</Link>
          <Link href="/jobs">Jobs</Link>
          <Link href="/mentors">Mentors</Link>
          <Link href="/feed">Feed</Link>
          <Link href="/profile">My Profile</Link>
        </nav>
      </header>

      {/* Page Content */}
      <main className="flex-1 p-6">{children}</main>

      {/* Footer */}
      <footer className="bg-gray-100 border-t p-4 text-center text-sm">
        © 2025 GUST Alumni
      </footer>
    </div>
  );
}
