import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import OfferHelpButton from "@/components/jobs/OfferHelpButton";

type Job = {
  id: string;
  title: string | null;
  company: string | null;
  location: string | null;
  isRequest: boolean;
};

function camelize(modelName: string): string {
  return modelName.charAt(0).toLowerCase() + modelName.slice(1);
}
function getModel() {
  const models = Prisma.dmmf.datamodel.models;
  const map = new Map(models.map((m) => [m.name.toLowerCase(), m]));
  for (const key of ["job", "jobs", "posting", "post", "opportunity"]) {
    const m = map.get(key);
    if (m) return m;
  }
  return null;
}
function getDelegate(modelName: string) {
  const key = camelize(modelName);
  return (prisma as unknown as Record<string, unknown>)[key] as unknown;
}
function has(d: unknown, k: string): boolean {
  return !!(d && typeof d === "object" && k in (d as object));
}

export default async function JobDetailPage(props: { params: Promise<Record<string, string>> }) {
  const p = await props.params;
  const idParam = p?.id ?? "";
  const meta = getModel();
  if (!meta || !idParam) notFound();

  const d = getDelegate(meta.name) as { findUnique?: (args: unknown) => Promise<unknown> };
  let job: Job | null = null;
  try {
    if (has(d, "findUnique")) {
      const row = await (d.findUnique as (a: unknown) => Promise<unknown>)({
        where: { id: isNaN(Number(idParam)) ? idParam : Number(idParam) },
        select: { id: true, title: true, company: true, location: true, isRequest: true },
      });
      if (row && typeof row === "object") {
        job = {
          id: String((row as Record<string, unknown>).id),
          title: (row as Record<string, unknown>).title as string | null,
          company: (row as Record<string, unknown>).company as string | null,
          location: (row as Record<string, unknown>).location as string | null,
          isRequest: !!(row as Record<string, unknown>).isRequest,
        };
      }
    }
  } catch {}

  if (!job) notFound();

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">{job.title}</h1>
      <p className="text-gray-700">{job.company || "Anonymous request"}</p>
      <p className="text-gray-500">{job.location}</p>
      {job.isRequest && <OfferHelpButton jobId={job.id} />}
    </div>
  );
}
