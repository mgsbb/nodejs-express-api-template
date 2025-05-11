import cloudinary from '#src/cloudinary/setup';
import authContextStorage from '#src/context/auth.context';
import { HTTPNotFoundError } from '#src/utils/errors/http.error';
import {
    filterNullValues,
    filterUndefinedValues,
} from '#src/utils/generic.util';
import fs from 'node:fs/promises';
import PostRepository from './post.repository';

export default class PostService {
    private readonly postRepository = new PostRepository();

    public createPost = async (
        { title, content }: { title: string; content: string },
        imageFilePath: string | undefined
    ) => {
        const { imagePublicId, imageSecureUrl } =
            await this.uploadImageToCloudinary(imageFilePath);

        // authorId from jwt token
        const newPost = await this.postRepository.createPost({
            title,
            content,
            imageUrl: imageSecureUrl,
            imagePublicId,
            authorId: authContextStorage.getContext('userId'),
        });

        return newPost;
    };

    public getPost = async (id: number) => {
        const post = await this.postRepository.findPostById(id);

        if (post === null) {
            throw new HTTPNotFoundError('post not found');
        }

        return post;
    };

    public getPosts = async () => {
        const posts = await this.postRepository.findPosts();

        return posts;
    };

    public updatePost = async (
        id: number,
        { title, content }: { title: string; content: string },
        imageFilePath: string | undefined
    ) => {
        // check if new post imageUrl is sent, if so, delete existing image from uploads
        if (imageFilePath !== undefined && imageFilePath !== null) {
            const existingPost = await this.postRepository.findPostById(id);
            await this.deleteImageFromCloudinary(existingPost?.imagePublicId);
        }

        // if new image is sent, save it to cloud
        const { imagePublicId, imageSecureUrl } =
            await this.uploadImageToCloudinary(imageFilePath);

        // only update post when authorId matches userId from jwt, i.e only post owner can update post
        const updatedPost = await this.postRepository.updatePost(
            id,
            authContextStorage.getContext('userId'),
            // IMPORTANT: filter out null values, to prevent overwriting image url and id when no new image is sent
            {
                ...filterNullValues({
                    ...filterUndefinedValues({
                        title,
                        content,
                        imageUrl: imageSecureUrl,
                        imagePublicId,
                    }),
                }),
            }
        );

        return updatedPost;
    };

    public deletePost = async (id: number) => {
        // only delete post when authorId matches userId from jwt, i.e only post owner can update post
        const deletedPost = await this.postRepository.deletePost(
            id,
            authContextStorage.getContext('userId')
        );

        await this.deleteImageFromCloudinary(deletedPost.imagePublicId);

        return deletedPost;
    };

    private uploadImageToCloudinary = async (
        imageFilePath: string | null | undefined
    ) => {
        let imageSecureUrl = null;
        let imagePublicId = null;

        if (imageFilePath !== null && imageFilePath !== undefined) {
            const cloudinaryResponse = await cloudinary.uploader.upload(
                imageFilePath,
                {
                    resource_type: 'image',
                    // use_filename: true,
                    // folder: 'node-express-api-posts',
                }
            );
            imageSecureUrl = cloudinaryResponse.secure_url;
            imagePublicId = cloudinaryResponse.public_id;

            await fs.unlink(imageFilePath);

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
