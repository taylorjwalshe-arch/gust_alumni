import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  await prisma.person.createMany({
    data: [
      {
        email: "sarah@alumni.edu",
        userId: "m1",
        firstName: "Sarah",
        lastName: "Lee",
        role: "Mentor",
        gradYear: 2010,
        industries: ["Finance"],
        company: "Goldman Sachs",
        title: "MD",
        expertise: ["Banking", "Leadership"],
        teamAffiliation: "Varsity",
      },
      {
        email: "david@alumni.edu",
        userId: "m2",
        firstName: "David",
        lastName: "Kim",
        role: "Mentor",
        gradYear: 2012,
        industries: ["Tech"],
        company: "Amazon",
        title: "VP",
        expertise: ["Cloud", "Scaling"],
        teamAffiliation: "JV",
      },
    ],
  });
}
main().finally(() => prisma.$disconnect());
