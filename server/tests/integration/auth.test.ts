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

import { VALIDATION_ERRORS_AUTH } from '../../src/modules/v1/auth/auth.schema';

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

describe('[Integration] Auth service API', () => {
    describe('POST /api/v1/auth/register - Register new user', () => {
        describe('When valid email and password is provided as input, ', () => {
            it('then user will be created, status code to be 201', async () => {
                const input = { email: 'email@test.com', password: 'Aa1!abcd' };

                const response = await axiosClient.post(
                    `/api/v1/auth/register`,
                    input
                );
                const data = response.data;

                expect(response.status).toBe(201);
                expect(data).toStrictEqual({
                    // message here is predictable - as returned by the controller
                    message: 'Created: user',
                    data: {
                        user: { id: 1, email: input.email, name: null },
                    },
                });
            });
        });

        describe('When existing email is provided as input, ', () => {
            it('then user will not be created, status code to be 409', async () => {
                // Create a new user
                const input = { email: 'email@test.com', password: 'Aa1!abcd' };
                await axiosClient.post(`/api/v1/auth/register`, input);

                // Try to create another user with same email
                const response = await axiosClient.post(
                    '/api/v1/auth/register',
                    input
                );
                const data = response.data;

                expect(response.status).toBe(409);
                expect(data).toStrictEqual({
                    // message here may be unpredictable - returned by prisma error message generator
                    message: 'Already exists: user email',
                });
            });
        });

        // Input validation errors - integration tests OR unit tests?

        describe('When invalid email is provided as input, ', () => {
            it('then user will not be created, status code to be 400', async () => {
                const input = { email: 'email', password: 'Aa1!abcd' };

                const response = await axiosClient.post(
                    '/api/v1/auth/register',
                    input
                );
                const data = response.data;

                expect(response.status).toBe(400);
                expect(data).toStrictEqual({
                    // message here is being coupled to code from src
                    // message: VALIDATION_ERRORS_USER.EMAIL_VALID,
                    message: 'Validation error',
                    error: [
                        {
                            field: 'email',
                            message: VALIDATION_ERRORS_AUTH.EMAIL_VALID,
                        },
                    ],
                });
            });
        });

        describe('When invalid password is provided as input, ', () => {
            it('then user will not be created, status code to be 400', async () => {
                const input = { email: 'email@email.com', password: 'a' };

                const response = await axiosClient.post(
                    '/api/v1/auth/register',
                    input
                );
                const data = response.data;

                expect(response.status).toBe(400);
                expect(data).toStrictEqual({
                    // message: `${VALIDATION_ERRORS_USER.PASSWORD_MIN}, ${VALIDATION_ERRORS_USER.PASSWORD_UPPERCASE}, ${VALIDATION_ERRORS_USER.PASSWORD_NUMERIC}, ${VALIDATION_ERRORS_USER.PASSWORD_SPECIAL}`,
                    message: 'Validation error',
                    error: [
                        {
                            field: 'password',
                            message: VALIDATION_ERRORS_AUTH.PASSWORD_MIN,
                        },
                        {
                            field: 'password',
                            message: VALIDATION_ERRORS_AUTH.PASSWORD_UPPERCASE,
                        },
                        {
                            field: 'password',
                            message: VALIDATION_ERRORS_AUTH.PASSWORD_NUMERIC,
                        },
                        {
                            field: 'password',
                            message: VALIDATION_ERRORS_AUTH.PASSWORD_SPECIAL,
                        },
                    ],
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

                const response = await axiosClient.post(
                    '/api/v1/auth/register',
                    input
                );
                const data = response.data;

                expect(response.status).toBe(400);
                expect(data).toStrictEqual({
                    // message: VALIDATION_ERRORS_USER.UNRECOGNIZED,
                    message: 'Validation error',
                    error: [
                        {
                            message: VALIDATION_ERRORS_AUTH.UNRECOGNIZED,
                            field: 'unrecognized',
                        },
                    ],
                });
            });
        });
    });

    describe('POST /api/v1/auth/login - Login user', () => {
        describe('When valid email and correct password is provided, ', () => {
            it('then user is logged in with token, status code to be 200', async () => {
                // Create a new user
                const input = {
                    email: 'email@email.com',
                    password: 'Aa1!abcd',
                };
                await axiosClient.post('/api/v1/auth/register', input);

                // Login
                const response = await axiosClient.post(
                    '/api/v1/auth/login',
                    input
                );
                const data = response.data;

                expect(response.status).toBe(200);
                expect(data).toStrictEqual({
                    message: 'Logged in',
                    data: {
                        user: { email: input.email, id: 1, name: null },
                    },
                });
                expect(response.headers['set-cookie']?.[0]).toMatch(
                    /accessToken/
                );
                expect(response.headers['set-cookie']?.[0]).toMatch(/HttpOnly/);
                expect(response.headers['set-cookie']?.[1]).toMatch(
                    /refreshToken/
                );
                expect(response.headers['set-cookie']?.[1]).toMatch(
                    /Path=\/api\/v1\/auth/
                );
            });
        });

        describe('When valid email and incorrect password is provided, ', () => {
            it('then user is not logged, status code to be 401', async () => {
                // Create a new user
                const input = {
                    email: 'email@email.com',
                    password: 'Aa1!abcd',
                };
                await axiosClient.post('/api/v1/auth/login', input);

                // Login
                const response = await axiosClient.post('/api/v1/auth/login', {
                    email: 'email@email.com',
                    password: 'wrong-password-A1!',
                });
                const data = response.data;

                expect(response.status).toBe(401);
                expect(data).toStrictEqual({
                    message: 'Invalid credentials',
                });
                expect(response.headers['set-cookie']?.[0]).toBe(undefined);
            });
        });

        describe('When a non existing user tries to log in, ', () => {
            it('then status code to be 401', async () => {
                const response = await axiosClient.post('/api/v1/auth/login', {
                    email: 'email@email.com',
                    password: 'wrong-password-A1!',
                });
                const data = response.data;

                expect(response.status).toBe(401);
                expect(data).toStrictEqual({
                    message: 'Invalid credentials',
                });
                expect(response.headers['set-cookie']?.[0]).toBe(undefined);
            });
        });
    });

    describe('PATCH /api/v1/auth/password - Update user password', () => {
        describe('When correct password is provided,', () => {
            it('then password is updated, status code to be 200', async () => {
                const { accessToken, input: userCreationInput } =
                    await createAuthenticatedUser('test@email.com', 'Aa1!abcd');
                const input = {
                    oldPassword: userCreationInput.password,
                    newPassword: 'Aa1!abcde',
                };

                const response = await axiosClient.patch(
                    `/api/v1/auth/password`,
                    input,
                    { headers: { Cookie: `accessToken=${accessToken}` } }
                );

                expect(response.status).toBe(200);
                expect(response.data).toStrictEqual({
                    message: 'Updated: user password',
                });
            });
        });

        describe('When wrong password is provided,', () => {
            it('then password is not updated, status code to be 403', async () => {
                const {
                    accessToken,
                    user,
                    input: userCreationInput,
                } = await createAuthenticatedUser('test@email.com', 'Aa1!abcd');
                const input = {
                    oldPassword: userCreationInput.password + 'efgh',
                    newPassword: 'Aa1!abcde',
                };

                const response = await axiosClient.patch(
                    `/api/v1/auth/password`,
                    input,
                    { headers: { Cookie: `accessToken=${accessToken}` } }
                );

                expect(response.status).toBe(403);
                expect(response.data).toStrictEqual({
                    message: 'Unauthorized',
                });
            });
        });

        describe('When old password and new password are same,', () => {
            it('then password is not updated, status code to be 400', async () => {
                const {
                    accessToken,
                    user,
                    input: userCreationInput,
                } = await createAuthenticatedUser('test@email.com', 'Aa1!abcd');
                const input = {
                    oldPassword: userCreationInput.password,
                    newPassword: 'Aa1!abcd',
                };

                const response = await axiosClient.patch(
                    `/api/v1/auth/password`,
                    input,
                    { headers: { Cookie: `accessToken=${accessToken}` } }
                );

                expect(response.status).toBe(400);
                expect(response.data).toStrictEqual({
                    // message: VALIDATION_ERRORS_USER.OLD_NEW_SAME,
                    message: 'Validation error',
                    error: [{ message: VALIDATION_ERRORS_AUTH.OLD_NEW_SAME }],
                });
            });
        });
    });
});
