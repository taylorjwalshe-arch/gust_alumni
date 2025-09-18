import { PrismaClient, Prisma } from "@prisma/client";
const prisma = new PrismaClient();

function getPersonModel() {
  const m = Prisma.dmmf.datamodel.models.find(
    (x) => x.name === "Person" || x.name.toLowerCase() === "person",
  );
  if (!m) throw new Error("Person model not found in Prisma DMMF");
  return m;
}

function enumFirstValue(enumName) {
  const en = Prisma.dmmf.datamodel.enums.find((e) => e.name === enumName);
  return en && en.values.length > 0 ? en.values[0].name : "Member";
}

function placeholderFor(field, idx) {
  if (field.isList) return []; // arrays default to empty
  if (field.kind === "enum") return enumFirstValue(field.type);
  switch (field.type) {
    case "String":
      return field.name === "role" ? "Member" : `${field.name}-demo-${idx}`;
    case "Int":
    case "BigInt":
      return 0;
    case "Float":
    case "Decimal":
      return 0;
    case "Boolean":
      return false;
    case "DateTime":
      return new Date().toISOString();
    case "Json":
      return {};
    default:
      return null;
  }
}

// keep only fields that actually exist; fill required ones with placeholders
function sanitizeBase(base, idx) {
  const model = getPersonModel();
  const allowed = new Set(model.fields.map((f) => f.name));
  const out = {};
  for (const k of Object.keys(base)) {
    if (allowed.has(k)) out[k] = base[k];
  }
  for (const f of model.fields) {
    const isId = !!f.isId;
    const hasDefault = !!f.hasDefaultValue;
    const isRequired = !!f.isRequired;
    if (isId || hasDefault || !isRequired) continue;
    if (out[f.name] === undefined || out[f.name] === null) {
      out[f.name] = placeholderFor(f, idx);
    }
  }
  return out;
}

async function createManySafe(records) {
  try {
    // No skipDuplicates — your client rejects it
    await prisma.person.createMany({ data: records });
    return true;
  } catch (e) {
    console.warn("createMany failed, falling back to per-row create:", e.message || e);
    for (const r of records) {
      try {
        await prisma.person.create({ data: r });
      } catch (err) {
        console.warn("create failed for one row:", err.message || err);
      }
    }
    return true;
  }
}

async function main() {
  const existing = await prisma.person.count();
  if (existing > 0) {
    console.log("Person already has", existing, "rows; skipping.");
    return;
  }

  const base = [
    {
      firstName: "Ada",
      lastName: "Lovelace",
      industries: ["Computing", "Mathematics"],
      location: "London",
      role: "Member",
    },
    {
      firstName: "Grace",
      lastName: "Hopper",
      industries: ["Computing", "Navy"],
      location: "Arlington, VA",
      role: "Member",
    },
    {
      firstName: "Alan",
      lastName: "Turing",
      industries: ["Research", "Computing"],
      location: "Wilmslow, UK",
      role: "Member",
    },
  ];

  const records = base.map((b, i) => sanitizeBase(b, i));

  await createManySafe(records);

  const total = await prisma.person.count();
  console.log("Total people now:", total);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
