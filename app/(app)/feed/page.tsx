import Link from "next/link";
import { Suspense } from "react";
import NewSocialForm from "@/components/social/NewSocialForm";

type FeedItem = {
  kind: "Job" | "Directory" | "Mentor" | "Social";
  id: string;
  title: string | null;
  postedAt: string;
  body?: string | null;
};

async function fetchJSON<T>(url: string): Promise<T> {
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error("bad");
    const json = (await res.json()) as unknown as T;
    return json;
  } catch {
    return {} as T;
  }
}

export default async function FeedPage() {
  const params = new URLSearchParams();
  const base = params.toString() ? `?${params.toString()}` : "";
  const [main, social] = await Promise.all([
    fetchJSON<{ items?: { type?: string; id?: string | number; title?: string | null; postedAt?: string }[] }>(
      `/api/feed${base}`
    ),
    fetchJSON<{ items?: { id?: string | number; type?: string; title?: string | null; body?: string | null; postedAt?: string }[] }>(
      `/api/social${base}`
    ),
  ]);

  const list: FeedItem[] = [
    ...((main.items || []).map((it) => ({
      kind: (it.type === "Job" || it.type === "Directory" || it.type === "Mentor") ? (it.type as "Job" | "Directory" | "Mentor") : "Job",
      id: typeof it.id === "string" ? it.id : String(it.id ?? ""),
      title: typeof it.title === "string" ? it.title : null,
      postedAt: typeof it.postedAt === "string" ? it.postedAt : new Date().toISOString(),
    })) as FeedItem[]),
    ...((social.items || []).map((it) => ({
      kind: "Social" as const,
      id: typeof it.id === "string" ? it.id : String(it.id ?? ""),
      title: typeof it.title === "string" ? it.title : null,
      body: typeof it.body === "string" ? it.body : null,
      postedAt: typeof it.postedAt === "string" ? it.postedAt : new Date().toISOString(),
    })) as FeedItem[]),
  ].filter((x) => x.id !== "");

  list.sort((a, b) => (a.postedAt < b.postedAt ? 1 : a.postedAt > b.postedAt ? -1 : 0));

  return (
    <div className="p-6 space-y-6">
      <Suspense fallback={null}>
        <NewSocialForm />
      </Suspense>

      <h1 className="text-2xl font-bold">Feed</h1>
      <ul className="space-y-3">
        {list.map((item) => (
          <li key={`${item.kind}-${item.id}`} className="border rounded-xl p-4 flex items-start gap-3">
            <span
              className={
                item.kind === "Job"
                  ? "text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800"
                  : item.kind === "Directory"
                  ? "text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-800"
                  : item.kind === "Mentor"
                  ? "text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-800"
                  : "text-xs px-2 py-1 rounded-full bg-rose-100 text-rose-800"
              }
            >
              {item.kind}
            </span>
            <div className="flex-1">
              <div className="font-medium">{item.title || "(no title)"}</div>
              {item.kind === "Job" && (
                <Link href={`/jobs/${item.id}`} className="text-blue-600 hover:underline text-sm">
                  View job
                </Link>
              )}
              {item.kind === "Directory" && (
                <Link href={`/directory/${item.id}`} className="text-blue-600 hover:underline text-sm">
                  View profile
                </Link>
              )}
              {item.kind === "Mentor" && (
                <Link href={`/mentors/${item.id}`} className="text-blue-600 hover:underline text-sm">
                  View mentor
                </Link>
              )}
              {item.kind === "Social" && item.body && (
                <p className="text-sm text-gray-600 mt-1">{item.body}</p>
              )}
              <div className="text-xs text-gray-500 mt-1">{new Date(item.postedAt).toLocaleString()}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
