import { PrismaClient } from "@prisma/client";

const prismaClientSingleton = () => {
  return new PrismaClient();
};

declare global {
  var prismaGloabl: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = global.prismaGloabl ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== "production") global.prismaGloabl = prisma;
