import { Post } from '#src/generated/prisma';
import prismaClient from '#src/utils/prisma-db/prisma-client.db';
import { IPostsQuery } from './post.controller';

export default class PostRepository {
    public createPost = async (
        data: Pick<
            Post,
            'title' | 'content' | 'imagePublicId' | 'imageUrl' | 'authorId'
        >
    ) => {
        const post = await prismaClient.post.create({ data });

        return post;
    };

    public findPostById = async (id: number) => {
        const post = await prismaClient.post.findUnique({ where: { id } });

        return post;
    };

    public findPosts = async ({
        limit,
        page,
        search,
        sortBy,
        sortOrder,
    }: IPostsQuery) => {
        let whereClause = {};

        if (search !== '') {
            whereClause = {
                OR: [
                    { title: { contains: search, mode: 'insensitive' } },
                    { content: { contains: search, mode: 'insensitive' } },
                ],
            };
        }

        const posts = await prismaClient.post.findMany({
            where: whereClause,
            skip: (Number(page) - 1) * Number(limit),
            take: Number(limit),
            orderBy: { [sortBy]: sortOrder === 'asc' ? 'asc' : 'desc' },
        });

        return posts;
    };

    public updatePost = async (
        id: number,
        authorId: number,
        data: Partial<Post>
    ) => {
        const post = await prismaClient.post.update({
            where: { id, authorId },
            data,
        });

        return post;
    };

    public deletePost = async (id: number, authorId: number) => {
        const post = await prismaClient.post.delete({
            where: { id, authorId },
        });

        return post;
    };
}
