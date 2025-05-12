import {
    PrismaClient,
    type Comment,
    type Post,
    type User,
} from '../src/generated/prisma';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcryptjs';
import { performance } from 'perf_hooks';

if (process.env.NODE_ENV !== 'development') {
    throw new Error('NODE_ENV is not development');
}

const prismaClient = new PrismaClient();

const USERS_MIN = 15;
const USERS_MAX = 20;
const POSTS_PER_USER_MIN = 15;
const POSTS_PER_USER_MAX = 20;
const COMMENTS_PER_POST_MIN = 5;
const COMMENTS_PER_POST_MAX = 10;

async function truncate() {
    await prismaClient.$executeRaw`TRUNCATE TABLE "User" RESTART IDENTITY CASCADE;`;
    await prismaClient.$executeRaw`TRUNCATE TABLE "Post" RESTART IDENTITY CASCADE;`;
    await prismaClient.$executeRaw`TRUNCATE TABLE "Comment" RESTART IDENTITY CASCADE;`;
}

function getRandomNumberBetweenRange(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomImageUrl() {
    if (Math.random() < 0.5) {
        return {
            imageUrl: faker.image.url(),
            imagePublicId: faker.string.alphanumeric(12),
        };
    } else {
        return { imageUrl: null, imagePublicId: null };
    }
}

async function generateUserData() {
    const totalNoOfUsers = getRandomNumberBetweenRange(USERS_MIN, USERS_MAX);

    const commonPassword = 'Aa1!abcd';
    const hashedPassword = await bcrypt.hash(commonPassword, 10);

    const data: Pick<User, 'name' | 'email' | 'password'>[] = [];

    for (let i = 0; i < totalNoOfUsers; i++) {
        const firstName = faker.person.firstName();
        const lastName = faker.person.firstName();

        data.push({
            name: `${firstName} ${lastName}`,
            email: faker.internet.exampleEmail({ firstName, lastName }),
            password: hashedPassword,
        });
    }

    return data;
}

async function generatePostData(authorId: number) {
    const totalNoOfPosts = getRandomNumberBetweenRange(
        POSTS_PER_USER_MIN,
        POSTS_PER_USER_MAX
    );

    const data: Pick<
        Post,
        'title' | 'content' | 'imagePublicId' | 'imageUrl' | 'authorId'
    >[] = [];

    for (let i = 0; i < totalNoOfPosts; i++) {
        // returns a random url and id or null for both depending on a 50% chance
        const { imagePublicId, imageUrl } = getRandomImageUrl();

        data.push({
            title: faker.lorem.sentence(),
            content: faker.lorem.paragraph(),
            imagePublicId,
            imageUrl,
            authorId,
        });
    }

    return data;
}

async function generateCommentData(authorId: number, postId: number) {
    const totalNoOfComments = getRandomNumberBetweenRange(
        COMMENTS_PER_POST_MIN,
        COMMENTS_PER_POST_MAX
    );

    const data: Pick<Comment, 'content' | 'authorId' | 'postId'>[] = [];

    for (let i = 0; i < totalNoOfComments; i++) {
        data.push({
            content: faker.lorem.paragraph(),
            authorId,
            postId,
        });
    }

    return data;
}

async function main() {
    const start = performance.now();

    await truncate();

    // create users
    await prismaClient.user.createMany({
        data: await generateUserData(),
    });

    const users = await prismaClient.user.findMany();
    const usersCount = users.length;

    // create posts
    for (let user of users) {
        await prismaClient.post.createMany({
            data: await generatePostData(user.id),
        });
    }

    const posts = await prismaClient.post.findMany();

    // create comments
    for (let post of posts) {
        const randomNumber = getRandomNumberBetweenRange(0, usersCount - 1);
        const randomAuthor = users[randomNumber];

        await prismaClient.comment.createMany({
            data: await generateCommentData(randomAuthor.id, post.id),
        });
    }

    const comments = await prismaClient.comment.findMany();

    const end = performance.now();

    console.log(
        `Created: ${users.length} users, ${posts.length} posts, ${comments.length} comments`
    );
    console.log(`Total time: ${end - start} ms`);
}

main();
