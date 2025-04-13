import supertest from 'supertest';
import { expect, jest, test, describe, it } from '@jest/globals';
import app from '../src/app';

describe('API sample', () => {
    describe('GET /sample', () => {
        it('success -> json with message sampleGetController', async () => {
            return supertest(app)
                .get('/sample')
                .expect(200)
                .expect('Content-Type', /json/)
                .then((response) => {
                    expect(response.body).toEqual(
                        expect.objectContaining({ message: expect.any(String) })
                    );
                });
        });
    });

    describe('POST /sample', () => {
        it('success -> json with message samplePostController', async () => {
            return supertest(app)
                .post('/sample')
                .expect(201)
                .expect('Content-Type', /json/)
                .then((response) => {
                    expect(response.body).toEqual(
                        expect.objectContaining({
                            message: expect.any(String),
                        })
                    );
                });
        });
    });

    describe('PATCH /sample/sampleId', () => {
        it('success -> json with message samplePatchController', async () => {
            return supertest(app).patch('/sample/sampleId').expect(204);
        });
    });
});
