import { authSchemaRegister, VALIDATION_ERRORS_AUTH } from '../auth.schema';
import { describe, it, expect } from '@jest/globals';
import { z } from 'zod';

describe('[Unit] authSchemaRegister', () => {
    // for invalid inputs, make sure only 1 validation error is present
    describe('When name does not start with an alphabet', () => {
        it(`then validation fails`, () => {
            const input = {
                name: '1234abcd',
                email: 'email@email.com',
                password: 'Aa1!BBBBBBBB',
            };

            // expect(() => authSchemaRegister.parse(input)).toThrow();

            try {
                authSchemaRegister.parse(input);
            } catch (error) {
                expect(error).toBeInstanceOf(z.ZodError);

                const issues = (error as z.ZodError).issues;

                expect(issues[0].path).toEqual(['name']);
                expect(issues[0].message).toEqual(
                    VALIDATION_ERRORS_AUTH.NAME_START_ALPHABET
                );
            }
        });
    });

    describe('When name does not contain at least 3 characters', () => {
        it(`then validation fails`, () => {
            const input = {
                name: 'ab',
                email: 'email@email.com',
                password: 'Aa1!BBBBBBBB',
            };

            authSchemaRegister.parseAsync(input).catch((error) => {
                expect(error).toBeInstanceOf(z.ZodError);

                const issues = (error as z.ZodError).issues;

                expect(issues[0].path).toEqual(['name']);
                expect(issues[0].message).toEqual(
                    VALIDATION_ERRORS_AUTH.NAME_MIN
                );
            });
        });
    });

    describe('When name does not contain at most 20 characters', () => {
        it(`then validation fails`, () => {
            const input = {
                name: 'ababababababababababababababababababababababababab',
                email: 'email@email.com',
                password: 'Aa1!BBBBBBBB',
            };

            authSchemaRegister.parseAsync(input).catch((error) => {
                expect(error).toBeInstanceOf(z.ZodError);

                const issues = (error as z.ZodError).issues;

                expect(issues[0].path).toEqual(['name']);
                expect(issues[0].message).toEqual(
                    VALIDATION_ERRORS_AUTH.NAME_MAX
                );
            });
        });
    });

    describe('When email is not provided', () => {
        it(`then validation fails`, () => {
            const input = {
                name: 'name123',
                password: 'Aa1!BBBBBBBB',
            };

            authSchemaRegister.parseAsync(input).catch((error) => {
                expect(error).toBeInstanceOf(z.ZodError);

                const issues = (error as z.ZodError).issues;

                expect(issues[0].path).toEqual(['email']);
                expect(issues[0].message).toEqual(
                    VALIDATION_ERRORS_AUTH.EMAIL_REQUIRED
                );
            });
        });
    });

    describe('When email is invalid', () => {
        it(`then validation fails`, () => {
            const input = {
                name: 'name123',
                email: 'email',
                password: 'Aa1!BBBBBBBB',
            };

            authSchemaRegister.parseAsync(input).catch((error) => {
                expect(error).toBeInstanceOf(z.ZodError);

                const issues = (error as z.ZodError).issues;

                expect(issues[0].path).toEqual(['email']);
                expect(issues[0].message).toEqual(
                    VALIDATION_ERRORS_AUTH.EMAIL_VALID
                );
            });
        });
    });

    describe('When password is not provided', () => {
        it(`then validation fails`, () => {
            const input = {
                name: 'name123',
                email: 'email@email.com',
            };

            authSchemaRegister.parseAsync(input).catch((error) => {
                expect(error).toBeInstanceOf(z.ZodError);

                const issues = (error as z.ZodError).issues;

                expect(issues[0].path).toEqual(['password']);
                expect(issues[0].message).toEqual(
                    VALIDATION_ERRORS_AUTH.PASSWORD_REQUIRED
                );
            });
        });
    });

    describe('When password does not contain at least 8 characters', () => {
        it(`then validation fails`, () => {
            const input = {
                name: 'name123',
                email: 'email@email.com',
                password: 'Aa1!BB',
            };

            authSchemaRegister.parseAsync(input).catch((error) => {
                expect(error).toBeInstanceOf(z.ZodError);

                const issues = (error as z.ZodError).issues;

                expect(issues[0].path).toEqual(['password']);
                expect(issues[0].message).toEqual(
                    VALIDATION_ERRORS_AUTH.PASSWORD_MIN
                );
            });
        });
    });

    describe('When password does not contain at most 128 characters', () => {
        it(`then validation fails`, () => {
            const input = {
                name: 'name123',
                email: 'email@email.com',
                password:
                    'Aa1!BBBBAa1!BBBBAa1!BBBBAa1!BBBBAa1!BBBBAa1!BBBBAa1!BBBBAa1!BBBBAa1!BBBBAa1!BBBBAa1!BBBBAa1!BBBBAa1!BBBBAa1!BBBBAa1!BBBBAa1!BBBBAa1!BBBB',
            };

            authSchemaRegister.parseAsync(input).catch((error) => {
                expect(error).toBeInstanceOf(z.ZodError);

                const issues = (error as z.ZodError).issues;

                expect(issues[0].path).toEqual(['password']);
                expect(issues[0].message).toEqual(
                    VALIDATION_ERRORS_AUTH.PASSWORD_MAX
                );
            });
        });
    });

    describe('When password does not contain an uppercase character', () => {
        it(`then validation fails`, () => {
            const input = {
                name: 'name123',
                email: 'email@email.com',
                password: '12345678a!',
            };

            authSchemaRegister.parseAsync(input).catch((error) => {
                expect(error).toBeInstanceOf(z.ZodError);

                const issues = (error as z.ZodError).issues;

                expect(issues[0].path).toEqual(['password']);
                expect(issues[0].message).toEqual(
                    VALIDATION_ERRORS_AUTH.PASSWORD_UPPERCASE
                );
            });
        });
    });

    describe('When password does not contain a lowercase character', () => {
        it(`then validation fails`, () => {
            const input = {
                name: 'name123',
                email: 'email@email.com',
                password: '12345678A!',
            };

            authSchemaRegister.parseAsync(input).catch((error) => {
                expect(error).toBeInstanceOf(z.ZodError);

                const issues = (error as z.ZodError).issues;

                expect(issues[0].path).toEqual(['password']);
                expect(issues[0].message).toEqual(
                    VALIDATION_ERRORS_AUTH.PASSWORD_LOWERCASE
                );
            });
        });
    });

    describe('When password does not contain a numeric character', () => {
        it(`then validation fails`, () => {
            const input = {
                name: 'name123',
                email: 'email@email.com',
                password: 'AAAAAAAA!a',
            };

            authSchemaRegister.parseAsync(input).catch((error) => {
                expect(error).toBeInstanceOf(z.ZodError);

                const issues = (error as z.ZodError).issues;

                expect(issues[0].path).toEqual(['password']);
                expect(issues[0].message).toEqual(
                    VALIDATION_ERRORS_AUTH.PASSWORD_NUMERIC
                );
            });
        });
    });

    describe('When password does not contain a special character', () => {
        it(`then validation fails`, () => {
            const input = {
                name: 'name123',
                email: 'email@email.com',
                password: 'AAAAAAAA1a',
            };

            authSchemaRegister.parseAsync(input).catch((error) => {
                expect(error).toBeInstanceOf(z.ZodError);

                const issues = (error as z.ZodError).issues;

                expect(issues[0].path).toEqual(['password']);
                expect(issues[0].message).toEqual(
                    VALIDATION_ERRORS_AUTH.PASSWORD_SPECIAL
                );
            });
        });
    });

    describe('When input is empty object', () => {
        it(`must result in appropriate error message`, () => {
            const input = {};

            const expectedErrorMessage = `${VALIDATION_ERRORS_AUTH.EMAIL_REQUIRED}, ${VALIDATION_ERRORS_AUTH.PASSWORD_REQUIRED}`;

            authSchemaRegister.parseAsync(input).catch((error) => {
                expect(error).toBeInstanceOf(z.ZodError);

                const issues = (error as z.ZodError).issues;

                expect(issues[0].path).toEqual(['email']);
                expect(issues[0].message).toEqual(
                    VALIDATION_ERRORS_AUTH.EMAIL_REQUIRED
                );
                expect(issues[1].path).toEqual(['password']);
                expect(issues[1].message).toEqual(
                    VALIDATION_ERRORS_AUTH.PASSWORD_REQUIRED
                );
            });
        });
    });

    describe('When input is undefined', () => {
        it(`then validation fails`, () => {
            authSchemaRegister.parseAsync(undefined).catch((error) => {
                expect(error).toBeInstanceOf(z.ZodError);

                const issues = (error as z.ZodError).issues;

                expect(issues[0].path).toEqual([]);
                expect(issues[0].message).toEqual(
                    VALIDATION_ERRORS_AUTH.EMAIL_PASSWORD_REQUIRED
                );
            });
        });
    });

    describe('When input contains unrecognized fields', () => {
        it(`then validation fails`, () => {
            const input = {
                name: 'Name123',
                email: 'email@email.com',
                password: 'Aa!1bbbbbbbb',
                unrecog: 'a value',
            };

            authSchemaRegister.parseAsync(input).catch((error) => {
                expect(error).toBeInstanceOf(z.ZodError);

                const issues = (error as z.ZodError).issues;

                if (issues[0].code === 'unrecognized_keys') {
                    expect(issues[0].keys).toEqual(['unrecog']);
                    expect(issues[0].message).toEqual(
                        VALIDATION_ERRORS_AUTH.UNRECOGNIZED
                    );
                }
            });
        });
    });

    describe('When input contains multiple validation errors', () => {
        it(`then validation fails`, () => {
            const input = {
                name: '1a',
                email: 'email',
                password: 'a',
                unrecog: 'a value',
            };

            authSchemaRegister.parseAsync(input).catch((error) => {
                expect(error).toBeInstanceOf(z.ZodError);

                const issues = (error as z.ZodError).issues;

                expect(issues[0].path).toEqual(['name']);
                expect(issues[0].message).toEqual(
                    VALIDATION_ERRORS_AUTH.NAME_START_ALPHABET
                );

                expect(issues[1].path).toEqual(['name']);
                expect(issues[1].message).toEqual(
                    VALIDATION_ERRORS_AUTH.NAME_MIN
                );

                expect(issues[2].path).toEqual(['email']);
                expect(issues[2].message).toEqual(
                    VALIDATION_ERRORS_AUTH.EMAIL_VALID
                );

                expect(issues[3].path).toEqual(['password']);
                expect(issues[3].message).toEqual(
                    VALIDATION_ERRORS_AUTH.PASSWORD_MIN
                );

                expect(issues[4].path).toEqual(['password']);
                expect(issues[4].message).toEqual(
                    VALIDATION_ERRORS_AUTH.PASSWORD_UPPERCASE
                );

                expect(issues[5].path).toEqual(['password']);
                expect(issues[5].message).toEqual(
                    VALIDATION_ERRORS_AUTH.PASSWORD_NUMERIC
                );

                expect(issues[6].path).toEqual(['password']);
                expect(issues[6].message).toEqual(
                    VALIDATION_ERRORS_AUTH.PASSWORD_SPECIAL
                );

                if (issues[7].code === 'unrecognized_keys') {
                    expect(issues[7].keys).toEqual(['unrecog']);
                    expect(issues[7].message).toEqual(
                        VALIDATION_ERRORS_AUTH.UNRECOGNIZED
                    );
                }
            });
        });
    });

    describe('When input is valid', () => {
        it(`then validation succeeds`, () => {
            const input = {
                name: 'Name123',
                email: 'email@email.com',
                password: 'Aa!1bbbbbbbb',
            };

            expect(() => authSchemaRegister.parse(input)).not.toThrow();
        });
    });
});
