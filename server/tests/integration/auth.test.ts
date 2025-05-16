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
import config from '../../src/config';

let server: Server;
let axiosClient: AxiosInstance;

beforeAll(() => {
    server = initializeServer();
    axiosClient = getAxiosClient();
});

beforeEach(async () => {
    await safeTruncateTables();
});

afterAll(async () => {
    await safeTruncateTables();
    server.close();
});

describe('[Integration] Auth service API', () => {
    describe('POST /api/v1/auth/register - Register new user', () => {
        // Input validation errors - integration tests OR unit tests?
        // name - string type, starts with letter, min 3, max 20
        // email - string type, required, valid
        // password - string type, required, min 8, max 128, uppercase, lowercase, numeric, special

        // check: string type of name, email and password
        describe('When input contains invalid types of name, email and password,', () => {
            it('then user will not be created, status code to be 400', async () => {
                const input = { email: 1, password: 1, name: 1 };

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
                    // order of error matters
                    error: [
                        {
                            field: 'name',
                            message: VALIDATION_ERRORS_AUTH.NAME_INVALID_TYPE,
                        },
                        {
                            field: 'email',
                            message: VALIDATION_ERRORS_AUTH.EMAIL_INVALID_TYPE,
                        },
                        {
                            field: 'password',
                            message:
                                VALIDATION_ERRORS_AUTH.PASSWORD_INVALID_TYPE,
                        },
                    ],
                });
                expect(response.headers['set-cookie']?.[0]).toBe(undefined);
                expect(response.headers['set-cookie']?.[1]).toBe(undefined);
            });
        });

        // check: name starts with letter, name min 3, email and password required
        describe('When input contains name starting with number and less than 3 characters, no email and password,', () => {
            it('then user will not be created, status code to be 400', async () => {
                const input = { name: '1a' };

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
                            field: 'name',
                            message: VALIDATION_ERRORS_AUTH.NAME_START_ALPHABET,
                        },
                        {
                            field: 'name',
                            message: VALIDATION_ERRORS_AUTH.NAME_MIN,
                        },

                        {
                            field: 'email',
                            message: VALIDATION_ERRORS_AUTH.EMAIL_REQUIRED,
                        },
                        {
                            field: 'password',
                            message: VALIDATION_ERRORS_AUTH.PASSWORD_REQUIRED,
                        },
                    ],
                });
                expect(response.headers['set-cookie']?.[0]).toBe(undefined);
                expect(response.headers['set-cookie']?.[1]).toBe(undefined);
            });
        });

        // check: name max 20, email valid, password min 8, lowercase, numeric, special
        describe('When input contains name with more than 20 characters, invalid email and invalid password,', () => {
            it('then user will not be created, status code to be 400', async () => {
                const input = {
                    name: 'invalid_name_invalid_name_invalid_name_invalid_name',
                    email: 'invalidemail',
                    password: 'A',
                };

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
                            field: 'name',
                            message: VALIDATION_ERRORS_AUTH.NAME_MAX,
                        },
                        {
                            field: 'email',
                            message: VALIDATION_ERRORS_AUTH.EMAIL_VALID,
                        },

                        {
                            field: 'password',
                            message: VALIDATION_ERRORS_AUTH.PASSWORD_MIN,
                        },
                        {
                            field: 'password',
                            message: VALIDATION_ERRORS_AUTH.PASSWORD_LOWERCASE,
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
                expect(response.headers['set-cookie']?.[0]).toBe(undefined);
                expect(response.headers['set-cookie']?.[1]).toBe(undefined);
            });
        });

        // check: password max 128, uppercase
        describe('When input contains valid name, invalid email and invalid password,', () => {
            it('then user will not be created, status code to be 400', async () => {
                const input = {
                    name: 'Valid name',
                    email: 'valid@email.com',
                    password:
                        'ahugepassword1!ahugepassword1ahugepassword1ahugepassword1ahugepassword1ahugepassword1ahugepassword1ahugepassword1ahugepassword1ahugepassword1ahugepassword1ahugepassword1ahugepassword1ahugepassword1ahugepassword1ahugepassword1ahugepassword1ahugepassword1ahugepassword1ahugepassword1ahugepassword1ahugepassword1ahugepassword1ahugepassword1ahugepassword1ahugepassword1',
                };

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
                            field: 'password',
                            message: VALIDATION_ERRORS_AUTH.PASSWORD_MAX,
                        },
                        {
                            field: 'password',
                            message: VALIDATION_ERRORS_AUTH.PASSWORD_UPPERCASE,
                        },
                    ],
                });
                expect(response.headers['set-cookie']?.[0]).toBe(undefined);
                expect(response.headers['set-cookie']?.[1]).toBe(undefined);
            });
        });

        // check: unrecognized
        describe('When input contains valid email and valid password, but unrecognized fields,', () => {
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
                expect(response.headers['set-cookie']?.[0]).toBe(undefined);
                expect(response.headers['set-cookie']?.[1]).toBe(undefined);
            });
        });

        // check: body undefined
        describe('When input body itself is undefined,', () => {
            it('then user will not be created, status code to be 400', async () => {
                const input = undefined;

                const response = await axiosClient.post(
                    '/api/v1/auth/register'
                );
                const data = response.data;

                expect(response.status).toBe(400);

                // even though no input is sent, axios sends {} anyway?
                // expect(data).toStrictEqual({
                //     // message: VALIDATION_ERRORS_USER.UNRECOGNIZED,
                //     message: 'Validation error',
                //     error: [
                //         {
                //             message:
                //                 VALIDATION_ERRORS_AUTH.EMAIL_PASSWORD_REQUIRED,
                //         },
                //     ],
                // });
                expect(response.headers['set-cookie']?.[0]).toBe(undefined);
                expect(response.headers['set-cookie']?.[1]).toBe(undefined);
            });
        });

        describe('When input contains valid email and valid password, ', () => {
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

                // check access token cookie
                expect(response.headers['set-cookie']?.[0]).toMatch(
                    /accessToken/
                );
                expect(response.headers['set-cookie']?.[0]).toMatch(/HttpOnly/);
                expect(response.headers['set-cookie']?.[0]).toMatch(/Strict/);

                // check refresh token cookie
                expect(response.headers['set-cookie']?.[1]).toMatch(
                    /refreshToken/
                );
                expect(response.headers['set-cookie']?.[1]).toMatch(/HttpOnly/);
                expect(response.headers['set-cookie']?.[1]).toMatch(/Strict/);
                expect(response.headers['set-cookie']?.[1]).toMatch(
                    /Path=\/api\/v1\/auth/
                );
            });
        });

        describe('When input contains email that already exists,', () => {
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
                expect(response.headers['set-cookie']?.[0]).toBe(undefined);
                expect(response.headers['set-cookie']?.[1]).toBe(undefined);
            });
        });
    });

    describe('POST /api/v1/auth/login - Login user', () => {
        // Input validation tests
        // email - string type, required, valid
        // password - string type, required

        // check: string type of email and password
        describe('When input contains invalid types of email and password,', () => {
            it('then user will not be logged in, status code to be 400', async () => {
                const input = { email: 1, password: 1 };

                const response = await axiosClient.post(
                    '/api/v1/auth/login',
                    input
                );
                const data = response.data;

                expect(response.status).toBe(400);
                expect(data).toStrictEqual({
                    // message here is being coupled to code from src
                    // message: VALIDATION_ERRORS_USER.EMAIL_VALID,
                    message: 'Validation error',
                    // order of error matters
                    error: [
                        {
                            field: 'email',
                            message: VALIDATION_ERRORS_AUTH.EMAIL_INVALID_TYPE,
                        },
                        {
                            field: 'password',
                            message:
                                VALIDATION_ERRORS_AUTH.PASSWORD_INVALID_TYPE,
                        },
                    ],
                });
                expect(response.headers['set-cookie']?.[0]).toBe(undefined);
                expect(response.headers['set-cookie']?.[1]).toBe(undefined);
            });
        });

        // check: email and password required
        describe('When input contains no email and password,', () => {
            it('then user will not be logged in, status code to be 400', async () => {
                const input = {};

                const response = await axiosClient.post(
                    '/api/v1/auth/login',
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
                            message: VALIDATION_ERRORS_AUTH.EMAIL_REQUIRED,
                        },
                        {
                            field: 'password',
                            message: VALIDATION_ERRORS_AUTH.PASSWORD_REQUIRED,
                        },
                    ],
                });
                expect(response.headers['set-cookie']?.[0]).toBe(undefined);
                expect(response.headers['set-cookie']?.[1]).toBe(undefined);
            });
        });

        // check: invalid email and unrecognized fields
        describe('When input contains invalid email, and unrecognized fields,', () => {
            it('then user will not be logged in, status code to be 400', async () => {
                const input = {
                    name: 'name',
                    email: 'invalidemail',
                    password: 'A',
                };

                const response = await axiosClient.post(
                    '/api/v1/auth/login',
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
                        {
                            field: 'name',
                            message: VALIDATION_ERRORS_AUTH.UNRECOGNIZED,
                        },
                    ],
                });
                expect(response.headers['set-cookie']?.[0]).toBe(undefined);
                expect(response.headers['set-cookie']?.[1]).toBe(undefined);
            });
        });

        // check: body undefined
        describe('When input body itself is undefined,', () => {
            it('then user will not be logged in, status code to be 400', async () => {
                const input = undefined;

                const response = await axiosClient.post('/api/v1/auth/login');
                const data = response.data;

                expect(response.status).toBe(400);

                // even though no input is sent, axios sends {} anyway?
                // expect(data).toStrictEqual({
                //     // message: VALIDATION_ERRORS_USER.UNRECOGNIZED,
                //     message: 'Validation error',
                //     error: [
                //         {
                //             message:
                //                 VALIDATION_ERRORS_AUTH.EMAIL_PASSWORD_REQUIRED,
                //         },
                //     ],
                // });
                expect(response.headers['set-cookie']?.[0]).toBe(undefined);
                expect(response.headers['set-cookie']?.[1]).toBe(undefined);
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
                expect(response.headers['set-cookie']?.[1]).toBe(undefined);
            });
        });

        describe('When input contains valid existing email and incorrect password is provided,', () => {
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
                expect(response.headers['set-cookie']?.[1]).toBe(undefined);
            });
        });

        describe('When input contains valid email and password, and user exists', () => {
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
                // check access token cookie
                expect(response.headers['set-cookie']?.[0]).toMatch(
                    /accessToken/
                );
                expect(response.headers['set-cookie']?.[0]).toMatch(/HttpOnly/);
                expect(response.headers['set-cookie']?.[0]).toMatch(/Strict/);

                // check refresh token cookie
                expect(response.headers['set-cookie']?.[1]).toMatch(
                    /refreshToken/
                );
                expect(response.headers['set-cookie']?.[1]).toMatch(/HttpOnly/);
                expect(response.headers['set-cookie']?.[1]).toMatch(/Strict/);
                expect(response.headers['set-cookie']?.[1]).toMatch(
                    /Path=\/api\/v1\/auth/
                );
            });
        });
    });

    describe('PATCH /api/v1/auth/password - Update user password', () => {
        // Input validation tests
        // oldPassword - string, required, min, max, upper, lower, special, number
        // newPassword - string, required, min, max, upper, lower, special, number
        // unrecognized fields, old and new password same

        // check: old and new password string type
        describe('When input contains passwords of invalid type,', () => {
            it('then password is not updated, status code to be 400', async () => {
                const { accessToken, input: userCreationInput } =
                    await createAuthenticatedUser('test@email.com', 'Aa1!abcd');
                const input = { oldPassword: 1, newPassword: 1 };

                const response = await axiosClient.patch(
                    `/api/v1/auth/password`,
                    input,
                    {
                        headers: { Cookie: `accessToken=${accessToken}` },
                    }
                );

                expect(response.status).toBe(400);
                expect(response.data).toStrictEqual({
                    message: 'Validation error',
                    error: [
                        {
                            field: 'oldPassword',
                            message:
                                VALIDATION_ERRORS_AUTH.PASSWORD_INVALID_TYPE,
                        },
                        {
                            field: 'newPassword',
                            message:
                                VALIDATION_ERRORS_AUTH.PASSWORD_INVALID_TYPE,
                        },
                    ],
                });
                expect(response.headers['set-cookie']?.[0]).toBe(undefined);
                expect(response.headers['set-cookie']?.[1]).toBe(undefined);
            });
        });

        // check: required old and new password
        describe('When input contains no passwords,', () => {
            it('then password is not updated, status code to be 400', async () => {
                const { accessToken, input: userCreationInput } =
                    await createAuthenticatedUser('test@email.com', 'Aa1!abcd');
                const input = {};

                const response = await axiosClient.patch(
                    `/api/v1/auth/password`,
                    input,
                    {
                        headers: { Cookie: `accessToken=${accessToken}` },
                    }
                );

                expect(response.status).toBe(400);
                expect(response.data).toStrictEqual({
                    message: 'Validation error',
                    error: [
                        {
                            field: 'oldPassword',
                            message: VALIDATION_ERRORS_AUTH.PASSWORD_REQUIRED,
                        },
                        {
                            field: 'newPassword',
                            message: VALIDATION_ERRORS_AUTH.PASSWORD_REQUIRED,
                        },
                    ],
                });
                expect(response.headers['set-cookie']?.[0]).toBe(undefined);
                expect(response.headers['set-cookie']?.[1]).toBe(undefined);
            });
        });

        // check: old and new passwords constraints check
        describe("When input contains passwords that don't pass constraint checks,", () => {
            it('then password is not updated, status code to be 400', async () => {
                const { accessToken, input: userCreationInput } =
                    await createAuthenticatedUser('test@email.com', 'Aa1!abcd');
                const input = {
                    oldPassword: 'A',
                    newPassword:
                        'a1!abcdeabcdeabcdeabcdeabcdeabcdeabcdeabcdeabcdeabcdeabcdeabcdeabcdeabcdeabcdeabcdeabcdeabcdeabcdeabcdeabcdeabcdeabcdeabcdeabcdeabcdeabcdeabcdeabcdeabcdeabcdeabcdeabcdeabcdeabcdeabcdeabcdeabcdeabcdeabcdeabcdeabcdeabcdeabcdeabcdeabcdeabcdeabcdeabcdeabcdeabcdeabcdeabcdeabcdeabcdeabcdeabcdeabcdeabcdeabcdeabcdeabcdeabcdeabcdeabcdeabcdeabcdeabcdeabcdeabcdeabcdeabcdeabcdeabcdeabcdeabcdeabcdeabcdeabcdeabcdeabcdeabcdeabcdeabcdeabcdeabcdeabcdeabcdeabcdeabcdeabcdeabcdeabcdeabcdeabcdeabcdeabcdeabcdeabcdeabcdeabcdeabcdeabcdeabcdeabcdeabcdeabcdeabcdeabcdeabcde',
                };

                const response = await axiosClient.patch(
                    `/api/v1/auth/password`,
                    input,
                    {
                        headers: { Cookie: `accessToken=${accessToken}` },
                    }
                );

                expect(response.status).toBe(400);
                expect(response.data).toStrictEqual({
                    message: 'Validation error',
                    error: [
                        {
                            field: 'oldPassword',
                            message: VALIDATION_ERRORS_AUTH.PASSWORD_MIN,
                        },
                        {
                            field: 'oldPassword',
                            message: VALIDATION_ERRORS_AUTH.PASSWORD_LOWERCASE,
                        },
                        {
                            field: 'oldPassword',
                            message: VALIDATION_ERRORS_AUTH.PASSWORD_NUMERIC,
                        },
                        {
                            field: 'oldPassword',
                            message: VALIDATION_ERRORS_AUTH.PASSWORD_SPECIAL,
                        },
                        {
                            field: 'newPassword',
                            message: VALIDATION_ERRORS_AUTH.PASSWORD_MAX,
                        },
                        {
                            field: 'newPassword',
                            message: VALIDATION_ERRORS_AUTH.PASSWORD_UPPERCASE,
                        },
                    ],
                });
                expect(response.headers['set-cookie']?.[0]).toBe(undefined);
                expect(response.headers['set-cookie']?.[1]).toBe(undefined);
            });
        });

        // check: unrecognized fields, old and new password same
        describe('When input contains unrecognized fields, and old password is the same as new password,', () => {
            it('then password is not updated, status code to be 400', async () => {
                const { accessToken, input: userCreationInput } =
                    await createAuthenticatedUser('test@email.com', 'Aa1!abcd');
                const input = {
                    oldPassword: 'Aa1!abcde',
                    newPassword: 'Aa1!abcde',
                    unrecognized: 'Aa1!abcde',
                };

                const response = await axiosClient.patch(
                    `/api/v1/auth/password`,
                    input,
                    {
                        headers: { Cookie: `accessToken=${accessToken}` },
                    }
                );

                expect(response.status).toBe(400);
                expect(response.data).toStrictEqual({
                    message: 'Validation error',
                    error: [
                        {
                            field: 'unrecognized',
                            message: VALIDATION_ERRORS_AUTH.UNRECOGNIZED,
                        },
                        {
                            message: VALIDATION_ERRORS_AUTH.OLD_NEW_SAME,
                        },
                    ],
                });
                expect(response.headers['set-cookie']?.[0]).toBe(undefined);
                expect(response.headers['set-cookie']?.[1]).toBe(undefined);
            });
        });

        // check: unrecognized fields, old and new password same
        describe('When input body itself is undefined,', () => {
            it('then password is not updated, status code to be 400', async () => {
                const { accessToken, input: userCreationInput } =
                    await createAuthenticatedUser('test@email.com', 'Aa1!abcd');
                const input = undefined;
                const response = await axiosClient.patch(
                    `/api/v1/auth/password`,
                    input,
                    {
                        headers: { Cookie: `accessToken=${accessToken}` },
                    }
                );

                expect(response.status).toBe(400);
                // expect(response.data).toStrictEqual({
                //     message: 'Validation error',
                //     error: [
                //         {
                //             field: 'unrecognized',
                //             message: VALIDATION_ERRORS_AUTH.UNRECOGNIZED,
                //         },
                //         {
                //             message: VALIDATION_ERRORS_AUTH.OLD_NEW_SAME,
                //         },
                //     ],
                // });
                expect(response.headers['set-cookie']?.[0]).toBe(undefined);
                expect(response.headers['set-cookie']?.[1]).toBe(undefined);
            });
        });

        describe('When user is unauthenticated,', () => {
            it('then password is not updated, status code to be 401', async () => {
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
                    input
                );

                expect(response.status).toBe(401);
                expect(response.data).toStrictEqual({
                    message: 'Unauthenticated',
                });
                expect(response.headers['set-cookie']?.[0]).toBe(undefined);
                expect(response.headers['set-cookie']?.[1]).toBe(undefined);
            });
        });

        describe('When user provides tampered access token,', () => {
            it('then password is not updated, status code to be 401', async () => {
                const {
                    accessToken,
                    user,
                    input: userCreationInput,
                } = await createAuthenticatedUser('test@email.com', 'Aa1!abcd');
                const input = {
                    oldPassword: userCreationInput.password + 'efgh',
                    newPassword: 'Aa1!abcde',
                };
                const tamperedToken = `${accessToken}aeiou`;

                const response = await axiosClient.patch(
                    `/api/v1/auth/password`,
                    input,
                    { headers: { Cookie: `accessToken=${tamperedToken}` } }
                );

                expect(response.status).toBe(401);
                expect(response.data).toStrictEqual({
                    message: 'Unauthenticated',
                });
                expect(response.headers['set-cookie']?.[0]).toBe(undefined);
                expect(response.headers['set-cookie']?.[1]).toBe(undefined);
            });
        });

        describe('When user provides expired access token,', () => {
            it('then password is not updated, status code to be 401', async () => {
                // modify expiry time
                config.JWT_EXPIRY_ACCESS_TOKEN = '1';

                const {
                    accessToken,
                    user,
                    input: userCreationInput,
                } = await createAuthenticatedUser('test@email.com', 'Aa1!abcd');
                const input = {
                    oldPassword: userCreationInput.password + 'efgh',
                    newPassword: 'Aa1!abcde',
                };

                // wait 2 seconds
                await new Promise((resolve) => setTimeout(resolve, 2000));

                // set expiry back to original value
                config.JWT_EXPIRY_ACCESS_TOKEN =
                    process.env.JWT_EXPIRY_ACCESS_TOKEN!;

                const response = await axiosClient.patch(
                    `/api/v1/auth/password`,
                    input,
                    { headers: { Cookie: `accessToken=${accessToken}` } }
                );

                expect(response.status).toBe(401);
                expect(response.data).toStrictEqual({
                    message: 'Unauthenticated',
                });
                expect(response.headers['set-cookie']?.[0]).toBe(undefined);
                expect(response.headers['set-cookie']?.[1]).toBe(undefined);
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
                expect(response.headers['set-cookie']?.[0]).toBe(undefined);
                expect(response.headers['set-cookie']?.[1]).toBe(undefined);
            });
        });

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
                // check access token cookie
                expect(response.headers['set-cookie']?.[0]).toMatch(
                    /accessToken/
                );
                expect(response.headers['set-cookie']?.[0]).toMatch(/HttpOnly/);
                expect(response.headers['set-cookie']?.[0]).toMatch(/Strict/);

                // check refresh token cookie
                expect(response.headers['set-cookie']?.[1]).toMatch(
                    /refreshToken/
                );
                expect(response.headers['set-cookie']?.[1]).toMatch(/HttpOnly/);
                expect(response.headers['set-cookie']?.[1]).toMatch(/Strict/);
                expect(response.headers['set-cookie']?.[1]).toMatch(
                    /Path=\/api\/v1\/auth/
                );
            });
        });
    });

    describe('POST /api/v1/auth/refresh - Refresh access token', () => {
        describe('When no refresh token cookie is provided,', () => {
            it('then no refresh is performed, status code to be 401', async () => {
                const response = await axiosClient.post('/api/v1/auth/refresh');

                expect(response.status).toBe(401);
                expect(response.data).toStrictEqual({
                    message: 'Unauthenticated',
                });
                expect(response.headers['set-cookie']?.[0]).toBe(undefined);
                expect(response.headers['set-cookie']?.[1]).toBe(undefined);
            });
        });

        describe('When refresh token is tampered,', () => {
            it('then no refresh is performed, status code to be 401', async () => {
                const { refreshToken } = await createAuthenticatedUser(
                    'email@email.com',
                    'Aa1!abcd'
                );
                const malformedToken = `${refreshToken}aeiou`;

                const response = await axiosClient.post(
                    '/api/v1/auth/refresh',
                    {},
                    { headers: { Cookie: `refreshToken=${malformedToken}` } }
                );

                expect(response.status).toBe(401);
                expect(response.data).toStrictEqual({
                    message: 'Unauthenticated',
                });
                expect(response.headers['set-cookie']?.[0]).toBe(undefined);
                expect(response.headers['set-cookie']?.[1]).toBe(undefined);
            });
        });

        describe('When refresh token is revoked by user logging out,', () => {
            it('then no refresh is performed, status code to be 401', async () => {
                const { refreshToken } = await createAuthenticatedUser(
                    'email@email.com',
                    'Aa1!abcd'
                );
                await axiosClient.post(
                    '/api/v1/auth/logout',
                    {},
                    { headers: { Cookie: `refreshToken=${refreshToken}` } }
                );

                const response = await axiosClient.post(
                    '/api/v1/auth/refresh',
                    {},
                    { headers: { Cookie: `refreshToken=${refreshToken}` } }
                );

                expect(response.status).toBe(401);
                expect(response.data).toStrictEqual({
                    message: 'Unauthenticated',
                });
                expect(response.headers['set-cookie']?.[0]).toBe(undefined);
                expect(response.headers['set-cookie']?.[1]).toBe(undefined);
            });
        });

        // TODO: how to test expired tokens?
        describe('When refresh token is expired,', () => {
            it('then refresh is not performed, status code to be 401', async () => {
                // manually set expiry
                config.JWT_EXPIRY_REFRESH_TOKEN = '1s';

                const { refreshToken } = await createAuthenticatedUser(
                    'email@email.com',
                    'Aa1!abcd'
                );

                // wait for 2 seconds
                await new Promise((resolve) => setTimeout(resolve, 2000));

                // expiry back to original value
                config.JWT_EXPIRY_REFRESH_TOKEN =
                    process.env.JWT_EXPIRY_REFRESH_TOKEN!;

                const response = await axiosClient.post(
                    '/api/v1/auth/refresh',
                    {},
                    { headers: { Cookie: `refreshToken=${refreshToken}` } }
                );

                expect(response.status).toBe(401);
                expect(response.data).toStrictEqual({
                    message: 'Unauthenticated',
                });
                expect(response.headers['set-cookie']?.[0]).toBe(undefined);
                expect(response.headers['set-cookie']?.[1]).toBe(undefined);
            });
        });

        describe('When refresh token is valid, not expired and not revoked,', () => {
            it('then refresh is performed, new access token and refresh token generated, status code to be 204', async () => {
                const { refreshToken } = await createAuthenticatedUser(
                    'email@email.com',
                    'Aa1!abcd'
                );

                const response = await axiosClient.post(
                    '/api/v1/auth/refresh',
                    {},
                    { headers: { Cookie: `refreshToken=${refreshToken}` } }
                );

                expect(response.status).toBe(204);

                // check access token cookie
                expect(response.headers['set-cookie']?.[0]).toMatch(
                    /accessToken/
                );
                expect(response.headers['set-cookie']?.[0]).toMatch(/HttpOnly/);
                expect(response.headers['set-cookie']?.[0]).toMatch(/Strict/);

                // check refresh token cookie
                expect(response.headers['set-cookie']?.[1]).toMatch(
                    /refreshToken/
                );
                expect(response.headers['set-cookie']?.[1]).toMatch(/HttpOnly/);
                expect(response.headers['set-cookie']?.[1]).toMatch(/Strict/);
                expect(response.headers['set-cookie']?.[1]).toMatch(
                    /Path=\/api\/v1\/auth/
                );
            });
        });
    });

    describe('POST /api/v1/auth/logout - Logout user', () => {
        describe('When no refresh token cookie is provided,', () => {
            it('then user is logged out regardless, status code to be 204', async () => {
                const response = await axiosClient.post('/api/v1/auth/logout');

                expect(response.status).toBe(204);

                // check cleared access token cookie
                expect(response.headers['set-cookie']?.[0]).toMatch(
                    /accessToken/
                );
                expect(response.headers['set-cookie']?.[0]).toMatch(
                    /Thu, 01 Jan 1970 00:00:00 GMT/
                );

                // check cleared refresh token cookie
                expect(response.headers['set-cookie']?.[1]).toMatch(
                    /refreshToken/
                );
                expect(response.headers['set-cookie']?.[1]).toMatch(
                    /Path=\/api\/v1\/auth/
                );
                expect(response.headers['set-cookie']?.[1]).toMatch(
                    /Thu, 01 Jan 1970 00:00:00 GMT/
                );
            });
        });

        describe('When refresh token is tampered,', () => {
            it('then user is logged out regardless, status code to be 204', async () => {
                const { refreshToken } = await createAuthenticatedUser(
                    'email@email.com',
                    'Aa1!abcd'
                );
                const malformedToken = `${refreshToken}aeiou`;

                const response = await axiosClient.post(
                    '/api/v1/auth/logout',
                    {},
                    { headers: { Cookie: `refreshToken=${malformedToken}` } }
                );

                expect(response.status).toBe(204);

                // check cleared access token cookie
                expect(response.headers['set-cookie']?.[0]).toMatch(
                    /accessToken/
                );
                expect(response.headers['set-cookie']?.[0]).toMatch(
                    /Thu, 01 Jan 1970 00:00:00 GMT/
                );

                // check cleared refresh token cookie
                expect(response.headers['set-cookie']?.[1]).toMatch(
                    /refreshToken/
                );
                expect(response.headers['set-cookie']?.[1]).toMatch(
                    /Path=\/api\/v1\/auth/
                );
                expect(response.headers['set-cookie']?.[1]).toMatch(
                    /Thu, 01 Jan 1970 00:00:00 GMT/
                );
            });
        });

        describe('When user provides valid refresh token,', () => {
            it('then refresh token is revoked and user is logged out, status code to be 204', async () => {
                const { refreshToken } = await createAuthenticatedUser(
                    'email@email.com',
                    'Aa1!abcd'
                );

                const response = await axiosClient.post(
                    '/api/v1/auth/logout',
                    {},
                    {
                        headers: {
                            Cookie: `refreshToken=${refreshToken}`,
                        },
                    }
                );

                expect(response.status).toBe(204);

                // check cleared access token cookie
                expect(response.headers['set-cookie']?.[0]).toMatch(
                    /accessToken/
                );
                expect(response.headers['set-cookie']?.[0]).toMatch(
                    /Thu, 01 Jan 1970 00:00:00 GMT/
                );

                // check cleared refresh token cookie
                expect(response.headers['set-cookie']?.[1]).toMatch(
                    /refreshToken/
                );
                expect(response.headers['set-cookie']?.[1]).toMatch(
                    /Path=\/api\/v1\/auth/
                );
                expect(response.headers['set-cookie']?.[1]).toMatch(
                    /Thu, 01 Jan 1970 00:00:00 GMT/
                );
            });
        });

        describe('When user tries to log out twice,', () => {
            it('then user is logged out regardless, status code to be 204', async () => {
                const { refreshToken } = await createAuthenticatedUser(
                    'email@email.com',
                    'Aa1!abcd'
                );

                // first logout
                await axiosClient.post(
                    '/api/v1/auth/logout',
                    {},
                    {
                        headers: {
                            Cookie: `refreshToken=${refreshToken}`,
                        },
                    }
                );

                // 2nd logout, the refreshToken was revoked in the first logout
                const response = await axiosClient.post(
                    '/api/v1/auth/logout',
                    {},
                    {
                        headers: {
                            Cookie: `refreshToken=${refreshToken}`,
                        },
                    }
                );

                expect(response.status).toBe(204);

                // check cleared access token cookie
                expect(response.headers['set-cookie']?.[0]).toMatch(
                    /accessToken/
                );
                expect(response.headers['set-cookie']?.[0]).toMatch(
                    /Thu, 01 Jan 1970 00:00:00 GMT/
                );

                // check cleared refresh token cookie
                expect(response.headers['set-cookie']?.[1]).toMatch(
                    /refreshToken/
                );
                expect(response.headers['set-cookie']?.[1]).toMatch(
                    /Path=\/api\/v1\/auth/
                );
                expect(response.headers['set-cookie']?.[1]).toMatch(
                    /Thu, 01 Jan 1970 00:00:00 GMT/
                );
            });
        });
    });
});
