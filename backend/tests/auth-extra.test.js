const request = require('supertest');
const app = require('../src/app');
const db = require('../src/database');

describe('Authentication validation', () => {
    beforeEach(() => {
        db.prepare('DELETE FROM users').run();
    });

    test('should reject a password shorter than 8 characters', async () => {
        const response = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Test User',
                email: 'short@example.com',
                password: '123'
            });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe(
            'Password must be at least 8 characters'
        );
    });

    test('should reject duplicate email registration', async () => {
        const user = {
            name: 'Test User',
            email: 'duplicate@example.com',
            password: 'Password123!'
        };

        await request(app).post('/api/auth/register').send(user);

        const response = await request(app)
            .post('/api/auth/register')
            .send(user);

        expect(response.status).toBe(409);
        expect(response.body.message).toBe('Email already registered');
    });

    test('should log in with valid credentials', async () => {
        const user = {
            name: 'Test User',
            email: 'login@example.com',
            password: 'Password123!'
        };

        await request(app).post('/api/auth/register').send(user);

        const response = await request(app)
            .post('/api/auth/login')
            .send({
                email: user.email,
                password: user.password
            });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Login successful');
        expect(response.body.token).toBeDefined();
    });

    test('should reject an incorrect password', async () => {
        const user = {
            name: 'Test User',
            email: 'wrongpass@example.com',
            password: 'Password123!'
        };

        await request(app).post('/api/auth/register').send(user);

        const response = await request(app)
            .post('/api/auth/login')
            .send({
                email: user.email,
                password: 'WrongPassword123!'
            });

        expect(response.status).toBe(401);
        expect(response.body.message).toBe('Invalid email or password');
    });
});