export const metadata = {
  title: "GUST Alumni",
  description: "Alumni <> Students directory, jobs, mentors.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-dvh bg-white text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}
