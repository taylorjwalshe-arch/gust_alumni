import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Email from "next-auth/providers/email";

function parseAdminEmails(src: string | undefined): Set<string> {
  if (!src) return new Set();
  return new Set(
    src
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter((s) => s.length > 0)
  );
}

const adminEmails = parseAdminEmails(process.env.ADMIN_EMAILS);

const providers = [];
if (process.env.GITHUB_ID && process.env.GITHUB_SECRET) {
  providers.push(
    GitHub({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    })
  );
}
if (process.env.EMAIL_SERVER && process.env.EMAIL_FROM) {
  providers.push(
    Email({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM,
    })
  );
}
if (providers.length === 0) {
  providers.push(
    GitHub({
      clientId: "placeholder",
      clientSecret: "placeholder",
    })
  );
}

const handler = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  providers,
  callbacks: {
    async jwt({ token, user }) {
      let role: string | null = typeof token.role === "string" ? token.role : null;
      const email =
        (user && typeof (user as { email?: unknown }).email === "string")
          ? String((user as { email?: unknown }).email).toLowerCase()
          : typeof token.email === "string"
          ? token.email.toLowerCase()
          : null;

      if (!role) {
        if (email && adminEmails.has(email)) role = "admin";
        else role = "alum";
      }
      (token as Record<string, unknown>).role = role;
      return token;
    },
    async session({ session, token }) {
      if (session && typeof session === "object") {
        const s = session as { user?: { role?: string | null } | null };
        s.user = {
          ...(s.user ?? {}),
          role: typeof (token as Record<string, unknown>).role === "string"
            ? ((token as Record<string, unknown>).role as string)
            : "alum",
        };
      }
      return session;
    },
  },
});

export { handler as GET, handler as POST };
