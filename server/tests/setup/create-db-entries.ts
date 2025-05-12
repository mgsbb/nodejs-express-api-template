import { Comment, Post, User } from '../../src/generated/prisma';
import { getAxiosClient } from './axios-client';

export async function createAuthenticatedUser(
    email?: string,
    password?: string
) {
    const axiosClient = getAxiosClient();

    const input = { email, password };

    // Create user
    await axiosClient.post('/api/v1/users', input);

    // Login user
    const response = await axiosClient.post('/api/v1/users/login', input);

    const cookie = response.headers['set-cookie']?.[0];

    // TODO: find alternative to this manual method of extraction
    const token = cookie?.split(';')[0].split('=')[1];

    return { input, user: response.data?.data.user as User, token };
}

export async function createPost(
    title: string,
    content: string,
    token: string | undefined
) {
    if (token === undefined) {
        throw new Error('post creation requires valid token');
    }

    const axiosClient = getAxiosClient();

    const input = { title, content };

    const response = await axiosClient.post('/api/v1/posts', input, {
        headers: { Cookie: `token=${token}` },
    });

    const post: Post = response.data.data.post;

    return post;
}

export async function createComment(
    content: string,
    postId: number,
    token: string | undefined
) {
    if (token === undefined) {
        throw new Error('comment creation requires valid token');
    }

    const axiosClient = getAxiosClient();

    const input = { content };

    const response = await axiosClient.post(
        `/api/v1/posts/${postId}/comments`,
        input,
        { headers: { Cookie: `token=${token}` } }
    );

    const comment = response.data.data.comment as Comment;

    return comment;
}
