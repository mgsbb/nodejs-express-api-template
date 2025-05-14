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
import { createAuthenticatedUser } from '../setup/create-db-entries';
import { getAxiosClient } from '../setup/axios-client';
import { initializeServer } from '../setup/server';
import { safeTruncateTables } from '../setup/db';

import { VALIDATION_ERRORS_USER } from '../../src/modules/v1/user/user.schema';

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

describe('[Integration] User service API', () => {
    describe('GET /api/v1/users/:userId - Get user', () => {
        describe('When user with valid id is provided, ', () => {
            it('then user is returned, status code to be 200', async () => {
                // Create a new user
                const input = {
                    email: 'email@email.com',
                    password: 'Aa!1abcd',
                };
                await createAuthenticatedUser(input.email, input.password);

                const response = await axiosClient.get('/api/v1/users/1');

                expect(response.status).toBe(200);
                expect(response.data).toStrictEqual({
                    message: 'Fetched: user',
                    data: {
                        user: { email: input.email, name: null, id: 1 },
                    },
                });
            });
        });

        describe('When non exisitng user is queried, ', () => {
            it('then status code to be 404', async () => {
                const response = await axiosClient.get('/api/v1/users/1');

                expect(response.status).toBe(404);
                expect(response.data).toStrictEqual({
                    message: 'Not found: user',
                });
            });
        });
    });

    describe('PATCH /api/v1/users/:userId - Update user', () => {
        describe('When existing user provides valid input with token, ', () => {
            it('then user is updated, status code to be 200', async () => {
                // Create new user and get token
                const {
                    accessToken,
                    user,
                    input: createUserInput,
                } = await createAuthenticatedUser('test@email.com', 'Aa1!abcd');
                const input = {
                    name: 'new-updated-name',
                    email: 'updated@email.com',
                };

                const response = await axiosClient.patch(
                    `/api/v1/users/${user?.id}`,
                    input,
                    { headers: { Cookie: `accessToken=${accessToken}` } }
                );

                expect(response.status).toBe(200);
                expect(response.data).toStrictEqual({
                    message: 'Updated: user',
                    data: {
                        user: {
                            id: user.id,
                            name: input.name,
                            email: input.email,
                        },
                    },
                });
            });
        });

        describe('When existing user provides valid input with token, but the email already exists, ', () => {
            it('then user is not updated, status code to be 409', async () => {
                // Create new user1
                const {
                    accessToken: accessToken1,
                    user: user1,
                    input: createUserInput1,
                } = await createAuthenticatedUser(
                    'test1@email.com',
                    'Aa1!abcd'
                );
                // Create new user2
                const {
                    accessToken: accessToken2,
                    user: user2,
                    input: createUserInput2,
                } = await createAuthenticatedUser(
                    'test2@email.com',
                    'Aa1!abcd'
                );

                // Try to update user2 with email of user1
                const input = {
                    name: 'new-updated-name',
                    email: user1.email,
                };

                const response = await axiosClient.patch(
                    `/api/v1/users/${user2?.id}`,
                    input,
                    { headers: { Cookie: `accessToken=${accessToken2}` } }
                );

                expect(response.status).toBe(409);
                expect(response.data).toStrictEqual({
                    message: 'Already in use: email',
                });
            });
        });

        describe('When existing user is trying to update a different user, ', () => {
            it('then user is not updated, status code to be 403', async () => {
                const {
                    accessToken: accessToken1,
                    user: user1,
                    input: createUserInput1,
                } = await createAuthenticatedUser(
                    'test1@email.com',
                    'Aa1!abcd'
                );
                const {
                    accessToken: accessToken2,
                    user: user2,
                    input: createUserInput2,
                } = await createAuthenticatedUser(
                    'test2@email.com',
                    'Aa1!abcd'
                );

                const input = {
                    name: 'new-updated-name',
                    email: 'updated@email.com',
                };

                // trying to update user1 but provided token2 of user2
                const response = await axiosClient.patch(
                    `/api/v1/users/${user1?.id}`,
                    input,
                    { headers: { Cookie: `accessToken=${accessToken2}` } }
                );

                expect(response.status).toBe(403);
                expect(response.data).toStrictEqual({
                    message: 'Unauthorized',
                });
            });
        });

        describe('When valid input is provided, but no token, ', () => {
            it('then user is not updated, status code to be 401', async () => {
                const {
                    accessToken,
                    user,
                    input: createUserInput,
                } = await createAuthenticatedUser(
                    'test2@email.com',
                    'Aa1!abcd'
                );

                const input = {
                    name: 'new-updated-name',
                    email: 'updated@email.com',
                };

                // trying to update user1 but provided token2 of user2
                const response = await axiosClient.patch(
                    `/api/v1/users/${user?.id}`,
                    input
                );

                expect(response.status).toBe(401);
                expect(response.data).toStrictEqual({
                    message: 'Unauthenticated',
                });
            });
        });

        describe('When trying to update non existing user, ', () => {
            it('then status code to be 403', async () => {
                const {
                    accessToken,
                    user,
                    input: createUserInput,
                } = await createAuthenticatedUser(
                    'test2@email.com',
                    'Aa1!abcd'
                );

                const input = {
                    name: 'new-updated-name',
                    email: 'updated@email.com',
                };

                const response = await axiosClient.patch(
                    `/api/v1/users/999`,
                    input,
                    { headers: { Cookie: `accessToken=${accessToken}` } }
                );

                expect(response.status).toBe(403);
                expect(response.data).toStrictEqual({
                    message: 'Unauthorized',
                });
            });
        });

        describe('When only name is provided as input with token, ', () => {
            it('then status code to be 200', async () => {
                const {
                    accessToken,
                    user,
                    input: createUserInput,
                } = await createAuthenticatedUser(
                    'test2@email.com',
                    'Aa1!abcd'
                );

                const input = {
                    name: 'new-updated-name',
                };

                const response = await axiosClient.patch(
                    `/api/v1/users/${user.id}`,
                    input,
                    { headers: { Cookie: `accessToken=${accessToken}` } }
                );

                expect(response.status).toBe(200);
                expect(response.data).toStrictEqual({
                    message: 'Updated: user',
                    data: {
                        user: {
                            id: user.id,
                            email: user.email,
                            name: input.name,
                        },
                    },
                });
            });
        });
    });

    describe('DELETE /api/v1/users/:userId - Delete user', () => {
        describe('When deleting existing user, token provided, ', () => {
            it('then status code to be 204', async () => {
                const { accessToken, user } = await createAuthenticatedUser(
                    'test@email.com',
                    'Aa1!abcd'
                );

                const response = await axiosClient.delete(
                    `/api/v1/users/${user.id}`,
                    { headers: { Cookie: `accessToken=${accessToken}` } }
                );

                expect(response.status).toBe(204);
            });
        });

        describe('When deleting existing user, no token provided, ', () => {
            it('then status code to be 401', async () => {
                const { accessToken, user } = await createAuthenticatedUser(
                    'test@email.com',
                    'Aa1!abcd'
                );

                const response = await axiosClient.delete(
                    `/api/v1/users/${user.id}`
                );

                expect(response.status).toBe(401);
                expect(response.data).toStrictEqual({
                    message: 'Unauthenticated',
                });
            });
        });

        describe('When trying to delete the same user twice, ', () => {
            it('then status code to be 404', async () => {
                const { accessToken, user } = await createAuthenticatedUser(
                    'test@email.com',
                    'Aa1!abcd'
                );

                await axiosClient.delete(`/api/v1/users/${user.id}`, {
                    headers: { Cookie: `accessToken=${accessToken}` },
                });
                const response = await axiosClient.delete(
                    `/api/v1/users/${user.id}`,
                    { headers: { Cookie: `accessToken=${accessToken}` } }
                );

                expect(response.status).toBe(404);
                expect(response.data).toStrictEqual({
                    // unpredictable message from prisma
                    message: 'user record to delete does not exist.',
                });
            });
        });

        describe('When trying to delete the a different user, ', () => {
            it('then status code to be 403', async () => {
                const { accessToken: accessToken1, user: user1 } =
                    await createAuthenticatedUser(
                        'test1@email.com',
                        'Aa1!abcd'
                    );
                const { accessToken: accessToken2, user: user2 } =
                    await createAuthenticatedUser(
                        'test2@email.com',
                        'Aa1!abcd'
                    );

                const response = await axiosClient.delete(
                    `/api/v1/users/${user1.id}`,
                    { headers: { Cookie: `accessToken=${accessToken2}` } }
                );

                expect(response.status).toBe(403);
                expect(response.data).toStrictEqual({
                    message: 'Unauthorized',
                });
            });
        });
    });
});
