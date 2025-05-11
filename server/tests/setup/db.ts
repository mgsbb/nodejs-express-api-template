import { PrismaClient, User } from '../../src/generated/prisma';
import { execSync } from 'node:child_process';
import config from '../../src/config';
import app from '../../src/app';
import axios from 'axios';

const prismaClient = new PrismaClient();

export async function safeTruncateTables() {
    // this won't ever pass as jest sets the env to test
    if (process.env.NODE_ENV !== 'test') {
        throw new Error('Node environment not found to be test');
    }

    if (!process.env.DATABASE_URL?.includes('-tests')) {
        throw new Error(
            'Database URL does not point to the test database. Check .env file'
        );
    }

    await prismaClient.$executeRaw`TRUNCATE TABLE "User" RESTART IDENTITY CASCADE;`;

    // works without truncating Post, most likely as truncating User deletes posts associated with the user.
    await prismaClient.$executeRaw`TRUNCATE TABLE "Post" RESTART IDENTITY CASCADE;`;

    await prismaClient.$executeRaw`TRUNCATE TABLE "Comment" RESTART IDENTITY CASCADE;`;
}

// UNUSED
export async function setupTestDatabase() {
    // this command creates a test database, as a different DATABASE_URL is passed to the command
    // const migrateTestDatabase = execSync('npx prisma migrate deploy', {
    //     env: { DATABASE_URL: config.DATABASE_URL_TEST },
    // }).toString();
    // console.log(migrateTestDatabase);
    // npx prisma generate (run manually) - generates the PrismaClient using the prisma/schema.prisma
    // datasources db url specifies the url to which queries should be made
    // if the particular database does not exist, error is thrown
    // prismaTestClient is not used anywhere, and can be removed
    // prismaClient can be directly imported from src/utils/prismaClient.ts as the instance is defined according to the environment
    // const prismaTestClient = new PrismaClient({
    //     datasources: { db: { url: process.env.DATABASE_URL_TEST } },
    // });
    // return prismaTestClient;
}

// UNUSED
export async function teardownTestDatabase() {
    // await prismaTestClient.$disconnect();
    // NOTE: prisma warning when using the --force flag
    // execSync('npx prisma migrate reset --force', {
    //     env: { DATABASE_URL: config.DATABASE_URL_TEST },
    // });
}
