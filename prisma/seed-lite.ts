import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function trySeed(withRole: boolean) {
  try {
    await prisma.person.createMany({
      data: [
        withRole ? { firstName: 'Ada', lastName: 'Lovelace', role: 'Member' } : { firstName: 'Ada', lastName: 'Lovelace' },
        withRole ? { firstName: 'Grace', lastName: 'Hopper', role: 'Member' } : { firstName: 'Grace', lastName: 'Hopper' },
        withRole ? { firstName: 'Alan', lastName: 'Turing', role: 'Member' } : { firstName: 'Alan', lastName: 'Turing' },
      ] as any,
      skipDuplicates: true,
    });
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const n = await prisma.person.count();
  if (n === 0) {
    const ok = await trySeed(true);
    if (!ok) {
      const ok2 = await trySeed(false);
      if (!ok2) {
        console.error('Seed failed with and without role. Check your schema.');
        return;
      }
    }
    console.log('Seeded 3 people.');
  } else {
    console.log('Person already has', n, 'rows; skipping.');
  }
}
main().catch((e)=>{console.error(e);process.exit(1)}).finally(()=>prisma.$disconnect());
