const request = require('supertest');
const app = require('../src/app');

describe('User Registration API', () => {
    test('should reject registration when required fields are missing', async () => {
        const response = await request(app)
            .post('/api/auth/register')
            .send({
                email: 'test@example.com'
            });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe(
            'Name, email and password are required'
        );
    });

    test('should register a new user', async () => {
        const response = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Test User',
                email: 'test@example.com',
                password: 'Password123!'
            });

        expect(response.status).toBe(201);
        expect(response.body.message).toBe(
            'User registered successfully'
        );
    });
});