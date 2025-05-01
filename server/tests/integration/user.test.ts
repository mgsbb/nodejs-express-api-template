import {
    expect,
    describe,
    it,
    beforeAll,
    afterAll,
    beforeEach,
} from '@jest/globals';
import http from 'http';
import { AxiosInstance } from 'axios';
import { createAuthenticatedUser } from '../setup/auth-user';
import { getAxiosClient } from '../setup/axios-client';
import { initializeServer } from '../setup/server';
import { safeTruncateTables } from '../setup/db';

import { VALIDATION_ERRORS_USER } from '../../src/modules/v1/user/user.schema';

let server: http.Server;
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
    describe('POST /api/v1/users - Create new user', () => {
        describe('When valid email and password is provided as input, ', () => {
            it('then user will be created, status code to be 201', async () => {
                const input = { email: 'email@test.com', password: 'Aa1!abcd' };

                const response = await axiosClient.post(`/api/v1/users`, input);
                const data = response.data;

                expect(response.status).toBe(201);
                expect(data).toStrictEqual({
                    // message here is predictable - as returned by the controller
                    message: 'user created',
                    user: { id: 1, email: input.email, name: null },
                });
            });
        });

        describe('When existing email is provided as input, ', () => {
            it('then user will not be created, status code to be 409', async () => {
                // Create a new user
                const input = { email: 'email@test.com', password: 'Aa1!abcd' };
                await axiosClient.post(`/api/v1/users`, input);

                // Try to create another user with same email
                const response = await axiosClient.post('/api/v1/users', input);
                const data = response.data;

                expect(response.status).toBe(409);
                expect(data).toStrictEqual({
                    // message here may be unpredictable - returned by prisma error message generator
                    message: 'already exists: user email',
                });
            });
        });

        // Input validation errors - integration tests OR unit tests?

        describe('When invalid email is provided as input, ', () => {
            it('then user will not be created, status code to be 400', async () => {
                const input = { email: 'email', password: 'Aa1!abcd' };

                const response = await axiosClient.post('/api/v1/users', input);
                const data = response.data;

                expect(response.status).toBe(400);
                expect(data).toStrictEqual({
                    // message here is being coupled to code from src
                    message: VALIDATION_ERRORS_USER.EMAIL_VALID,
                });
            });
        });

        describe('When invalid password is provided as input, ', () => {
            it('then user will not be created, status code to be 400', async () => {
                const input = { email: 'email@email.com', password: 'a' };

                const response = await axiosClient.post('/api/v1/users', input);
                const data = response.data;

                expect(response.status).toBe(400);
                expect(data).toStrictEqual({
                    message: `${VALIDATION_ERRORS_USER.PASSWORD_MIN}, ${VALIDATION_ERRORS_USER.PASSWORD_UPPERCASE}, ${VALIDATION_ERRORS_USER.PASSWORD_NUMERIC}, ${VALIDATION_ERRORS_USER.PASSWORD_SPECIAL}`,
                });
            });
        });

        describe('When input contains unrecognized fields, ', () => {
            it('then user will not be created, status code to be 400', async () => {
                const input = {
                    email: 'email@email.com',
                    password: 'aA12!sdasdv',
                    unrecognized: 'value',
                };

                const response = await axiosClient.post('/api/v1/users', input);
                const data = response.data;

                expect(response.status).toBe(400);
                expect(data).toStrictEqual({
                    message: VALIDATION_ERRORS_USER.UNRECOGNIZED,
                });
            });
        });
    });

    describe('POST /api/v1/users/login - Login user', () => {
        describe('When valid email and correct password is provided, ', () => {
            it('then user is logged in with token, status code to be 200', async () => {
                // Create a new user
                const input = {
                    email: 'email@email.com',
                    password: 'Aa1!abcd',
                };
                await axiosClient.post('/api/v1/users', input);

                // Login
                const response = await axiosClient.post(
                    '/api/v1/users/login',
                    input
                );
                const data = response.data;

                expect(response.status).toBe(200);
                expect(data).toStrictEqual({
                    message: 'login sucessful',
                    user: { email: input.email, id: 1, name: null },
                });
                expect(response.headers['set-cookie']?.[0]).toMatch(/token/);
                expect(response.headers['set-cookie']?.[0]).toMatch(/HttpOnly/);
            });
        });

        describe('When valid email and incorrect password is provided, ', () => {
            it('then user is not logged, status code to be 401', async () => {
                // Create a new user
                const input = {
                    email: 'email@email.com',
                    password: 'Aa1!abcd',
                };
                await axiosClient.post('/api/v1/users', input);

                // Login
                const response = await axiosClient.post('/api/v1/users/login', {
                    email: 'email@email.com',
                    password: 'wrong-password-A1!',
                });
                const data = response.data;

                expect(response.status).toBe(401);
                expect(data).toStrictEqual({
                    message: 'invalid credentials',
                });
                expect(response.headers['set-cookie']?.[0]).toBe(undefined);
            });
        });

        describe('When a non existing user tries to log in, ', () => {
            it('then status code to be 401', async () => {
                const response = await axiosClient.post('/api/v1/users/login', {
                    email: 'email@email.com',
                    password: 'wrong-password-A1!',
                });
                const data = response.data;

                expect(response.status).toBe(401);
                expect(data).toStrictEqual({
                    message: 'invalid credentials',
                });
                expect(response.headers['set-cookie']?.[0]).toBe(undefined);
            });
        });
    });

    describe('GET /api/v1/users/:userId - Get user', () => {
        describe('When user with valid id is provided, ', () => {
            it('then user is returned, status code to be 200', async () => {
                // Create a new user
                const input = {
                    email: 'email@email.com',
                    password: 'Aa!1abcd',
                };
                await axiosClient.post('/api/v1/users', input);

                const response = await axiosClient.get('/api/v1/users/1');

                expect(response.status).toBe(200);
                expect(response.data).toStrictEqual({
                    message: 'user fetch success',
                    user: { email: input.email, name: null, id: 1 },
                });
            });
        });

        describe('When non exisitng user is queried, ', () => {
            it('then status code to be 404', async () => {
                const response = await axiosClient.get('/api/v1/users/1');

                expect(response.status).toBe(404);
                expect(response.data).toStrictEqual({
                    message: 'user not found',
                });
            });
        });
    });

    describe('PATCH /api/v1/users/:userId - Update user', () => {
        describe('When existing user provides valid input with token, ', () => {
            it('then user is updated, status code to be 200', async () => {
                // Create new user and get token
                const {
                    token,
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
                    { headers: { Cookie: `token=${token}` } }
                );

                expect(response.status).toBe(200);
                expect(response.data).toStrictEqual({
                    message: 'user update success',
                    user: { id: user.id, name: input.name, email: input.email },
                });
            });
        });

        describe('When existing user provides valid input with token, but the email already exists, ', () => {
            it('then user is not updated, status code to be 409', async () => {
                // Create new user1
                const {
                    token: token1,
                    user: user1,
                    input: createUserInput1,
                } = await createAuthenticatedUser(
                    'test1@email.com',
                    'Aa1!abcd'
                );
                // Create new user2
                const {
                    token: token2,
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
                    { headers: { Cookie: `token=${token2}` } }
                );

                expect(response.status).toBe(409);
                expect(response.data).toStrictEqual({
                    message: 'email already in use',
                });
            });
        });

        describe('When existing user is trying to update a different user, ', () => {
            it('then user is not updated, status code to be 403', async () => {
                const {
                    token: token1,
                    user: user1,
                    input: createUserInput1,
                } = await createAuthenticatedUser(
                    'test1@email.com',
                    'Aa1!abcd'
                );
                const {
                    token: token2,
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
                    { headers: { Cookie: `token=${token2}` } }
                );

                expect(response.status).toBe(403);
                expect(response.data).toStrictEqual({
                    message: 'unauthorized action',
                });
            });
        });

        describe('When valid input is provided, but no token, ', () => {
            it('then user is not updated, status code to be 401', async () => {
                const {
                    token,
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
                    message: 'unauthenticated action',
                });
            });
        });

        describe('When trying to update non existing user, ', () => {
            it('then status code to be 403', async () => {
                const {
                    token,
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
                    { headers: { Cookie: `token=${token}` } }
                );

                expect(response.status).toBe(403);
                expect(response.data).toStrictEqual({
                    message: 'unauthorized action',
                });
            });
        });

        describe('When only name is provided as input with token, ', () => {
            it('then status code to be 200', async () => {
                const {
                    token,
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
                    { headers: { Cookie: `token=${token}` } }
                );

                expect(response.status).toBe(200);
                expect(response.data).toStrictEqual({
                    message: 'user update success',
                    user: { id: user.id, email: user.email, name: input.name },
                });
            });
        });
    });

    describe('DELETE /api/v1/users/:userId - Delete user', () => {
        describe('When deleting existing user, token provided, ', () => {
            it('then status code to be 204', async () => {
                const { token, user } = await createAuthenticatedUser(
                    'test@email.com',
                    'Aa1!abcd'
                );

                const response = await axiosClient.delete(
                    `/api/v1/users/${user.id}`,
                    { headers: { Cookie: `token=${token}` } }
                );

                expect(response.status).toBe(204);
            });
        });

        describe('When deleting existing user, no token provided, ', () => {
            it('then status code to be 401', async () => {
                const { token, user } = await createAuthenticatedUser(
                    'test@email.com',
                    'Aa1!abcd'
                );

                const response = await axiosClient.delete(
                    `/api/v1/users/${user.id}`
                );

                expect(response.status).toBe(401);
                expect(response.data).toStrictEqual({
                    message: 'unauthenticated action',
                });
            });
        });

        describe('When trying to delete the same user twice, ', () => {
            it('then status code to be 404', async () => {
                const { token, user } = await createAuthenticatedUser(
                    'test@email.com',
                    'Aa1!abcd'
                );

                await axiosClient.delete(`/api/v1/users/${user.id}`, {
                    headers: { Cookie: `token=${token}` },
                });
                const response = await axiosClient.delete(
                    `/api/v1/users/${user.id}`,
                    { headers: { Cookie: `token=${token}` } }
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
                const { token: token1, user: user1 } =
                    await createAuthenticatedUser(
                        'test1@email.com',
                        'Aa1!abcd'
                    );
                const { token: token2, user: user2 } =
                    await createAuthenticatedUser(
                        'test2@email.com',
                        'Aa1!abcd'
                    );

                const response = await axiosClient.delete(
                    `/api/v1/users/${user1.id}`,
                    { headers: { Cookie: `token=${token2}` } }
                );

                expect(response.status).toBe(403);
                expect(response.data).toStrictEqual({
                    message: 'unauthorized action',
                });
            });
        });
    });

    describe('PATCH /api/v1/users/:userId/password - Update user password', () => {
        describe('When correct password is provided,', () => {
            it('then password is updated, status code to be 204', async () => {
                const {
                    token,
                    user,
                    input: userCreationInput,
                } = await createAuthenticatedUser('test@email.com', 'Aa1!abcd');
                const input = {
                    oldPassword: userCreationInput.password,
                    newPassword: 'Aa1!abcde',
                };

                const response = await axiosClient.patch(
                    `/api/v1/users/${user.id}/password`,
                    input,
                    { headers: { Cookie: `token=${token}` } }
                );

                expect(response.status).toBe(204);
            });
        });

        describe('When wrong password is provided,', () => {
            it('then password is not updated, status code to be 403', async () => {
                const {
                    token,
                    user,
                    input: userCreationInput,
                } = await createAuthenticatedUser('test@email.com', 'Aa1!abcd');
                const input = {
                    oldPassword: userCreationInput.password + 'efgh',
                    newPassword: 'Aa1!abcde',
                };

                const response = await axiosClient.patch(
                    `/api/v1/users/${user.id}/password`,
                    input,
                    { headers: { Cookie: `token=${token}` } }
                );

                expect(response.status).toBe(403);
                expect(response.data).toStrictEqual({
                    message: 'unauthorized action',
                });
            });
        });

        describe('When old password and new password are same,', () => {
            it('then password is not updated, status code to be 400', async () => {
                const {
                    token,
                    user,
                    input: userCreationInput,
                } = await createAuthenticatedUser('test@email.com', 'Aa1!abcd');
                const input = {
                    oldPassword: userCreationInput.password,
                    newPassword: 'Aa1!abcd',
                };

                const response = await axiosClient.patch(
                    `/api/v1/users/${user.id}/password`,
                    input,
                    { headers: { Cookie: `token=${token}` } }
                );

                expect(response.status).toBe(400);
                expect(response.data).toStrictEqual({
                    message: VALIDATION_ERRORS_USER.OLD_NEW_SAME,
                });
            });
        });

        describe('When trying to update password of a different user,', () => {
            it('then password is not updated, status code to be 403', async () => {
                const {
                    token: token1,
                    user: user1,
                    input: userCreationInput1,
                } = await createAuthenticatedUser(
                    'test1@email.com',
                    'Aa1!abcd'
                );
                const {
                    token: token2,
                    user: user2,
                    input: userCreationInput2,
                } = await createAuthenticatedUser(
                    'test2@email.com',
                    'Aa1!abcd'
                );
                const input = {
                    oldPassword: userCreationInput2.password,
                    newPassword: 'Aa1!abcde',
                };

                const response = await axiosClient.patch(
                    `/api/v1/users/${user1.id}/password`,
                    input,
                    { headers: { Cookie: `token=${token2}` } }
                );

                expect(response.status).toBe(403);
                expect(response.data).toStrictEqual({
                    message: 'unauthorized action',
                });
            });
        });
    });
});
