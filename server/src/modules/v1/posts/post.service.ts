import cloudinary from '#src/cloudinary/setup';
import authContextStorage from '#src/context/auth.context';
import { Post } from '#src/generated/prisma';
import { HTTPNotFoundError } from '#src/utils/errors/http.error';
import {
    filterNullValues,
    filterUndefinedValues,
} from '#src/utils/generic.util';
import prismaClient from '#src/utils/prisma-db/prisma-client.db';
import fs from 'node:fs/promises';

export default class PostService {
    public createPost = async ({
        title,
        content,
        imageUrl,
    }: Pick<Post, 'title' | 'content' | 'imageUrl'>) => {
        const { imagePublicId, imageSecureUrl } =
            await this.uploadImageToCloudinary(imageUrl);

        // authorId from jwt token
        const newPost = await prismaClient.post.create({
            data: {
                title,
                content,
                imageUrl: imageSecureUrl,
                imagePublicId,
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
        if (imageUrl !== undefined && imageUrl !== null) {
            const existingPost = await prismaClient.post.findUnique({
                where: { id },
            });
            await this.deleteImageFromCloudinary(existingPost?.imagePublicId);
        }

        // if new image is sent, save it to cloud
        const { imagePublicId, imageSecureUrl } =
            await this.uploadImageToCloudinary(imageUrl);

        // only update post when authorId matches userId from jwt, i.e only post owner can update post
        const updatedPost = await prismaClient.post.update({
            where: {
                id: id,
                authorId: authContextStorage.getContext('userId'),
            },
            // IMPORTANT: filter out null values, to prevent overwriting image url and id when no new image is sent
            data: {
                ...filterNullValues({
                    ...filterUndefinedValues({
                        title,
                        content,
                        imageUrl: imageSecureUrl,
                        imagePublicId,
                    }),
                }),
            },
        });

        return updatedPost;
    };

    public deletePost = async (id: number) => {
        // only delete post when authorId matches userId from jwt, i.e only post owner can update post
        const deletedPost = await prismaClient.post.delete({
            where: { id, authorId: authContextStorage.getContext('userId') },
        });

        await this.deleteImageFromCloudinary(deletedPost.imagePublicId);

        return deletedPost;
    };

    private uploadImageToCloudinary = async (imageUrl: string | null) => {
        let imageSecureUrl = null;
        let imagePublicId = null;

        if (imageUrl !== null && imageUrl !== undefined) {
            const cloudinaryResponse = await cloudinary.uploader.upload(
                imageUrl,
                {
                    resource_type: 'image',
                    // use_filename: true,
                    // folder: 'node-express-api-posts',
                }
            );
            imageSecureUrl = cloudinaryResponse.secure_url;
            imagePublicId = cloudinaryResponse.public_id;

            await fs.unlink(imageUrl);

            return { imageSecureUrl, imagePublicId };
        }

        return { imageSecureUrl, imagePublicId };
    };

    private deleteImageFromCloudinary = async (
        imagePublicId: string | null | undefined
    ) => {
        if (imagePublicId !== null && imagePublicId !== undefined) {
            await cloudinary.uploader.destroy(imagePublicId);
        }
    };
}
