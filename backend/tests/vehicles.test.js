const request = require('supertest');
const app = require('../src/app');
const db = require('../src/database');
const jwt = require('jsonwebtoken');

const JWT_SECRET =
    process.env.JWT_SECRET || 'development-secret-change-before-deployment';

describe('Vehicle API', () => {
    let userToken;
    let adminToken;

    beforeEach(() => {
        db.prepare('DELETE FROM vehicles').run();
        db.prepare('DELETE FROM users').run();

        const userResult = db.prepare(`
            INSERT INTO users (name, email, password, role)
            VALUES (?, ?, ?, ?)
        `).run('Normal User', 'user@example.com', 'hashed-password', 'user');

        const adminResult = db.prepare(`
            INSERT INTO users (name, email, password, role)
            VALUES (?, ?, ?, ?)
        `).run('Admin User', 'admin@example.com', 'hashed-password', 'admin');

        userToken = jwt.sign(
            { id: userResult.lastInsertRowid, role: 'user' },
            JWT_SECRET
        );

        adminToken = jwt.sign(
            { id: adminResult.lastInsertRowid, role: 'admin' },
            JWT_SECRET
        );
    });

    test('should reject listing vehicles without a token', async () => {
        const response = await request(app).get('/api/vehicles');

        expect(response.status).toBe(401);
        expect(response.body.message).toBe('Authentication required');
    });

    test('should allow an authenticated user to list vehicles', async () => {
        const response = await request(app)
            .get('/api/vehicles')
            .set('Authorization', `Bearer ${userToken}`);

        expect(response.status).toBe(200);
        expect(response.body).toEqual([]);
    });

    test('should allow an admin to add a vehicle', async () => {
        const response = await request(app)
            .post('/api/vehicles')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                make: 'Toyota',
                model: 'Corolla',
                category: 'Sedan',
                price: 20000,
                quantity: 5
            });

        expect(response.status).toBe(201);
        expect(response.body.make).toBe('Toyota');
        expect(response.body.quantity).toBe(5);
    });

    test('should reject a normal user trying to add a vehicle', async () => {
        const response = await request(app)
            .post('/api/vehicles')
            .set('Authorization', `Bearer ${userToken}`)
            .send({
                make: 'Honda',
                model: 'City',
                category: 'Sedan',
                price: 18000,
                quantity: 3
            });

        expect(response.status).toBe(403);
        expect(response.body.message).toBe('Admin access required');
    });

    test('should reject a vehicle with a negative price', async () => {
        const response = await request(app)
            .post('/api/vehicles')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                make: 'Toyota',
                model: 'Corolla',
                category: 'Sedan',
                price: -100,
                quantity: 5
            });

        expect(response.status).toBe(400);
    });

    test('should reduce quantity when purchasing a vehicle', async () => {
        const result = db.prepare(`
            INSERT INTO vehicles (make, model, category, price, quantity)
            VALUES (?, ?, ?, ?, ?)
        `).run('Toyota', 'Corolla', 'Sedan', 20000, 5);

        const response = await request(app)
            .post(`/api/vehicles/${result.lastInsertRowid}/purchase`)
            .set('Authorization', `Bearer ${userToken}`);

        expect(response.status).toBe(200);
        expect(response.body.vehicle.quantity).toBe(4);
    });

    test('should prevent purchasing a vehicle when stock is zero', async () => {
        const result = db.prepare(`
            INSERT INTO vehicles (make, model, category, price, quantity)
            VALUES (?, ?, ?, ?, ?)
        `).run('Toyota', 'Corolla', 'Sedan', 20000, 0);

        const response = await request(app)
            .post(`/api/vehicles/${result.lastInsertRowid}/purchase`)
            .set('Authorization', `Bearer ${userToken}`);

        expect(response.status).toBe(409);
        expect(response.body.message).toBe('Vehicle is out of stock');
    });

    test('should allow an admin to restock a vehicle', async () => {
        const result = db.prepare(`
            INSERT INTO vehicles (make, model, category, price, quantity)
            VALUES (?, ?, ?, ?, ?)
        `).run('Toyota', 'Corolla', 'Sedan', 20000, 2);

        const response = await request(app)
            .post(`/api/vehicles/${result.lastInsertRowid}/restock`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ quantity: 3 });

        expect(response.status).toBe(200);
        expect(response.body.vehicle.quantity).toBe(5);
    });
});