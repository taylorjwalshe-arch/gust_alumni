import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();
const CANDIDATES = ["job", "jobs", "posting", "post", "opportunity"];
const PERSON_CANDIDATES = ["person", "people", "alumni", "user", "member"];

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

function findPersonDelegate() {
  const models = Prisma.dmmf.datamodel.models;
  const nameMap = new Map(models.map((m) => [m.name.toLowerCase(), m]));
  for (const n of PERSON_CANDIDATES) {
    const m = nameMap.get(n);
    if (m) {
      const key = m.name.charAt(0).toLowerCase() + m.name.slice(1);
      const d = prisma[key];
      if (d && typeof d.findMany === "function") return { modelName: m.name, delegate: d };
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
  return [
    {
      title: "Software Engineer",
      company: "Google",
      location: "NYC, NY",
      isRequest: false,
      postedAt: new Date(Date.now() - 1 * 864e5),
    },
    {
      title: "Analyst",
      company: "Goldman Sachs",
      location: "New York, NY",
      isRequest: false,
      postedAt: new Date(Date.now() - 2 * 864e5),
    },
    {
      title: "Product Manager",
      company: "Meta",
      location: "Seattle, WA",
      isRequest: false,
      postedAt: new Date(Date.now() - 3 * 864e5),
    },
    {
      title: "Sales Associate",
      company: "Oracle",
      location: "Austin, TX",
      isRequest: false,
      postedAt: new Date(Date.now() - 4 * 864e5),
    },
    {
      title: "Internship Request",
      company: null,
      location: "Boston, MA",
      isRequest: true,
      postedAt: new Date(Date.now() - 5 * 864e5),
    },
    {
      title: "Tech Sales Request",
      company: null,
      location: "Remote",
      isRequest: true,
      postedAt: new Date(Date.now() - 6 * 864e5),
    },
    {
      title: "Data Scientist",
      company: "Snowflake",
      location: "San Mateo, CA",
      isRequest: false,
      postedAt: new Date(Date.now() - 7 * 864e5),
    },
    {
      title: "Operations Lead",
      company: "Stripe",
      location: "Chicago, IL",
      isRequest: false,
      postedAt: new Date(Date.now() - 8 * 864e5),
    },
    {
      title: "Consulting Request",
      company: null,
      location: "Remote",
      isRequest: true,
      postedAt: new Date(Date.now() - 9 * 864e5),
    },
    {
      title: "Design Intern",
      company: "Figma",
      location: "SF, CA",
      isRequest: false,
      postedAt: new Date(Date.now() - 10 * 864e5),
    },
  ];
}

async function main() {
  const meta = findModelAndFields();
  if (!meta) {
    console.log("No compatible jobs model found. Nothing seeded.");
    return;
  }
  const jobKey = meta.modelName.charAt(0).toLowerCase() + meta.modelName.slice(1);
  const job = prisma[jobKey];

  let personIds = [];
  const person = findPersonDelegate();
  if (person) {
    try {
      const rows = await person.delegate.findMany({ take: 5, select: { id: true } });
      personIds = (rows ?? []).map((r) => String(r.id)).filter(Boolean);
    } catch {}
  }

  const rows = sampleRows().map((r, i) => {
    const base = pick(r, meta.fields);
    if (meta.fields.has("posterId") && personIds.length) {
      base.posterId = personIds[i % personIds.length];
    }
    return base;
  });

  try {
    const res = await job.createMany({ data: rows });
    console.log(`Seeded jobs via createMany: ${res.count}`);
  } catch {
    let count = 0;
    for (const r of rows) {
      try {
        await job.create({ data: r });
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
