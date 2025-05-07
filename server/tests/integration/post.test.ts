import {
    expect,
    describe,
    it,
    beforeAll,
    afterAll,
    beforeEach,
} from '@jest/globals';
import { type Server } from 'http';
import { type AxiosInstance } from 'axios';
import {
    createAuthenticatedUser,
    createPost,
} from '../setup/create-db-entries';
import { getAxiosClient } from '../setup/axios-client';
import { initializeServer } from '../setup/server';
import { safeTruncateTables } from '../setup/db';

import { VALIDATION_ERRORS_POST } from '../../src/modules/v1/posts/post.schema';

let server: Server;
let axiosClient: AxiosInstance;

beforeAll(() => {
    server = initializeServer();
    axiosClient = getAxiosClient();
});

beforeEach(async () => {
    await safeTruncateTables();
});

afterAll(() => {
    server.close();
});

describe('[Integration] Post service API', () => {
    describe('POST /api/v1/posts - Create new post', () => {
        describe('When post input is valid but user is not logged in,', () => {
            it('then post will not be created, status code to be 401', async () => {
                const input = { title: 'post title', content: 'post content' };

                const response = await axiosClient.post('/api/v1/posts', input);

                expect(response.status).toBe(401);
                expect(response.data).toStrictEqual({
                    message: 'unauthenticated action',
                });
            });
        });

        describe('When post input is invalid,', () => {
            it('then post will not be created, status code to be 400', async () => {
                const input = {
                    title: 'post',
                    content: 'post',
                };

                const response = await axiosClient.post('/api/v1/posts', input);

                expect(response.status).toBe(400);
                expect(response.data).toStrictEqual({
                    message: `${VALIDATION_ERRORS_POST.TITLE_MIN}, ${VALIDATION_ERRORS_POST.CONTENT_MIN}`,
                });
            });
        });

        describe('When post input is valid, no image in input, and user is authenticated,', () => {
            it('then post will be created, status code to be 201', async () => {
                const { token, user } = await createAuthenticatedUser(
                    'test@email.com',
                    'Aa1!abcd'
                );
                const input = {
                    title: 'post title',
                    content: 'post content',
                };

                const response = await axiosClient.post(
                    '/api/v1/posts',
                    input,
                    { headers: { Cookie: `token=${token}` } }
                );

                expect(response.status).toBe(201);
                expect(response.data).toStrictEqual({
                    message: `post creation success`,
                    post: {
                        title: input.title,
                        content: input.content,
                        id: 1,
                        imagePublicId: null,
                        imageUrl: null,
                        authorId: user.id,
                        createdAt: expect.any(String),
                        updatedAt: expect.any(String),
                    },
                });
            });
        });
    });

    describe('GET /api/v1/posts/:postId - Get post', () => {
        describe('When post id param is valid,', () => {
            it('then post is returned, status code to be 200', async () => {
                const { token } = await createAuthenticatedUser(
                    'test@email.com',
                    'Aa1!abcd'
                );
                const post = await createPost(
                    'post title',
                    'post content',
                    token
                );

                const response = await axiosClient.get(
                    `/api/v1/posts/${post.id}`
                );

                expect(response.status).toBe(200);
                expect(response.data).toStrictEqual({
                    message: 'fetch post success',
                    post,
                });
            });
        });

        describe('When post id param is invalid,', () => {
            it('then post is not returned, status code to be 400', async () => {
                const response = await axiosClient.get(`/api/v1/posts/-1`);

                expect(response.status).toBe(400);
                expect(response.data).toStrictEqual({
                    message: VALIDATION_ERRORS_POST.POST_ID_POSITIVE,
                });
            });
        });

        describe('When post id param is valid, but post does not exist,', () => {
            it('then post is not returned, status code to be 404', async () => {
                const response = await axiosClient.get(`/api/v1/posts/1`);

                expect(response.status).toBe(404);
                expect(response.data).toStrictEqual({
                    message: 'post not found',
                });
            });
        });
    });

    describe('GET /api/v1/posts - Get all posts', () => {
        describe('When posts exist,', () => {
            it('then posts are returned, status code to be 200', async () => {
                const { token } = await createAuthenticatedUser(
                    'test@email.com',
                    'Aa1!abcd'
                );
                const post1 = await createPost(
                    'post title',
                    'post content',
                    token
                );
                const post2 = await createPost(
                    'post title 2',
                    'post content 2',
                    token
                );

                const response = await axiosClient.get(`/api/v1/posts`);

                expect(response.status).toBe(200);
                expect(response.data).toStrictEqual({
                    message: 'fetch posts success',
                    posts: [post1, post2],
                });
            });
        });

        describe('When posts do not exist,', () => {
            it('then empty array is returned, status code to be 200', async () => {
                const response = await axiosClient.get(`/api/v1/posts`);

                expect(response.status).toBe(200);
                expect(response.data).toStrictEqual({
                    message: 'fetch posts success',
                    posts: [],
                });
            });
        });
    });

    describe('PATCH /api/v1/posts/:postId - Update post', () => {
        describe('When post input is valid, no image in input, but user is not logged in,', () => {
            it('then post will not be updated, status code to be 401', async () => {
                const { token } = await createAuthenticatedUser(
                    'test@email.com',
                    'Aa1!abcde'
                );
                const post = await createPost(
                    'post title',
                    'post content',
                    token
                );
                const input = {
                    title: 'post title updated',
                    content: 'post content updated',
                };

                const response = await axiosClient.patch(
                    `/api/v1/posts/${post.id}`,
                    input
                );

                expect(response.status).toBe(401);
                expect(response.data).toStrictEqual({
                    message: 'unauthenticated action',
                });
            });
        });

        describe('When post input is valid, no image in input, user is logged in,', () => {
            it('then post will be updated, status code to be 200', async () => {
                const { token, user } = await createAuthenticatedUser(
                    'test@email.com',
                    'Aa1!abcde'
                );
                const post = await createPost(
                    'post title',
                    'post content',
                    token
                );
                const input = {
                    title: 'post title updated',
                    content: 'post content updated',
                };

                const response = await axiosClient.patch(
                    `/api/v1/posts/${post.id}`,
                    input,
                    { headers: { Cookie: `token=${token}` } }
                );

                expect(response.status).toBe(200);
                expect(response.data).toStrictEqual({
                    message: 'update post success',
                    post: {
                        title: input.title,
                        content: input.content,
                        id: 1,
                        imageUrl: null,
                        imagePublicId: null,
                        authorId: user.id,
                        createdAt: expect.any(String),
                        updatedAt: expect.any(String),
                    },
                });
            });
        });

        describe('When post input is valid, no image in input, user is different', () => {
            it('then post will not be updated, status code to be 404', async () => {
                const { token: token1, user: user1 } =
                    await createAuthenticatedUser(
                        'test1@email.com',
                        'Aa1!abcde'
                    );
                const { token: token2, user: user2 } =
                    await createAuthenticatedUser(
                        'test2@email.com',
                        'Aa1!abcde'
                    );
                const post1 = await createPost(
                    'post title',
                    'post content',
                    token1
                );
                const input = {
                    title: 'post title updated',
                    content: 'post content updated',
                };

                const response = await axiosClient.patch(
                    `/api/v1/posts/${post1.id}`,
                    input,
                    { headers: { Cookie: `token=${token2}` } }
                );

                expect(response.status).toBe(404);
                expect(response.data).toStrictEqual({
                    // message from prisma
                    message: 'post record to update not found.',
                });
            });
        });
    });

    describe('DELETE /api/v1/posts - Delete post', () => {
        describe('When user is logged in,', () => {
            it('then post will be deleted, status code to be 204', async () => {
                const { token } = await createAuthenticatedUser(
                    'test1@email.com',
                    'Aa1!abcde'
                );
                const post = await createPost(
                    'post title',
                    'post content',
                    token
                );

                const response = await axiosClient.delete(
                    `/api/v1/posts/${post.id}`,
                    { headers: { Cookie: `token=${token}` } }
                );

                expect(response.status).toBe(204);
            });
        });

        describe('When user is not logged in,', () => {
            it('then post will not be deleted, status code to be 401', async () => {
                const { token } = await createAuthenticatedUser(
                    'test1@email.com',
                    'Aa1!abcde'
                );
                const post = await createPost(
                    'post title',
                    'post content',
                    token
                );

                const response = await axiosClient.delete(
                    `/api/v1/posts/${post.id}`
                );

                expect(response.status).toBe(401);
                expect(response.data).toStrictEqual({
                    message: 'unauthenticated action',
                });
            });
        });

        describe('When user tries to delete post of a different user,', () => {
            it('then post will not be deleted, status code to be 404', async () => {
                const { token: token1 } = await createAuthenticatedUser(
                    'test1@email.com',
                    'Aa1!abcde'
                );
                const { token: token2 } = await createAuthenticatedUser(
                    'test2@email.com',
                    'Aa1!abcde'
                );
                const post1 = await createPost(
                    'post title',
                    'post content',
                    token1
                );

                const response = await axiosClient.delete(
                    `/api/v1/posts/${post1.id}`,
                    { headers: { Cookie: `token=${token2}` } }
                );

                expect(response.status).toBe(404);
                expect(response.data).toStrictEqual({
                    // message from prisma
                    message: 'post record to delete does not exist.',
                });
            });
        });
    });
});
