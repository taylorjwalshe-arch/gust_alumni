import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function createVariant(data) {
  try {
    await prisma.person.createMany({ data, skipDuplicates: true });
    return true;
  } catch (e) {
    return false;
  }
}

async function main() {
  const existing = await prisma.person.count();
  if (existing > 0) {
    console.log('Person already has', existing, 'rows; skipping.');
    return;
  }

  const full = [
    { firstName: 'Ada', lastName: 'Lovelace', industries: ['Computing','Mathematics'], location: 'London', role: 'Member' },
    { firstName: 'Grace', lastName: 'Hopper', industries: ['Computing','Navy'], location: 'Arlington, VA', role: 'Member' },
    { firstName: 'Alan', lastName: 'Turing', industries: ['Research','Computing'], location: 'Wilmslow, UK', role: 'Member' },
  ];

  const noRole   = full.map(({ role, ...rest }) => rest);
  const roleOnly = full.map(({ firstName, lastName, role }) =>
    role ? { firstName, lastName, role } : { firstName, lastName }
  );
  const minimal  = full.map(({ firstName, lastName }) => ({ firstName, lastName }));

  for (const variant of [full, noRole, roleOnly, minimal]) {
    const ok = await createVariant(variant);
    if (ok) break;
  }

  const total = await prisma.person.count();
  console.log('Total people now:', total);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
}).finally(() => prisma.$disconnect());
