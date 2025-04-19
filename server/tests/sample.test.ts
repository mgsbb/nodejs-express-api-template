import supertest from 'supertest';
import { expect, describe, it, beforeAll, afterAll } from '@jest/globals';
import app from '../src/app';
import { setupTestDatabase, teardownTestDatabase } from './setup';

import { VALIDATION_ERRORS_SAMPLE } from '../src/modules/v1/sample/sample.schema';

// console.log(1, process.env.NODE_ENV);

beforeAll(async () => {
    // console.log('beforeAll');
    await setupTestDatabase();
});

afterAll(async () => {
    // console.log('afterAll');
    await teardownTestDatabase();
});

describe('API sample', () => {
    describe('GET /sample -- before creating a sample', () => {
        it('success -> json with message and empty samples array', async () => {
            const response = await supertest(app)
                .get('/api/v1/sample')
                .expect(200)
                .expect('Content-Type', /json/);
            // .then((response) => {
            //     expect(response.body).toEqual(
            //         expect.objectContaining({
            //             message: expect.any(String),
            //         })
            //     );
            // });

            const data = response.body;

            expect(data.message).toEqual(expect.any(String));
            expect(data.samples).toStrictEqual([]);
        });
    });

    describe('POST /sample -- valid name and valid email', () => {
        it('success -> json with message and createdSample', async () => {
            const payload = { name: 'testName', email: 'test@email.com' };

            const response = await supertest(app)
                .post('/api/v1/sample')
                .send(payload)
                .expect(201)
                .expect('Content-Type', /json/);

            const data = response.body;

            expect(data.message).toEqual(expect.any(String));
            expect(data.createdSample).toEqual(
                expect.objectContaining({
                    id: expect.any(Number),
                    name: payload.name,
                    email: payload.email,
                })
            );
        });
    });

    describe('POST /sample -- omit sending the body', () => {
        it('failure -> json with validation error message', async () => {
            const payload = {};

            const response = await supertest(app)
                .post('/api/v1/sample')
                .expect(400)
                .expect('Content-Type', /json/);

            const data = response.body;

            expect(data.message).toEqual(expect.any(String));
            expect(data.message).toEqual(
                VALIDATION_ERRORS_SAMPLE.NAME_EMAIL_REQUIRED
            );
        });
    });

    describe('POST /sample -- omit name and email in body', () => {
        it('failure -> status code 400 with validation error message', async () => {
            const payload = {};

            const response = await supertest(app)
                .post('/api/v1/sample')
                .send(payload)
                .expect(400)
                .expect('Content-Type', /json/);

            const data = response.body;

            expect(data.message).toEqual(expect.any(String));
            expect(data.message).toEqual('name is required, email is required');
        });
    });

    describe('POST /sample -- omit name in body', () => {
        it('failure -> status code 400 with validation error message', async () => {
            const payload = { email: 'test@email.com' };

            const response = await supertest(app)
                .post('/api/v1/sample')
                .send(payload)
                .expect(400)
                .expect('Content-Type', /json/);

            const data = response.body;

            expect(data.message).toEqual(expect.any(String));
            expect(data.message).toEqual(
                VALIDATION_ERRORS_SAMPLE.NAME_REQUIRED
            );
        });
    });

    describe('POST /sample -- omit email in body', () => {
        it('failure -> status code 400 with validation error message', async () => {
            const payload = { name: 'Name' };

            const response = await supertest(app)
                .post('/api/v1/sample')
                .send(payload)
                .expect(400)
                .expect('Content-Type', /json/);

            const data = response.body;

            expect(data.message).toEqual(expect.any(String));
            expect(data.message).toEqual(
                VALIDATION_ERRORS_SAMPLE.EMAIL_REQUIRED
            );
        });
    });

    describe('POST /sample -- name too small and valid email', () => {
        it('failure -> status code 400 with validation error message', async () => {
            const payload = { name: 'Na', email: 'test@email.com' };

            const response = await supertest(app)
                .post('/api/v1/sample')
                .send(payload)
                .expect(400)
                .expect('Content-Type', /json/);

            const data = response.body;

            expect(data.message).toEqual(expect.any(String));
            expect(data.message).toEqual(VALIDATION_ERRORS_SAMPLE.NAME_MIN);
        });
    });

    describe('POST /sample -- name too large and valid email', () => {
        it('failure -> status code 400 with validation error message', async () => {
            const payload = {
                name: 'Nasdfsdlfhsdflskdjhfsdfkjsdh',
                email: 'test@email.com',
            };

            const response = await supertest(app)
                .post('/api/v1/sample')
                .send(payload)
                .expect(400)
                .expect('Content-Type', /json/);

            const data = response.body;

            expect(data.message).toEqual(expect.any(String));
            expect(data.message).toEqual(VALIDATION_ERRORS_SAMPLE.NAME_MAX);
        });
    });

    describe('POST /sample -- valid name and invalid email', () => {
        it('failure -> status code 400 with validation error message', async () => {
            const payload = {
                name: 'Name',
                email: 'test',
            };

            const response = await supertest(app)
                .post('/api/v1/sample')
                .send(payload)
                .expect(400)
                .expect('Content-Type', /json/);

            const data = response.body;

            expect(data.message).toEqual(expect.any(String));
            expect(data.message).toEqual(VALIDATION_ERRORS_SAMPLE.EMAIL_VALID);
        });
    });

    describe('POST /sample -- valid name and valid email, but unrecognized field', () => {
        it('failure -> status code 400 with validation error message', async () => {
            const payload = {
                name: 'Name',
                email: 'test@email.com',
                unrecognized: 'value',
            };

            const response = await supertest(app)
                .post('/api/v1/sample')
                .send(payload)
                .expect(400)
                .expect('Content-Type', /json/);

            const data = response.body;

            expect(data.message).toEqual(expect.any(String));
            expect(data.message).toEqual(VALIDATION_ERRORS_SAMPLE.UNRECOGNIZED);
        });
    });

    describe('POST /sample -- name starts with a number, valid email', () => {
        it('failure -> status code 400 with validation error message', async () => {
            const payload = {
                name: '1Name',
                email: 'test@email.com',
            };

            const response = await supertest(app)
                .post('/api/v1/sample')
                .send(payload)
                .expect(400)
                .expect('Content-Type', /json/);

            const data = response.body;

            expect(data.message).toEqual(expect.any(String));
            expect(data.message).toEqual(
                VALIDATION_ERRORS_SAMPLE.NAME_START_ALPHABET
            );
        });
    });

    describe('GET /sample -- after creating a sample', () => {
        it('success -> status code 200 and json with message and samples array', async () => {
            const response = await supertest(app)
                .get('/api/v1/sample')
                .expect(200)
                .expect('Content-Type', /json/);
            // .then((response) => {
            //     expect(response.body).toEqual(
            //         expect.objectContaining({
            //             message: expect.any(String),
            //         })
            //     );
            // });

            const data = response.body;

            expect(data.message).toEqual(expect.any(String));
            expect(data.samples).toStrictEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        id: expect.any(Number),
                        name: expect.any(String),
                        email: expect.any(String),
                    }),
                ])
            );
        });
    });

    describe('PATCH /sample/1 -- valid name', () => {
        it('success -> status code 204', async () => {
            const payload = { name: 'Name' };

            await supertest(app)
                .patch('/api/v1/sample/1')
                .send(payload)
                .expect(204);
        });
    });

    describe('PATCH /sample/1 -- valid email', () => {
        it('success -> status code 204', async () => {
            const payload = { email: 'test@email.com' };

            await supertest(app)
                .patch('/api/v1/sample/1')
                .send(payload)
                .expect(204);
        });
    });

    describe('PATCH /sample/1 -- valid name and valid email', () => {
        it('success -> status code 204', async () => {
            const payload = { name: 'Name', email: 'test@email.com' };

            await supertest(app)
                .patch('/api/v1/sample/1')
                .send(payload)
                .expect(204);
        });
    });

    describe('PATCH /sample/1 -- omit body', () => {
        it('failure -> status code 400 with validation error message', async () => {
            const response = await supertest(app)
                .patch('/api/v1/sample/1')
                .expect(400);

            const data = response.body;

            expect(data.message).toEqual(expect.any(String));
            expect(data.message).toEqual(
                VALIDATION_ERRORS_SAMPLE.ONE_FIELD_REQUIRED
            );
        });
    });

    describe('PATCH /sample/1 -- omit name and email', () => {
        it('failure -> status code 400 with validation error message', async () => {
            const payload = {};

            const response = await supertest(app)
                .patch('/api/v1/sample/1')
                .send(payload)
                .expect(400);

            const data = response.body;

            expect(data.message).toEqual(expect.any(String));
            expect(data.message).toEqual(
                VALIDATION_ERRORS_SAMPLE.ONE_FIELD_REQUIRED
            );
        });
    });
});
