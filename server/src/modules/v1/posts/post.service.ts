import authContextStorage from '#src/context/auth.context';
import { Post } from '#src/generated/prisma';
import { HTTPNotFoundError } from '#src/utils/errors/http.error';
import { filterUndefinedValues } from '#src/utils/generic.util';
import prismaClient from '#src/utils/prisma-db/prisma-client.db';
import fs from 'node:fs/promises';

export default class PostService {
    public createPost = async ({
        title,
        content,
        imageUrl,
    }: Pick<Post, 'title' | 'content' | 'imageUrl'>) => {
        // authorId from jwt token
        const newPost = await prismaClient.post.create({
            data: {
                title,
                content,
                imageUrl,
                authorId: authContextStorage.getContext('userId'),
            },
        });

        return newPost;
    };

    public getPost = async (id: number) => {
        const post = await prismaClient.post.findUnique({ where: { id } });

        if (post === null) {
            throw new HTTPNotFoundError('post not found');
        }

        return post;
    };

    public getPosts = async () => {
        const posts = await prismaClient.post.findMany();

        return posts;
    };

    public updatePost = async (
        id: number,
        {
            title,
            content,
            imageUrl,
        }: Pick<Post, 'title' | 'content' | 'imageUrl'>
    ) => {
        // check if new post imageUrl is sent, if so, delete existing image from uploads
        if (imageUrl !== undefined) {
            const existingPost = await prismaClient.post.findUnique({
                where: { id },
            });
            const existingImageUrl = existingPost?.imageUrl;

            if (existingImageUrl !== null && existingImageUrl !== undefined) {
                await fs.unlink(existingImageUrl);
            }
        }

        // only update post when authorId matches userId from jwt, i.e only post owner can update post
        const updatedPost = await prismaClient.post.update({
            where: {
                id: id,
                authorId: authContextStorage.getContext('userId'),
            },
            data: { ...filterUndefinedValues({ title, content, imageUrl }) },
        });

        return updatedPost;
    };

    public deletePost = async (id: number) => {
        // only delete post when authorId matches userId from jwt, i.e only post owner can update post
        const deletedPost = await prismaClient.post.delete({
            where: { id, authorId: authContextStorage.getContext('userId') },
        });

        const imageUrl = deletedPost.imageUrl;

        if (imageUrl !== null) {
            await fs.unlink(imageUrl);
        }

        return deletedPost;
    };
}
