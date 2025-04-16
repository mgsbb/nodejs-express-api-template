import supertest from 'supertest';
import { expect, describe, it, beforeAll, afterAll } from '@jest/globals';
import app from '../src/app';
import { setupTestDatabase, teardownTestDatabase } from './setup';

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
                .get('/sample')
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

    describe('POST /sample', () => {
        it('success -> json with message and createdSample', async () => {
            const payload = { name: 'testName', email: 'test@email.com' };

            const response = await supertest(app)
                .post('/sample')
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

    describe('GET /sample -- after creating a sample', () => {
        it('success -> json with message and empty samples array', async () => {
            const response = await supertest(app)
                .get('/sample')
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

    describe('PATCH /sample/sampleId', () => {
        it('success -> json with message samplePatchController', async () => {
            await supertest(app).patch('/sample/sampleId').expect(204);
        });
    });
});
