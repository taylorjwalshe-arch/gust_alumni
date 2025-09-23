export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white text-black">
      <main className="mx-auto max-w-4xl p-6">{children}</main>
    </div>
  );
}
