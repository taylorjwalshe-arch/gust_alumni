import pkg from "@prisma/client";
const { PrismaClient } = pkg;

declare global {
  // Allow global var reuse in dev
  // eslint-disable-next-line no-var
  var prisma: InstanceType<typeof PrismaClient> | undefined;
}

const prisma =
  global.prisma ||
  new PrismaClient({
    log: ["error", "warn"],
  });

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

export default prisma;
