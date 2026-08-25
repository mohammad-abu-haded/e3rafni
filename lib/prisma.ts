import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const adapter = new PrismaMariaDb(process.env.MySQL_URL!);

const prisma = new PrismaClient({ adapter });

export default prisma;