const request = require('supertest');
const mongoose = require('mongoose');

// We need to set SKIP_DB to true to avoid connecting to the real DB during tests
// unless we want integration tests with a test DB. For now, let's skip DB.
process.env.SKIP_DB = 'true';

const app = require('../app');

describe('GET /', () => {
    it('should redirect to /profile', async () => {
        const res = await request(app).get('/');
        expect(res.statusCode).toEqual(302);
        expect(res.headers.location).toBe('/profile');
    });
});

describe('GET /profile', () => {
    it('should return 200 and render profile page', async () => {
        const res = await request(app).get('/profile');
        expect(res.statusCode).toEqual(200);
        expect(res.text).toContain('Adityapratap Resume'); // From layout title
    });
});

afterAll(async () => {
    // Close mongoose connection if any (though we skipped it)
    await mongoose.connection.close();
});
