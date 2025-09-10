import CopyButton from "@/components/admin/CopyButton";

async function fetchJSON<T>(url: string): Promise<T> {
  try {
    const res = await fetch(url, { cache: "no-store" });
    const json = (await res.json()) as unknown as T;
    return json;
  } catch {
    return {} as T;
  }
}

type Row = { id: string; jobId: string; message: string; ts: string };
type Data = { items?: Row[]; total?: number; page?: number; pageSize?: number; reason?: string };

export default async function AdminContactsPage({ searchParams }: { searchParams?: Promise<Record<string, string>> }) {
  const sp = (await searchParams) || {};
  const page = Number(sp.page || "1");
  const qs = new URLSearchParams(
    Object.fromEntries(Object.entries(sp).map(([k, v]) => [k, String(v)]))
  );
  const data = await fetchJSON<Data>(`/api/admin/contacts?${qs.toString()}`);

  const unauthorized = data.reason === "unauthorized";
  const items = Array.isArray(data.items) ? data.items : [];
  const total = typeof data.total === "number" ? data.total : 0;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Anonymous Contacts</h1>
      {unauthorized ? (
        <div className="rounded-xl bg-amber-100 text-amber-900 px-4 py-2">
          Admin only. Sign in with an admin account.
        </div>
      ) : (
        <>
          <div className="text-sm text-gray-600">Total: {total}</div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-2 border-b">Time</th>
                  <th className="text-left p-2 border-b">Job ID</th>
                  <th className="text-left p-2 border-b">Message</th>
                  <th className="text-left p-2 border-b">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td className="p-2 border-b text-gray-500" colSpan={4}>
                      No contacts yet.
                    </td>
                  </tr>
                ) : (
                  items.map((r) => (
                    <tr key={`${r.ts}-${r.id}`} className="align-top">
                      <td className="p-2 border-b whitespace-nowrap">{new Date(r.ts).toLocaleString()}</td>
                      <td className="p-2 border-b">
                        <code className="bg-gray-100 rounded px-1">{r.jobId}</code>
                      </td>
                      <td className="p-2 border-b">
                        <div className="max-w-xl break-words whitespace-pre-wrap">{r.message}</div>
                      </td>
                      <td className="p-2 border-b">
                        <CopyButton text={r.message} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`?${new URLSearchParams({ ...Object.fromEntries(qs), page: String(Math.max(1, page - 1)) }).toString()}`}
              className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-50 text-sm"
            >
              Prev
            </a>
            <span className="text-sm text-gray-600">Page {page}</span>
            <a
              href={`?${new URLSearchParams({ ...Object.fromEntries(qs), page: String(page + 1) }).toString()}`}
              className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-50 text-sm"
            >
              Next
            </a>
          </div>
        </>
      )}
    </div>
  );
}
