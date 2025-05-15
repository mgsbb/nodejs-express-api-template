import { Comment, Post, User } from '../../src/generated/prisma';
import { getAxiosClient } from './axios-client';

export async function createAuthenticatedUser(
    email?: string,
    password?: string
) {
    const axiosClient = getAxiosClient();

    const input = { email, password };

    // Register user
    const response = await axiosClient.post('/api/v1/auth/register', input);

    // Login user - no longer required as register itself sends cookies
    // const response = await axiosClient.post('/api/v1/users/login', input);

    const accessCokie = response.headers['set-cookie']?.[0];
    // TODO: find alternative to this manual method of extraction
    const accessToken = accessCokie?.split(';')[0].split('=')[1];

    const refreshCookie = response.headers['set-cookie']?.[1];
    const refreshToken = refreshCookie?.split(';')[0].split('=')[1];

    return {
        input,
        user: response.data?.data.user as User,
        accessToken,
        refreshToken,
    };
}

export async function createPost(
    title: string,
    content: string,
    accessToken: string | undefined
) {
    if (accessToken === undefined) {
        throw new Error('post creation requires valid token');
    }

    const axiosClient = getAxiosClient();

    const input = { title, content };

    const response = await axiosClient.post('/api/v1/posts', input, {
        headers: { Cookie: `accessToken=${accessToken}` },
    });

    const post: Post = response.data.data.post;

    return post;
}

export async function createComment(
    content: string,
    postId: number,
    accessToken: string | undefined
) {
    if (accessToken === undefined) {
        throw new Error('comment creation requires valid token');
    }

    const axiosClient = getAxiosClient();

    const input = { content };

    const response = await axiosClient.post(
        `/api/v1/posts/${postId}/comments`,
        input,
        { headers: { Cookie: `accessToken=${accessToken}` } }
    );

    const comment = response.data.data.comment as Comment;

    return comment;
}
