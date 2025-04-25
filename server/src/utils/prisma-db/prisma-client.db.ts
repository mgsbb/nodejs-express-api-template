import { PrismaClient } from '#src/generated/prisma/index';
import config from '#src/config';

let prismaClient: PrismaClient;

if (config.NODE_ENV === 'development') {
    prismaClient = new PrismaClient();
} else if (config.NODE_ENV === 'test') {
    prismaClient = new PrismaClient({
        datasources: { db: { url: config.DATABASE_URL_TEST } },
    });
} else {
    prismaClient = new PrismaClient();
}

export default prismaClient;
