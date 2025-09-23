import AppShell from "../components/AppShell";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white text-black">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}

export const dynamic = "force-dynamic";
