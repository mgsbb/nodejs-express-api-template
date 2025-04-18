import { PrismaClient } from '../generated/prisma';

let prismaClient: PrismaClient;

if (process.env.NODE_ENV === 'development') {
    prismaClient = new PrismaClient();
} else if (process.env.NODE_ENV === 'test') {
    prismaClient = new PrismaClient({
        datasources: { db: { url: process.env.DATABASE_URL_TEST } },
    });
} else {
    prismaClient = new PrismaClient();
}

export default prismaClient;
