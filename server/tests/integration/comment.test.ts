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
    createComment,
    createPost,
} from '../setup/create-db-entries';
import { getAxiosClient } from '../setup/axios-client';
import { initializeServer } from '../setup/server';
import { safeTruncateTables } from '../setup/db';

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

describe('[Integration] Comment service API', () => {
    describe('POST /api/v1/posts/:postId/comments - Create new comment', () => {
        describe('When comment input is valid, post for comment exists, but user is not logged in,', () => {
            it('then comment will not be created, status code to be 401', async () => {
                const { token } = await createAuthenticatedUser(
                    'test@email.com',
                    'Aa1!abcd'
                );
                const post = await createPost(
                    'post title',
                    'post content',
                    token
                );
                const input = { content: 'comment content' };

                const response = await axiosClient.post(
                    `/api/v1/posts/${post.id}/comments`,
                    input
                    // no headers with cookie
                );

                expect(response.status).toBe(401);
                expect(response.data).toStrictEqual({
                    message: 'unauthenticated action',
                });
            });
        });

        describe('When comment input is valid, post exists, and user is authenticated,', () => {
            it('then comment will be created, status code to be 201', async () => {
                const { token, user } = await createAuthenticatedUser(
                    'test@email.com',
                    'Aa1!abcd'
                );
                const post = await createPost(
                    'post title',
                    'post content',
                    token
                );
                const input = { content: 'comment content' };

                const response = await axiosClient.post(
                    `/api/v1/posts/${post.id}/comments`,
                    input,
                    { headers: { Cookie: `token=${token}` } }
                );

                expect(response.status).toBe(201);
                expect(response.data).toStrictEqual({
                    message: 'comment creation success',
                    comment: {
                        id: 1,
                        createdAt: expect.any(String),
                        updatedAt: expect.any(String),
                        postId: post.id,
                        content: input.content,
                        authorId: user.id,
                    },
                });
            });
        });

        describe('When comment input is valid, post does not exist, and user is authenticated,', () => {
            it('then comment will not be created, status code to be 404', async () => {
                const { token } = await createAuthenticatedUser(
                    'test@email.com',
                    'Aa1!abcd'
                );
                const post = await createPost(
                    'post title',
                    'post content',
                    token
                );
                const input = { content: 'comment content' };

                const response = await axiosClient.post(
                    `/api/v1/posts/100/comments`,
                    input,
                    { headers: { Cookie: `token=${token}` } }
                );

                expect(response.status).toBe(404);
                expect(response.data).toStrictEqual({
                    message: 'post not found',
                });
            });
        });
    });

    describe('GET /api/v1/posts/:postId/comments - Get post', () => {
        describe('When post id param is valid,', () => {
            it('then comments of post are returned, status code to be 200', async () => {
                const { token } = await createAuthenticatedUser(
                    'test@email.com',
                    'Aa1!abcd'
                );
                const post = await createPost(
                    'post title',
                    'post content',
                    token
                );
                const comment = await createComment(
                    'comment content',
                    post.id,
                    token
                );

                const response = await axiosClient.get(
                    `/api/v1/posts/${post.id}/comments`
                );

                expect(response.status).toBe(200);
                expect(response.data).toStrictEqual({
                    message: 'comments of post fetch success',
                    comments: [comment],
                });
            });
        });

        describe('When post id param is valid, but comments does not exist,', () => {
            it('then empty array is returned, status code to be 200', async () => {
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
                    `/api/v1/posts/${post.id}/comments`
                );

                expect(response.status).toBe(200);
                expect(response.data).toStrictEqual({
                    message: 'comments of post fetch success',
                    comments: [],
                });
            });
        });
    });

    describe('GET /api/v1/comments - Get all comments of all posts', () => {
        describe('When comments exist,', () => {
            it('then comments are returned, status code to be 200', async () => {
                const { token } = await createAuthenticatedUser(
                    'test@email.com',
                    'Aa1!abcd'
                );
                const post = await createPost(
                    'post title',
                    'post content',
                    token
                );
                const comment = await createComment(
                    'comment content',
                    post.id,
                    token
                );

                const response = await axiosClient.get(`/api/v1/comments`);

                expect(response.status).toBe(200);
                expect(response.data).toStrictEqual({
                    message: 'comments fetch success',
                    comments: [comment],
                });
            });
        });

        describe('When comments donot exist,', () => {
            it('then empty array is returned, status code to be 200', async () => {
                const { token } = await createAuthenticatedUser(
                    'test@email.com',
                    'Aa1!abcd'
                );
                const post = await createPost(
                    'post title',
                    'post content',
                    token
                );

                const response = await axiosClient.get(`/api/v1/comments`);

                expect(response.status).toBe(200);
                expect(response.data).toStrictEqual({
                    message: 'comments fetch success',
                    comments: [],
                });
            });
        });
    });

    describe('GET /api/v1/comments/:commentId - Get single comment', () => {
        describe('When comment id is valid and comment exists,', () => {
            it('then comment will be returned, status code to be 200', async () => {
                const { token, user } = await createAuthenticatedUser(
                    'test@email.com',
                    'Aa1!abcde'
                );
                const post = await createPost(
                    'post title',
                    'post content',
                    token
                );
                const comment = await createComment(
                    'comment content',
                    post.id,
                    token
                );

                const response = await axiosClient.get(
                    `/api/v1/comments/${comment.id}`
                );

                expect(response.status).toBe(200);
                expect(response.data).toStrictEqual({
                    message: 'comment fetch success',
                    comment: {
                        id: 1,
                        createdAt: expect.any(String),
                        updatedAt: expect.any(String),
                        postId: post.id,
                        content: comment.content,
                        authorId: user.id,
                    },
                });
            });
        });

        describe('When comment id is valid and comment does not exist,', () => {
            it('then comment will not be returned, status code to be 404', async () => {
                const response = await axiosClient.get(`/api/v1/comments/100`);

                expect(response.status).toBe(404);
                expect(response.data).toStrictEqual({
                    message: 'comment not found',
                });
            });
        });
    });

    describe('PATCH /api/v1/comments/:comment - Update comment', () => {
        describe('When comment input is valid, but user is not logged in,', () => {
            it('then comment will not be updated, status code to be 401', async () => {
                const { token } = await createAuthenticatedUser(
                    'test@email.com',
                    'Aa1!abcde'
                );
                const post = await createPost(
                    'post title',
                    'post content',
                    token
                );
                const comment = await createComment(
                    'comment content',
                    post.id,
                    token
                );
                const input = { content: 'updated comment content' };

                const response = await axiosClient.patch(
                    `/api/v1/comments/${comment.id}`,
                    input
                );

                expect(response.status).toBe(401);
                expect(response.data).toStrictEqual({
                    message: 'unauthenticated action',
                });
            });
        });

        describe('When comment input is valid, and user is logged in,', () => {
            it('then comment will be updated, status code to be 200', async () => {
                const { token, user } = await createAuthenticatedUser(
                    'test@email.com',
                    'Aa1!abcde'
                );
                const post = await createPost(
                    'post title',
                    'post content',
                    token
                );
                const comment = await createComment(
                    'comment content',
                    post.id,
                    token
                );
                const input = { content: 'updated comment content' };

                const response = await axiosClient.patch(
                    `/api/v1/comments/${comment.id}`,
                    input,
                    { headers: { Cookie: `token=${token}` } }
                );

                expect(response.status).toBe(200);
                expect(response.data).toStrictEqual({
                    message: 'comment update success',
                    comment: {
                        id: comment.id,
                        createdAt: expect.any(String),
                        updatedAt: expect.any(String),
                        postId: post.id,
                        content: input.content,
                        authorId: user.id,
                    },
                });
            });
        });

        describe('When comment input is valid, user is different', () => {
            it('then comment will not be updated, status code to be 404', async () => {
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
                const post = await createPost(
                    'post title',
                    'post content',
                    token1
                );
                const comment = await createComment(
                    'comment content',
                    post.id,
                    token2
                );
                const input = {
                    content: 'comment content updated',
                };

                const response = await axiosClient.patch(
                    `/api/v1/comments/${comment.id}`,
                    input,
                    { headers: { Cookie: `token=${token1}` } }
                );

                expect(response.status).toBe(404);
                expect(response.data).toStrictEqual({
                    // message from prisma
                    message: 'comment record to update not found.',
                });
            });
        });
    });

    describe('DELETE /api/v1/comments/:commentId - Delete comment', () => {
        describe('When user is logged in, and comment id is valid', () => {
            it('then comment will be deleted, status code to be 204', async () => {
                const { token } = await createAuthenticatedUser(
                    'test1@email.com',
                    'Aa1!abcde'
                );
                const post = await createPost(
                    'post title',
                    'post content',
                    token
                );
                const comment = await createComment(
                    'comment content',
                    post.id,
                    token
                );

                const response = await axiosClient.delete(
                    `/api/v1/comments/${comment.id}`,
                    { headers: { Cookie: `token=${token}` } }
                );

                expect(response.status).toBe(204);
            });
        });

        describe('When user is not logged in,', () => {
            it('then comment will not be deleted, status code to be 401', async () => {
                const { token } = await createAuthenticatedUser(
                    'test1@email.com',
                    'Aa1!abcde'
                );
                const post = await createPost(
                    'post title',
                    'post content',
                    token
                );
                const comment = await createComment(
                    'comment content',
                    post.id,
                    token
                );

                const response = await axiosClient.delete(
                    `/api/v1/comments/${comment.id}`
                );

                expect(response.status).toBe(401);
                expect(response.data).toStrictEqual({
                    message: 'unauthenticated action',
                });
            });
        });

        describe('When user tries to delete comment of a different user,', () => {
            it('then comment will not be deleted, status code to be 404', async () => {
                const { token: token1 } = await createAuthenticatedUser(
                    'test1@email.com',
                    'Aa1!abcde'
                );
                const { token: token2 } = await createAuthenticatedUser(
                    'test2@email.com',
                    'Aa1!abcde'
                );
                const post = await createPost(
                    'post title',
                    'post content',
                    token1
                );
                const comment = await createComment(
                    'comment content',
                    post.id,
                    token2
                );

                const response = await axiosClient.delete(
                    `/api/v1/comments/${comment.id}`,
                    { headers: { Cookie: `token=${token1}` } }
                );

                expect(response.status).toBe(404);
                expect(response.data).toStrictEqual({
                    // message from prisma
                    message: 'comment record to delete does not exist.',
                });
            });
        });
    });
});
