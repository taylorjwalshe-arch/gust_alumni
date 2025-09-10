import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();
const CANDIDATES = ["job", "jobs", "posting", "post", "opportunity"];

function findModelAndFields() {
  const models = Prisma.dmmf.datamodel.models;
  const nameMap = new Map(models.map((m) => [m.name.toLowerCase(), m]));
  for (const n of CANDIDATES) {
    const m = nameMap.get(n);
    if (m) {
      const fields = new Set(m.fields.map((f) => f.name));
      return { modelName: m.name, fields };
    }
  }
  return null;
}

function pick(obj, fields) {
  const out = {};
  for (const k of Object.keys(obj)) {
    if (fields.has(k)) out[k] = obj[k];
  }
  return out;
}

function sampleRows() {
  const base = [
    { title: "Software Engineer", company: "Google", location: "NYC, NY", isRequest: false, postedAt: new Date(Date.now() - 1 * 864e5) },
    { title: "Analyst", company: "Goldman Sachs", location: "New York, NY", isRequest: false, postedAt: new Date(Date.now() - 2 * 864e5) },
    { title: "Product Manager", company: "Meta", location: "Seattle, WA", isRequest: false, postedAt: new Date(Date.now() - 3 * 864e5) },
    { title: "Sales Associate", company: "Oracle", location: "Austin, TX", isRequest: false, postedAt: new Date(Date.now() - 4 * 864e5) },
    { title: "Internship Request", company: null, location: "Boston, MA", isRequest: true, postedAt: new Date(Date.now() - 5 * 864e5) },
    { title: "Tech Sales Request", company: null, location: "Remote", isRequest: true, postedAt: new Date(Date.now() - 6 * 864e5) },
    { title: "Data Scientist", company: "Snowflake", location: "San Mateo, CA", isRequest: false, postedAt: new Date(Date.now() - 7 * 864e5) },
    { title: "Operations Lead", company: "Stripe", location: "Chicago, IL", isRequest: false, postedAt: new Date(Date.now() - 8 * 864e5) },
    { title: "Consulting Request", company: null, location: "Remote", isRequest: true, postedAt: new Date(Date.now() - 9 * 864e5) },
    { title: "Design Intern", company: "Figma", location: "SF, CA", isRequest: false, postedAt: new Date(Date.now() - 10 * 864e5) }
  ];
  return base;
}

async function main() {
  const meta = findModelAndFields();
  if (!meta) {
    console.log("No compatible jobs model found. Nothing seeded.");
    return;
  }
  const delegate = prisma[meta.modelName.charAt(0).toLowerCase() + meta.modelName.slice(1)];
  const rows = sampleRows().map((r) => pick(r, meta.fields));

  try {
    const res = await delegate.createMany({ data: rows });
    console.log(`Seeded jobs via createMany: ${res.count}`);
  } catch {
    let count = 0;
    for (const r of rows) {
      try {
        await delegate.create({ data: r });
        count++;
      } catch {}
    }
    console.log(`Seeded jobs via per-row create: ${count}`);
  }
}

main()
  .catch(() => {})
  .finally(async () => {
    await prisma.$disconnect();
  });
