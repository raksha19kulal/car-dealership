const express = require('express');
const db = require('./database');
const { authenticateToken, requireAdmin } = require('./middleware');

const router = express.Router();

router.use(authenticateToken);

// GET /api/vehicles - List all vehicles
router.get('/', (req, res) => {
    const vehicles = db.prepare(
        'SELECT * FROM vehicles ORDER BY id'
    ).all();

    res.json(vehicles);
});

// GET /api/vehicles/search - Search vehicles
router.get('/search', (req, res) => {
    const { make, model, category, minPrice, maxPrice } = req.query;

    let sql = 'SELECT * FROM vehicles WHERE 1 = 1';
    const params = [];

    if (make) {
        sql += ' AND make LIKE ?';
        params.push(`%${make}%`);
    }

    if (model) {
        sql += ' AND model LIKE ?';
        params.push(`%${model}%`);
    }

    if (category) {
        sql += ' AND category LIKE ?';
        params.push(`%${category}%`);
    }

    if (minPrice !== undefined) {
        sql += ' AND price >= ?';
        params.push(Number(minPrice));
    }

    if (maxPrice !== undefined) {
        sql += ' AND price <= ?';
        params.push(Number(maxPrice));
    }

    const vehicles = db.prepare(sql).all(...params);
    res.json(vehicles);
});

// POST /api/vehicles - Add vehicle (admin only)
router.post('/', requireAdmin, (req, res) => {
    const { make, model, category, price, quantity } = req.body;

    if (
        !make || !model || !category ||
        price === undefined || quantity === undefined ||
        !Number.isFinite(price) || price < 0 ||
        !Number.isInteger(quantity) || quantity < 0
    ) {
        return res.status(400).json({
            message: 'Valid make, model, category, price and quantity are required'
        });
    }

    const result = db.prepare(`
        INSERT INTO vehicles (make, model, category, price, quantity)
        VALUES (?, ?, ?, ?, ?)
    `).run(make.trim(), model.trim(), category.trim(), price, quantity);

    const vehicle = db.prepare(
        'SELECT * FROM vehicles WHERE id = ?'
    ).get(result.lastInsertRowid);

    res.status(201).json(vehicle);
});

// PUT /api/vehicles/:id - Update vehicle details
router.put('/:id', requireAdmin, (req, res) => {
    const { make, model, category, price, quantity } = req.body;

    const existing = db.prepare(
        'SELECT * FROM vehicles WHERE id = ?'
    ).get(req.params.id);

    if (!existing) {
        return res.status(404).json({
            message: 'Vehicle not found'
        });
    }

    const updated = {
        make: make ?? existing.make,
        model: model ?? existing.model,
        category: category ?? existing.category,
        price: price ?? existing.price,
        quantity: quantity ?? existing.quantity
    };

    if (
        typeof updated.make !== 'string' || !updated.make.trim() ||
        typeof updated.model !== 'string' || !updated.model.trim() ||
        typeof updated.category !== 'string' || !updated.category.trim() ||
        typeof updated.price !== 'number' || !Number.isFinite(updated.price) || updated.price < 0 ||
        !Number.isInteger(updated.quantity) || updated.quantity < 0
    ) {
        return res.status(400).json({
            message: 'Invalid vehicle details'
        });
    }

    db.prepare(`
        UPDATE vehicles
        SET make = ?, model = ?, category = ?, price = ?, quantity = ?
        WHERE id = ?
    `).run(
        updated.make.trim(),
        updated.model.trim(),
        updated.category.trim(),
        updated.price,
        updated.quantity,
        req.params.id
    );

    const vehicle = db.prepare(
        'SELECT * FROM vehicles WHERE id = ?'
    ).get(req.params.id);

    res.json(vehicle);
});

// DELETE /api/vehicles/:id - Delete vehicle (admin only)
router.delete('/:id', requireAdmin, (req, res) => {
    const result = db.prepare(
        'DELETE FROM vehicles WHERE id = ?'
    ).run(req.params.id);

    if (result.changes === 0) {
        return res.status(404).json({
            message: 'Vehicle not found'
        });
    }

    res.json({ message: 'Vehicle deleted successfully' });
});

// POST /api/vehicles/:id/purchase - Purchase one vehicle
router.post('/:id/purchase', (req, res) => {
    const result = db.prepare(`
        UPDATE vehicles
        SET quantity = quantity - 1
        WHERE id = ? AND quantity > 0
    `).run(req.params.id);

    if (result.changes === 0) {
        const vehicle = db.prepare(
            'SELECT * FROM vehicles WHERE id = ?'
        ).get(req.params.id);

        if (!vehicle) {
            return res.status(404).json({
                message: 'Vehicle not found'
            });
        }

        return res.status(409).json({
            message: 'Vehicle is out of stock'
        });
    }

    const vehicle = db.prepare(
        'SELECT * FROM vehicles WHERE id = ?'
    ).get(req.params.id);

    res.json({
        message: 'Vehicle purchased successfully',
        vehicle
    });
});

// POST /api/vehicles/:id/restock - Restock vehicle (admin only)
router.post('/:id/restock', requireAdmin, (req, res) => {
    const { quantity } = req.body;

    if (!Number.isInteger(quantity) || quantity <= 0) {
        return res.status(400).json({
            message: 'Restock quantity must be a positive integer'
        });
    }

    const result = db.prepare(`
        UPDATE vehicles
        SET quantity = quantity + ?
        WHERE id = ?
    `).run(quantity, req.params.id);

    if (result.changes === 0) {
        return res.status(404).json({
            message: 'Vehicle not found'
        });
    }

    const vehicle = db.prepare(
        'SELECT * FROM vehicles WHERE id = ?'
    ).get(req.params.id);

    res.json({
        message: 'Vehicle restocked successfully',
        vehicle
    });
});

module.exports = router;