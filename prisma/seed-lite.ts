import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const n = await prisma.person.count();
  if (n === 0) {
    await prisma.person.createMany({
      data: [
        { firstName: 'Ada', lastName: 'Lovelace' },
        { firstName: 'Grace', lastName: 'Hopper' },
        { firstName: 'Alan', lastName: 'Turing' },
      ],
    });
    console.log('Seeded 3 people.');
  } else {
    console.log('Person already has', n, 'rows; skipping.');
  }
}
main().catch((e)=>{console.error(e);process.exit(1)}).finally(()=>prisma.$disconnect());
