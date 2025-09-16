import type { ReactNode } from "react";
import Link from "next/link";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-gray-900">
        <header className="border-b">
          <nav className="mx-auto max-w-5xl flex items-center gap-6 p-4">
            <Link href="/" className="font-semibold">Home</Link>
            <Link href="/directory">Directory</Link>
            <Link href="/jobs">Jobs</Link>
            <Link href="/mentors">Mentors</Link>
            <Link href="/feed">Feed</Link>
            <Link href="/profile">My Profile</Link>
          </nav>
        </header>
        <main className="mx-auto max-w-5xl p-6">{children}</main>
        <footer className="mx-auto max-w-5xl p-6 text-center text-sm text-gray-500 border-t">
          © 2025 GUST Alumni MVP
        </footer>
      </body>
    </html>
  );
}
