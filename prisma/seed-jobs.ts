import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  await prisma.job.createMany({
    data: [
      { title: "Software Engineer", company: "Google", location: "NYC" },
      { title: "Analyst", company: "Blackstone", location: "Boston" },
      { title: "Consultant", company: "McKinsey", location: "Chicago" }
    ],
  });
}
main().finally(() => prisma.$disconnect());
